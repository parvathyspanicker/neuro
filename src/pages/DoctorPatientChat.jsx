import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPaperPlane, FaComments, FaImage, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaStop, FaTimes, FaFileAlt, FaDownload, FaFilePdf, FaFileWord, FaFile } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';

export default function DoctorPatientChat() {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [activePatientId, setActivePatientId] = useState('');
  const [messages, setMessages] = useState({}); // { [patientId]: [{ id, from, text, time, seenAt }] }
  const [draft, setDraft] = useState('');
  const [presence, setPresence] = useState({}); // { userId: { online, lastSeen } }

  const endRef = useRef(null);
  const socketRef = useRef(null);
  const typingRef = useRef({});
  const [typingMap, setTypingMap] = useState({}); // { userId: boolean }
  const messageIdsRef = useRef(new Set());
  const fileInputRef = useRef(null);
  const [showCall, setShowCall] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const isCallingRef = useRef(false);
  const [muted, setMuted] = useState(false);
  const [videoDisabled, setVideoDisabled] = useState(false);
  const titleBlinkRef = useRef({ timer: null, original: document.title });
  const ringTimeoutRef = useRef(null);
  const startTitleBlink = (text = 'Incoming call…') => {
    if (titleBlinkRef.current.timer) return;
    titleBlinkRef.current.original = document.title;
    let toggle = false;
    titleBlinkRef.current.timer = setInterval(() => {
      document.title = toggle ? titleBlinkRef.current.original : text;
      toggle = !toggle;
    }, 800);
  };
  const stopTitleBlink = () => {
    if (titleBlinkRef.current.timer) {
      clearInterval(titleBlinkRef.current.timer);
      titleBlinkRef.current.timer = null;
      document.title = titleBlinkRef.current.original;
    }
  };
  const buildIceServers = () => {
    const url = import.meta.env.VITE_TURN_URL;
    const username = import.meta.env.VITE_TURN_USERNAME;
    const credential = import.meta.env.VITE_TURN_CREDENTIAL;
    const servers = [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ];
    if (url && username && credential) {
      servers.push({ urls: url, username, credential });
    }
    return servers;
  };
  const [incomingCall, setIncomingCall] = useState(null); // { fromUserId, sdp }
  const pendingIceRef = useRef([]);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const [imagePreview, setImagePreview] = useState(null); // { url, file }
  const [loadingMedia, setLoadingMedia] = useState(false);
  const docInputRef = useRef(null);
  const [docPreview, setDocPreview] = useState(null); // { file, name, size, type }

  useEffect(() => {
    if (!authChecked) return;
    const load = async () => {
      const res = await mongodbService.listPatients('');
      let list = res.data || [];
      if (!list.length) {
        // Fallback: build from doctor appointments
        try {
          const ap = await mongodbService.doctorListAppointments();
          const uniq = new Map();
          (ap.data || []).forEach(a => {
            if (a.patient) uniq.set(String(a.patient.id), { id: String(a.patient.id), name: a.patient.name, email: a.patient.email, avatar: '' });
          });
          list = Array.from(uniq.values());
        } catch (e) {
          // ignore
        }
      }
      setPatients(list);
      if (list.length && !activePatientId) setActivePatientId(String(list[0].id));
    };
    load();
  }, [authChecked]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('mongodb_token');
    const baseUrl = (import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002/api').replace('/api', '');
    const socket = io(baseUrl, { auth: { token } });
    socketRef.current = socket;
    socket.on('presence', ({ userId, online, lastSeen }) => {
      setPresence(prev => ({ ...prev, [String(userId)]: { online, lastSeen } }));
    });
    socket.on('message', (msg) => {
      // Ignore echo of my own message (we already added optimistic copy)
      if (String(msg.fromUserId) === String(user._id)) return;
      if (messageIdsRef.current.has(String(msg.id))) return;
      messageIdsRef.current.add(String(msg.id));
      const otherId = String(msg.fromUserId === user._id ? msg.toUserId : msg.fromUserId);
      setMessages(prev => ({ ...prev, [otherId]: [...(prev[otherId] || []), { id: msg.id, from: msg.fromUserId === user._id ? 'me' : 'them', text: msg.text, time: msg.createdAt, seenAt: msg.seenAt, mediaUrl: msg.mediaUrl, mediaType: msg.mediaType }] }));
      // If this patient isn't in list, surface them
      setPatients(prev => {
        if (prev.some(p => String(p.id) === otherId)) return prev;
        const newItem = { id: otherId, name: 'New patient', email: '', avatar: '' };
        return [newItem, ...prev];
      });
      // If nothing selected, auto-select this patient
      setActivePatientId(curr => curr || otherId);
    });
    socket.on('typing', ({ fromUserId, typing }) => {
      setTypingMap(prev => ({ ...prev, [String(fromUserId)]: Boolean(typing) }));
    });
    return () => { socket.disconnect(); };
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePatientId, messages]);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p => [p.name, p.email].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [search, patients]);

  const activePatient = patients.find(p => String(p.id) === String(activePatientId));
  const activeMsgs = messages[activePatientId] || [];

  const send = async () => {
    const text = draft.trim();
    if (!text || !activePatientId) return;
    const tempId = 'temp-' + Date.now();
    const tempMsg = { id: tempId, from: 'me', text, time: new Date().toISOString() };
    messageIdsRef.current.add(String(tempId));
    setMessages(prev => ({ ...prev, [activePatientId]: [...(prev[activePatientId] || []), tempMsg] }));
    setDraft('');
    socketRef.current?.emit('join_conversation', { withUserId: activePatientId });
    socketRef.current?.emit('send_message', { toUserId: activePatientId, text });
    await mongodbService.sendMessage(activePatientId, text);
  };

  const onPickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activePatientId) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview({ url: reader.result, file });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendImage = async () => {
    if (!imagePreview || !activePatientId) return;
    setLoadingMedia(true);

    // Add optimistic local message
    const tempId = 'temp-img-' + Date.now();
    const tempMsg = {
      id: tempId,
      from: 'me',
      text: '',
      mediaUrl: imagePreview.url,
      mediaType: 'image',
      time: new Date().toISOString()
    };
    setMessages(prev => ({ ...prev, [activePatientId]: [...(prev[activePatientId] || []), tempMsg] }));

    try {
      const up = await mongodbService.uploadMedia(imagePreview.url, 'image');
      if (up.data?.url) {
        await mongodbService.sendMediaMessage(activePatientId, up.data.url, 'image');
      }
      setImagePreview(null);
    } catch (err) {
      alert('Failed to send image');
      // remove optimistic message on failure
      setMessages(prev => ({
        ...prev,
        [activePatientId]: (prev[activePatientId] || []).filter(m => m.id !== tempId)
      }));
    } finally {
      setLoadingMedia(false);
    }
  };

  const onPickDocument = (e) => {
    const file = e.target.files?.[0];
    if (!file || !activePatientId) return;
    setDocPreview({ file, name: file.name, size: file.size, type: file.type });
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const sendDocument = async () => {
    if (!docPreview || !activePatientId) return;
    setLoadingMedia(true);
    const tempId = 'temp-doc-' + Date.now();
    const tempMsg = {
      id: tempId, from: 'me', text: '', mediaUrl: '#', mediaType: 'document',
      fileName: docPreview.name, fileSize: docPreview.size,
      time: new Date().toISOString()
    };
    setMessages(prev => ({ ...prev, [activePatientId]: [...(prev[activePatientId] || []), tempMsg] }));
    try {
      const reader = new FileReader();
      const dataUri = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(docPreview.file);
      });
      const up = await mongodbService.uploadMedia(dataUri, 'raw');
      if (up.data?.url) {
        // For local uploads, prepend backend base URL
        let docUrl = up.data.url;
        if (docUrl.startsWith('/uploads')) {
          const base = (import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002/api').replace('/api', '');
          docUrl = base + docUrl;
        }
        const text = `📄 ${docPreview.name}`;
        await mongodbService.sendMediaMessage(activePatientId, docUrl, 'document', text);
        setMessages(prev => ({
          ...prev, [activePatientId]: (prev[activePatientId] || []).map(m =>
            m.id === tempId ? { ...m, mediaUrl: docUrl } : m
          )
        }));
      } else {
        throw new Error('Upload failed');
      }
      setDocPreview(null);
    } catch (err) {
      alert('Failed to send document: ' + (err?.message || 'Unknown error'));
      setMessages(prev => ({ ...prev, [activePatientId]: (prev[activePatientId] || []).filter(m => m.id !== tempId) }));
    } finally {
      setLoadingMedia(false);
    }
  };

  const getDocIcon = (name) => {
    if (!name) return FaFile;
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return FaFilePdf;
    if (['doc', 'docx'].includes(ext)) return FaFileWord;
    return FaFile;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const startRecording = async () => {
    if (!activePatientId) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUri = reader.result;

          // Optimistic update
          const tempId = 'temp-audio-' + Date.now();
          const tempUrl = URL.createObjectURL(audioBlob);
          const tempMsg = {
            id: tempId,
            from: 'me',
            text: '',
            mediaUrl: tempUrl,
            mediaType: 'audio',
            time: new Date().toISOString()
          };
          setMessages(prev => ({ ...prev, [activePatientId]: [...(prev[activePatientId] || []), tempMsg] }));

          const up = await mongodbService.uploadMedia(dataUri, 'auto');
          if (up.data?.url) {
            await mongodbService.sendMediaMessage(activePatientId, up.data.url, 'audio');
          } else {
            // remove if failed
            setMessages(prev => ({
              ...prev,
              [activePatientId]: (prev[activePatientId] || []).filter(m => m.id !== tempId)
            }));
            alert('Failed to send audio: ' + (up.error?.message || 'Unknown error'));
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // WebRTC helpers
  const ensurePeer = async () => {
    if (pcRef.current && (pcRef.current.signalingState === 'closed' || pcRef.current.connectionState === 'failed' || pcRef.current.connectionState === 'closed')) {
      try { pcRef.current.close(); } catch { }
      pcRef.current = null;
    }
    if (!pcRef.current) {
      pcRef.current = new RTCPeerConnection({ iceServers: buildIceServers() });
      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) socketRef.current?.emit('call_signal', { withUserId: activePatientId, data: { candidate: e.candidate } });
      };
      pcRef.current.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pcRef.current.onconnectionstatechange = () => {
        const s = pcRef.current?.connectionState;
        if (s === 'failed' || s === 'disconnected' || s === 'closed') {
          // No-op; recreate on next action
        }
      };
    }
    return pcRef.current;
  };

  const startCall = async () => {
    if (!activePatientId) return;
    if (isCallingRef.current) return;
    isCallingRef.current = true;
    setShowCall(true);
    let pc = await ensurePeer();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (err) {
      alert(`[Runtime error] ${err?.message || 'Unable to access camera/microphone'}`);
      isCallingRef.current = false;
      return;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    if (pc.signalingState === 'closed') {
      try { pc.close(); } catch { }
      pcRef.current = null;
      pc = await ensurePeer();
    }
    try {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    } catch (e) {
      // recreate and retry once
      try { pc.close(); } catch { }
      pcRef.current = null;
      pc = await ensurePeer();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }
    socketRef.current?.emit('call_join', { withUserId: activePatientId });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('call_signal', { withUserId: activePatientId, data: { sdp: offer } });
    isCallingRef.current = false;
  };

  const endCall = () => {
    setShowCall(false);
    socketRef.current?.emit('call_end', { withUserId: activePatientId });
    if (pcRef.current) {
      pcRef.current.getSenders().forEach(s => s.track && s.track.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    setIncomingCall(null);
    pendingIceRef.current = [];
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleSignal = async ({ fromUserId, data }) => {
      if (String(fromUserId) !== String(activePatientId)) return;
      if (data.sdp && data.sdp.type === 'offer') {
        setIncomingCall({ fromUserId, sdp: data.sdp });
        try {
          if (Notification && Notification.permission === 'granted') {
            new Notification('Incoming call', { body: 'Click to answer', silent: false }).onclick = () => { window.focus(); };
          } else if (Notification && Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        } catch { }
        startTitleBlink('🔔 Incoming call…');
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = setTimeout(() => {
          if (incomingCall) {
            const otherId = String(activePatientId);
            setMessages(prev => ({
              ...prev,
              [otherId]: [
                ...(prev[otherId] || []),
                { id: 'missed-' + Date.now(), from: 'them', text: 'Missed video call', time: new Date().toISOString() }
              ]
            }));
            setIncomingCall(null);
            stopTitleBlink();
          }
        }, 30000);
        return;
      }
      const pc = await ensurePeer();
      if (data.sdp && data.sdp.type !== 'offer') {
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        while (pendingIceRef.current.length) {
          const cand = pendingIceRef.current.shift();
          try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch { }
        }
      } else if (data.candidate) {
        if (pc.currentRemoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch { }
        } else {
          pendingIceRef.current.push(data.candidate);
        }
      }
    };
    const handlePeerJoined = () => { /* optional */ };
    const handleEnded = () => endCall();
    socket.on('call_signal', handleSignal);
    socket.on('call_peer_joined', handlePeerJoined);
    socket.on('call_ended', handleEnded);
    socket.on('call_missed', ({ fromUserId }) => {
      try { if (Notification && Notification.permission === 'granted') new Notification('Missed video call'); } catch { }
      startTitleBlink('❌ Missed call');
      setTimeout(() => stopTitleBlink(), 4000);
    });
    return () => {
      socket.off('call_signal', handleSignal);
      socket.off('call_peer_joined', handlePeerJoined);
      socket.off('call_ended', handleEnded);
      socket.off('call_missed');
    };
  }, [activePatientId]);

  const onDraftChange = (val) => {
    setDraft(val);
    if (!activePatientId) return;
    // throttle typing emits
    if (!typingRef.current.timeout) {
      socketRef.current?.emit('typing', { toUserId: activePatientId, typing: true });
      typingRef.current.timeout = setTimeout(() => {
        socketRef.current?.emit('typing', { toUserId: activePatientId, typing: false });
        typingRef.current.timeout = null;
      }, 1500);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!activePatientId) return;
      const { data } = await mongodbService.fetchMessages(activePatientId);
      const msgs = (data?.messages || []).map(m => ({ id: m.id, from: m.fromUserId === user?._id ? 'me' : 'them', text: m.text, time: m.createdAt, seenAt: m.seenAt, mediaUrl: m.mediaUrl, mediaType: m.mediaType }));
      setMessages(prev => ({ ...prev, [activePatientId]: msgs }));
      socketRef.current?.emit('join_conversation', { withUserId: activePatientId });
      if (data?.conversationId) socketRef.current?.emit('mark_seen', { conversationId: data.conversationId });
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePatientId]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2"><FaComments /> Patient Chat</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/doctor-dashboard')} className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Dashboard</button>
            <button onClick={() => navigate('/doctor-appointments')} className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50">Appointments</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <aside className="md:col-span-4 border border-gray-200 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search patients" className="w-full border rounded-lg pl-9 pr-3 py-2" />
              </div>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {filteredPatients.map(p => (
                <button key={p.id} onClick={() => setActivePatientId(String(p.id))} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${String(activePatientId) === String(p.id) ? 'bg-blue-50' : ''}`}>
                  <img src={p.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(p.name || 'Patient')} alt={p.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{p.name || p.email}</div>
                    <div className="text-xs text-gray-500 truncate">{presence[String(p.id)]?.online ? 'Online' : 'Offline'}</div>
                  </div>
                </button>
              ))}
              {filteredPatients.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">No patients found</div>
              )}
            </div>
          </aside>

          <section className="md:col-span-8 border border-gray-200 rounded-2xl flex flex-col h-[80vh]">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
              {activePatient ? (
                <>
                  <img src={activePatient.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(activePatient.name || 'Patient')} alt={activePatient.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{activePatient.name || activePatient.email}</div>
                    <div className="text-xs text-gray-500 truncate">{presence[String(activePatient.id)]?.online ? 'Online' : 'Offline'}</div>
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Select a patient to start chatting</div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2]">
              <div className="space-y-2 max-w-2xl mx-auto">
                {activeMsgs.map(m => (
                  <div key={m.id} className={`w-full flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-3 py-2 rounded-lg shadow text-sm max-w-[75%] ${m.from === 'me' ? 'bg-[#dcf8c6] text-gray-900 rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                      {m.mediaUrl ? (
                        m.mediaType === 'audio' ? (
                          <audio controls src={m.mediaUrl} className="max-w-xs" />
                        ) : m.mediaType === 'document' ? (
                          <a href={m.mediaUrl !== '#' ? m.mediaUrl : undefined} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 rounded-lg bg-white/50 border border-gray-200 hover:bg-gray-50 transition min-w-[200px]">
                            {(() => { const DocIcon = getDocIcon(m.fileName || m.text); return <DocIcon className="text-2xl text-red-500 flex-shrink-0" />; })()}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-gray-800 truncate">{m.fileName || m.text || 'Document'}</p>
                              {m.fileSize && <p className="text-[10px] text-gray-400">{formatFileSize(m.fileSize)}</p>}
                            </div>
                            {m.mediaUrl !== '#' && <FaDownload className="text-gray-400 text-xs flex-shrink-0" />}
                          </a>
                        ) : (
                          <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                            <img src={m.mediaUrl} alt="attachment" className="max-w-xs rounded" />
                          </a>
                        )
                      ) : (
                        <div>{m.text}</div>
                      )}
                      <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 justify-end">
                        {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {m.from === 'me' && (
                          <span className={`ml-1 ${m.seenAt ? 'text-blue-500' : 'text-gray-400'}`}>✔✔</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {typingMap[String(activePatientId)] && (
                  <div className="w-full flex justify-start">
                    <div className="px-3 py-2 rounded-lg shadow text-sm bg-white text-gray-900 rounded-bl-none inline-flex items-center gap-1">
                      <span className="animate-bounce">•</span>
                      <span className="animate-bounce [animation-delay:150ms]">•</span>
                      <span className="animate-bounce [animation-delay:300ms]">•</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
                {!activeMsgs.length && activePatient && (
                  <div className="text-center text-xs text-gray-700 bg-white rounded-lg px-3 py-2 inline-block mx-auto">Say hello to {activePatient.name || 'your patient'}</div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.csv,.ppt,.pptx,.zip,.rar" className="hidden" onChange={onPickDocument} />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50" title="Send Image"><FaImage /></button>
                <button onClick={() => docInputRef.current?.click()} className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50" title="Send Document"><FaFileAlt /></button>
                <button
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`p-2 rounded-full border ${isRecording ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  <FaMicrophone />
                </button>
                <button onClick={startCall} className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"><FaVideo /></button>
                <input
                  value={draft}
                  onChange={e => onDraftChange(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Type a message"
                  className="flex-1 border rounded-full px-4 py-2"
                />
                <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2">
                  <FaPaperPlane />
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      {imagePreview && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full shadow-2xl relative">
            <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Preview Image</h3>
              <button onClick={() => setImagePreview(null)} className="text-gray-500 hover:text-gray-800">
                <FaTimes />
              </button>
            </div>
            <div className="p-4 flex justify-center bg-gray-900">
              <img src={imagePreview.url} alt="Preview" className="max-h-[60vh] object-contain" />
            </div>
            <div className="p-4 bg-white flex justify-end gap-3">
              <button
                onClick={() => setImagePreview(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendImage}
                disabled={loadingMedia}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                {loadingMedia ? 'Sending...' : 'Send'}
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
      {docPreview && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-md w-full shadow-2xl relative">
            <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Send Document</h3>
              <button onClick={() => setDocPreview(null)} className="text-gray-500 hover:text-gray-800">
                <FaTimes />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center gap-3">
              {(() => { const DocIcon = getDocIcon(docPreview.name); return <DocIcon className="text-5xl text-red-500" />; })()}
              <p className="text-sm font-medium text-gray-800 text-center break-all">{docPreview.name}</p>
              <p className="text-xs text-gray-400">{formatFileSize(docPreview.size)}</p>
            </div>
            <div className="p-4 bg-white flex justify-end gap-3 border-t">
              <button onClick={() => setDocPreview(null)} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={sendDocument} disabled={loadingMedia} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                {loadingMedia ? 'Sending...' : 'Send'}
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
      {showCall && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          {/* Main Remote Video */}
          <video
            ref={remoteVideoRef}
            itemProp="remoteVideo"
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Header Overlay */}
          <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent text-white z-10">
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold tracking-wide shadow-black drop-shadow-md">
                {activePatient?.name || activePatient?.email || 'Patient'}
              </h2>
              <p className="text-sm opacity-80 mt-1">
                {remoteVideoRef.current && remoteVideoRef.current.srcObject ? '00:00' : 'Connecting...'}
              </p>
            </div>
          </div>

          {/* Local Video PIP */}
          <div className="absolute bottom-32 right-6 w-36 h-56 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
          </div>

          {/* Controls Bar */}
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center z-30">
            <div className="flex items-center gap-8 px-8 py-5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl">
              {/* Mute Toggle */}
              <button
                onClick={() => {
                  if (localVideoRef.current?.srcObject) {
                    const track = localVideoRef.current.srcObject.getAudioTracks()[0];
                    if (track) {
                      track.enabled = !track.enabled;
                      setMuted(!track.enabled);
                    }
                  }
                }}
                className={`p-4 rounded-full transition-all active:scale-95 ${muted ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {muted ? <FaMicrophoneSlash className="text-2xl" /> : <FaMicrophone className="text-2xl" />}
              </button>

              {/* End Call - Prominent Red Button */}
              <button
                onClick={endCall}
                className="p-5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 transition-all transform hover:scale-110 active:scale-95"
              >
                <FaPhoneSlash className="text-3xl" />
              </button>

              {/* Camera Toggle */}
              <button
                onClick={() => {
                  if (localVideoRef.current?.srcObject) {
                    const track = localVideoRef.current.srcObject.getVideoTracks()[0];
                    if (track) {
                      track.enabled = !track.enabled;
                      setVideoDisabled(!track.enabled);
                    }
                  }
                }}
                className={`p-4 rounded-full transition-all active:scale-95 ${videoDisabled ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {videoDisabled ? <FaVideoSlash className="text-2xl" /> : <FaVideo className="text-2xl" />}
              </button>
            </div>
          </div>
        </div>
      )}
      {!showCall && incomingCall && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 z-50 flex items-center gap-3">
          <div className="font-medium">Incoming call…</div>
          <button onClick={async () => {
            if (!incomingCall) return;
            setShowCall(true);
            const pc = await ensurePeer();
            socketRef.current?.emit('call_join', { withUserId: activePatientId });
            await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.sdp));
            let stream;
            try {
              stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (err) {
              alert(`[Runtime error] ${err?.message || 'Unable to access camera/microphone'}`);
              return;
            }
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            stream.getTracks().forEach(t => pc.addTrack(t, stream));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit('call_signal', { withUserId: activePatientId, data: { sdp: answer } });
            while (pendingIceRef.current.length) {
              const cand = pendingIceRef.current.shift();
              try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch { }
            }
            setIncomingCall(null);
          }} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
          <button onClick={() => { socketRef.current?.emit('call_end', { withUserId: activePatientId }); setIncomingCall(null); pendingIceRef.current = []; stopTitleBlink(); if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; } }} className="px-3 py-1 bg-red-600 text-white rounded">Decline</button>
        </div>
      )}
    </div>
  );
}


