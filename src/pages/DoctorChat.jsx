import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaChevronDown, FaBars, FaSignOutAlt, FaPaperPlane, FaSearch, FaImage } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';
import { io } from 'socket.io-client';

export default function DoctorChat() {
  const navigate = useNavigate();
  const { user, authChecked, signOut } = useAuth();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState('');
  const [activeDoctorId, setActiveDoctorId] = useState('');
  const [messages, setMessages] = useState({}); // { [doctorId]: [{id, from, text, time}] }
  const [draft, setDraft] = useState('');
  const [presence, setPresence] = useState({}); // { userId: { online, lastSeen } }
  const [conversationId, setConversationId] = useState(null);
  const fileInputRef = useRef(null);
  const [showCall, setShowCall] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const isCallingRef = useRef(false);
  const [incomingCall, setIncomingCall] = useState(null); // { fromUserId, sdp }
  const pendingIceRef = useRef([]); // queue ICE candidates until peer ready
  const ringTimeoutRef = useRef(null);

  const endRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const [typingMap, setTypingMap] = useState({});
  const messageIdsRef = useRef(new Set());

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

  // Title blink helper for incoming call
  const titleBlinkRef = useRef({ timer: null, original: document.title });
  const startTitleBlink = (text = 'Incoming call…') => {
    const ref = titleBlinkRef.current;
    if (ref.timer) return;
    ref.original = document.title;
    let toggle = false;
    ref.timer = setInterval(() => {
      document.title = toggle ? ref.original : text;
      toggle = !toggle;
    }, 800);
  };
  const stopTitleBlink = () => {
    const ref = titleBlinkRef.current;
    if (ref.timer) {
      clearInterval(ref.timer);
      ref.timer = null;
      document.title = ref.original;
    }
  };

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const load = async () => {
      const res = await mongodbService.listDoctors('');
      const list = res.data || [];
      setDoctors(list);
      if (list.length && !activeDoctorId) setActiveDoctorId(list[0].id);
    };
    load();
  }, [authChecked, user, navigate]);

  // Initialize socket
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('mongodb_token');
    const socket = io(import.meta.env.VITE_MONGODB_API_URL?.replace('/api','') || 'http://localhost:3002', {
      auth: { token }
    });
    socketRef.current = socket;

    socket.on('presence', ({ userId, online, lastSeen }) => {
      setPresence(prev => ({ ...prev, [String(userId)]: { online, lastSeen } }));
    });
    socket.on('message', (msg) => {
      const otherId = msg.fromUserId === user._id ? msg.toUserId : msg.fromUserId;
      if (String(msg.fromUserId) === String(user._id)) return;
      if (messageIdsRef.current.has(String(msg.id))) return;
      messageIdsRef.current.add(String(msg.id));
      setMessages(prev => ({ ...prev, [otherId]: [...(prev[otherId] || []), { id: msg.id, from: msg.fromUserId === user._id ? 'me' : 'them', text: msg.text, time: msg.createdAt, seenAt: msg.seenAt }] }));
    });
    socket.on('typing', ({ fromUserId, typing }) => {
      setTypingMap(prev => ({ ...prev, [String(fromUserId)]: Boolean(typing) }));
    });
    socket.on('seen_update', ({ conversationId, seenAt, seenBy }) => {
      // Optional: update local state for read receipts if needed
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeDoctorId, messages]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d => [d.name, d.email, d.specialization].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [search, doctors]);

  const activeDoctor = doctors.find(d => d.id === activeDoctorId);
  const activeMsgs = messages[activeDoctorId] || [];

  const send = async () => {
    const text = draft.trim();
    if (!text || !activeDoctorId) return;
    // optimistic
    const tempId = 'temp-' + Date.now();
    const tempMsg = { id: tempId, from: 'me', text, time: new Date().toISOString() };
    messageIdsRef.current.add(String(tempId));
    setMessages(prev => ({ ...prev, [activeDoctorId]: [...(prev[activeDoctorId] || []), tempMsg] }));
    setDraft('');
    // socket
    socketRef.current?.emit('join_conversation', { withUserId: activeDoctorId });
    socketRef.current?.emit('send_message', { toUserId: activeDoctorId, text });
    // REST fallback
    await mongodbService.sendMessage(activeDoctorId, text);
  };

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeDoctorId) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUri = reader.result; // data:image/..;base64,
      const up = await mongodbService.uploadImageDataUri(dataUri);
      if (up.data?.url) {
        await mongodbService.sendMediaMessage(activeDoctorId, up.data.url, 'image');
      }
    };
    reader.readAsDataURL(file);
    // reset
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // WebRTC helpers
  const ensurePeer = async () => {
    // Recreate peer if it's failed or closed
    if (pcRef.current && (pcRef.current.signalingState === 'closed' || pcRef.current.connectionState === 'failed' || pcRef.current.connectionState === 'closed')) {
      try { pcRef.current.close(); } catch {}
      pcRef.current = null;
    }
    if (!pcRef.current) {
      pcRef.current = new RTCPeerConnection({ iceServers: buildIceServers() });
      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) socketRef.current?.emit('call_signal', { withUserId: activeDoctorId, data: { candidate: e.candidate } });
      };
      pcRef.current.ontrack = (e) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
      };
      pcRef.current.onconnectionstatechange = () => {
        const s = pcRef.current?.connectionState;
        if (s === 'failed' || s === 'disconnected' || s === 'closed') {
          // Keep UI visible; peer will be recreated on next action
        }
      };
    }
    return pcRef.current;
  };

  const startCall = async () => {
    if (!activeDoctorId) return;
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
      try { pc.close(); } catch {}
      pcRef.current = null;
      pc = await ensurePeer();
    }
    try {
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    } catch (e) {
      try { pc.close(); } catch {}
      pcRef.current = null;
      pc = await ensurePeer();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));
    }
    socketRef.current?.emit('call_join', { withUserId: activeDoctorId });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current?.emit('call_signal', { withUserId: activeDoctorId, data: { sdp: offer } });
    isCallingRef.current = false;
  };

  const endCall = () => {
    setShowCall(false);
    socketRef.current?.emit('call_end', { withUserId: activeDoctorId });
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
      if (data.sdp && data.sdp.type === 'offer') {
        // Show incoming call prompt; store offer until accepted
        setIncomingCall({ fromUserId, sdp: data.sdp });
        // Browser notification
        try {
          if (Notification && Notification.permission === 'granted') {
            new Notification('Incoming call', { body: 'Click to answer', silent: false }).onclick = () => {
              window.focus();
            };
          } else if (Notification && Notification.permission !== 'denied') {
            Notification.requestPermission();
          }
        } catch {}
        startTitleBlink('🔔 Incoming call…');
        // auto-miss after 30s if not answered
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = setTimeout(() => {
          if (incomingCall) {
            // mark missed in UI
            const otherId = String(activeDoctorId);
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
        // drain any queued candidates after remote description available
        while (pendingIceRef.current.length) {
          const cand = pendingIceRef.current.shift();
          try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
        }
      } else if (data.candidate) {
        if (pc.currentRemoteDescription) {
          try { await pc.addIceCandidate(new RTCIceCandidate(data.candidate)); } catch {}
        } else {
          pendingIceRef.current.push(data.candidate);
        }
      }
    };
    const handlePeerJoined = () => { /* optional UI */ };
    const handleEnded = () => endCall();
    socket.on('call_signal', handleSignal);
    socket.on('call_peer_joined', handlePeerJoined);
    socket.on('call_ended', handleEnded);
    socket.on('call_missed', ({ fromUserId }) => {
      // Show a lightweight toast; optional: integrate a nicer component later
      try { if (Notification && Notification.permission === 'granted') new Notification('Missed video call'); } catch {}
      startTitleBlink('❌ Missed call');
      setTimeout(() => stopTitleBlink(), 4000);
    });
    return () => {
      socket.off('call_signal', handleSignal);
      socket.off('call_peer_joined', handlePeerJoined);
      socket.off('call_ended', handleEnded);
      socket.off('call_missed');
    };
  }, [activeDoctorId]);

  const acceptIncoming = async () => {
    if (!incomingCall) return;
    setShowCall(true);
    const pc = await ensurePeer();
    // join signaling room
    socketRef.current?.emit('call_join', { withUserId: activeDoctorId });
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
    socketRef.current?.emit('call_signal', { withUserId: activeDoctorId, data: { sdp: answer } });
    // drain queued ICE
    while (pendingIceRef.current.length) {
      const cand = pendingIceRef.current.shift();
      try { await pc.addIceCandidate(new RTCIceCandidate(cand)); } catch {}
    }
    setIncomingCall(null);
    stopTitleBlink();
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
  };

  const declineIncoming = () => {
    if (!incomingCall) return;
    socketRef.current?.emit('call_end', { withUserId: activeDoctorId });
    setIncomingCall(null);
    pendingIceRef.current = [];
    stopTitleBlink();
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
  };

  const onDraftChange = (val) => {
    setDraft(val);
    if (!activeDoctorId) return;
    if (!typingTimerRef.current) {
      socketRef.current?.emit('typing', { toUserId: activeDoctorId, typing: true });
      typingTimerRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { toUserId: activeDoctorId, typing: false });
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = null;
      }, 1500);
    }
  };

  // Load history when switching doctor
  useEffect(() => {
    const run = async () => {
      if (!activeDoctorId) return;
      const { data } = await mongodbService.fetchMessages(activeDoctorId);
      setConversationId(data?.conversationId || null);
      const msgs = (data?.messages || []).map(m => ({ id: m.id, from: m.fromUserId === user?._id ? 'me' : 'them', text: m.text, time: m.createdAt, seenAt: m.seenAt }));
      setMessages(prev => ({ ...prev, [activeDoctorId]: msgs }));
      // join socket room
      socketRef.current?.emit('join_conversation', { withUserId: activeDoctorId });
      // mark seen
      if (data?.conversationId) socketRef.current?.emit('mark_seen', { conversationId: data.conversationId });
      // presence fetch
      const pres = await mongodbService.getPresence(activeDoctorId);
      if (pres.data) {
        setPresence(prev => ({ ...prev, [String(pres.data.userId)]: { online: pres.data.online, lastSeen: pres.data.lastSeen } }));
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoctorId]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaBrain className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">NeuroCare</h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Dashboard</button>
            <button onClick={() => navigate('/appointments')} className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">Appointments</button>
            <button onClick={() => navigate('/reports')} className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium">My Reports</button>
            <div className="relative">
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" alt="User" className="w-8 h-8 rounded-full border-2 border-gray-300" />
                <span className="text-sm">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                <FaChevronDown className="text-xs" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-2">
                    <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">Profile</button>
                    <button onClick={() => navigate('/help-support')} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">Support</button>
                    <hr className="my-2 border-gray-200" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"><FaSignOutAlt className="text-xs" /> Logout</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg">
            <FaBars />
          </button>
        </div>
      </nav>

      {/* Chat Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Chats list */}
        <aside className="md:col-span-4 border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search doctors" className="w-full border rounded-lg pl-9 pr-3 py-2" />
            </div>
          </div>
          <div className="max-h-[70vh] overflow-y-auto">
            {filteredDoctors.map(d => (
              <button key={d.id} onClick={()=>setActiveDoctorId(d.id)} className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 ${activeDoctorId===d.id ? 'bg-blue-50' : ''}`}>
                <img src={d.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(d.name || 'Doctor')} alt={d.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{d.name}</div>
                  <div className="text-xs text-gray-500 truncate">{d.specialization || 'Specialist'} • {d.hospital || 'Hospital'}</div>
                </div>
              </button>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">No doctors found</div>
            )}
          </div>
        </aside>

        {/* Messages area */}
        <section className="md:col-span-8 border border-gray-200 rounded-2xl flex flex-col h-[80vh]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3">
            {activeDoctor ? (
              <>
                <img src={activeDoctor.avatar || 'https://api.dicebear.com/9.x/initials/svg?seed=' + encodeURIComponent(activeDoctor.name || 'Doctor')} alt={activeDoctor.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">{activeDoctor.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {presence[String(activeDoctor.id)]?.online ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      <span>Last seen {presence[String(activeDoctor.id)]?.lastSeen ? new Date(presence[String(activeDoctor.id)]?.lastSeen).toLocaleString() : 'recently'}</span>
                    )}
                    <span className="mx-1">•</span>
                    {activeDoctor.specialization || 'Specialist'} • {activeDoctor.hospital || 'Hospital'}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Select a doctor to start chatting</div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2]">
            <div className="space-y-2 max-w-2xl mx-auto">
              {activeMsgs.map(m => (
                <div key={m.id} className={`w-full flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-lg shadow text-sm max-w-[75%] ${m.from === 'me' ? 'bg-[#dcf8c6] text-gray-900 rounded-br-none' : 'bg-white text-gray-900 rounded-bl-none'}`}>
                    {m.mediaUrl ? (
                      <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                        <img src={m.mediaUrl} alt="attachment" className="max-w-xs rounded" />
                      </a>
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
              {typingMap[String(activeDoctorId)] && (
                <div className="w-full flex justify-start">
                  <div className="px-3 py-2 rounded-lg shadow text-sm bg-white text-gray-900 rounded-bl-none inline-flex items-center gap-1">
                    <span className="animate-bounce">•</span>
                    <span className="animate-bounce [animation-delay:150ms]">•</span>
                    <span className="animate-bounce [animation-delay:300ms]">•</span>
                  </div>
                </div>
              )}
              <div ref={endRef} />
              {!activeMsgs.length && activeDoctor && (
                <div className="text-center text-xs text-gray-700 bg-white/70 rounded-lg px-3 py-2 inline-block mx-auto">Say hello to {activeDoctor.name}</div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50"><FaImage /></button>
              <button onClick={startCall} className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50">Call</button>
              <input
                value={draft}
                onChange={e=>onDraftChange(e.target.value)}
                onKeyDown={e=>{ if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Type a message"
                className="flex-1 border rounded-full px-4 py-2"
              />
              <button onClick={send} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center gap-2">
                <FaPaperPlane />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
      {showCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Video Call</div>
              <button onClick={endCall} className="text-red-600">End</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full rounded bg-black" />
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded bg-black" />
            </div>
          </div>
        </div>
      )}
      {!showCall && incomingCall && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-xl border border-gray-200 rounded-lg p-3 z-50 flex items-center gap-3">
          <div className="font-medium">Incoming call…</div>
          <button onClick={acceptIncoming} className="px-3 py-1 bg-green-600 text-white rounded">Accept</button>
          <button onClick={declineIncoming} className="px-3 py-1 bg-red-600 text-white rounded">Decline</button>
        </div>
      )}
    </div>
  );
}

