import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';
import {
  FaBars,
  FaBell,
  FaBrain,
  FaCalendarAlt,
  FaCheckCircle,
  FaChevronDown,
  FaCloudUploadAlt,
  FaCog,
  FaComments,
  FaFileAlt,
  FaMicrochip,
  FaSearch,
  FaUser,
  FaUsers,
  FaUpload,
  FaClock,
  FaEye,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

// Doctor Dashboard — NeuroCare AI
// - Blue & white theme, rounded cards, soft shadows
// - Sidebar + Top Navbar
// - Main cards: Appointments, MRI Upload & Queue, AI Prediction & Heatmap, Quick Chat
// - Analytics bar on the right

const blueBtn =
  'inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:via-indigo-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200';
const ghostBtn =
  'inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white/70 hover:bg-white/80 text-slate-700 text-sm font-medium border border-white/60 shadow-sm backdrop-blur-md transition-all duration-200';
const cardClass = 'bg-white/70 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-lg border border-white/60 transition-all duration-200 transform-gpu hover:-translate-y-0.5';

const statusBadge = (status) => {
  const base = 'px-2.5 py-1 rounded-full text-xs font-medium';
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return `${base} bg-green-100 text-green-700`;
    case 'pending':
      return `${base} bg-amber-100 text-amber-700`;
    case 'completed':
      return `${base} bg-blue-100 text-blue-700`;
    case 'rejected':
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-600`;
  }
};

const formatTime = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  // Sidebar & UI
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Search & notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  // Appointments
  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptError, setApptError] = useState('');
  // Referrals
  const [receivedReferrals, setReceivedReferrals] = useState([]);
  const [sentReferrals, setSentReferrals] = useState([]);
  const [refLoading, setRefLoading] = useState(false);
  const [refError, setRefError] = useState('');
  // Patients for analytics
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    // Load doctor appointments on mount for the authenticated user
    const loadAppts = async () => {
      try {
        setApptLoading(true);
        setApptError('');
        const res = await mongodbService.doctorListAppointments();
        if (res?.error) setApptError(res.error.message);
        setAppointments(res?.data || []);
      } catch (e) {
        setApptError(e?.message || 'Failed loading appointments');
      } finally {
        setApptLoading(false);
      }
    };
    loadAppts();
    const loadRefs = async () => {
      try {
        setRefLoading(true);
        setRefError('');
        const [rec, sent] = await Promise.all([
          mongodbService.listReceivedReferrals(),
          mongodbService.listSentReferrals()
        ]);
        setReceivedReferrals(rec?.data || []);
        setSentReferrals(sent?.data || []);
      } catch (e) {
        setRefError(e?.message || 'Failed loading referrals');
      } finally {
        setRefLoading(false);
      }
    };
    loadRefs();
    // Load patients for analytics
    (async () => {
      try {
        const res = await mongodbService.doctorListPatients();
        setPatients(res?.data || []);
      } catch {}
    })();
  }, []);

  // Keep bell notification count in sync with pending appointments + pending referrals
  useEffect(() => {
    const pendingAppts = (appointments || []).filter((a) => (a.status || '').toLowerCase() === 'pending').length;
    const pendingRefs = (receivedReferrals || []).filter((r) => (r.status || '').toLowerCase() === 'pending').length;
    setNotifications(pendingAppts + pendingRefs);
  }, [appointments, receivedReferrals]);

  // Build dropdown items from current pending sources so it isn't empty when count > 0
  useEffect(() => {
    const apptItems = (appointments || [])
      .filter((a) => (a.status || '').toLowerCase() === 'pending')
      .slice(0, 5)
      .map((a) => ({ id: `appt-${a.id}`, type: 'appointment_created', appointment: a, createdAt: a.createdAt || new Date().toISOString() }));
    const refItems = (receivedReferrals || [])
      .filter((r) => (r.status || '').toLowerCase() === 'pending')
      .slice(0, 5)
      .map((r) => ({ id: `ref-${r.id}`, type: 'referral_created', referral: r, createdAt: r.createdAt || new Date().toISOString() }));
    setNotificationItems([...refItems, ...apptItems].slice(0, 10));
  }, [appointments, receivedReferrals]);

  // realtime notifications
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const onNotification = (payload) => {
      // surface appointment and referral notifications in dropdown
      if ((payload?.appointment?.status || '').toLowerCase() === 'pending' || payload?.type?.startsWith('referral')) {
        setNotificationItems((items) => [{ id: Date.now(), ...payload }, ...items].slice(0, 10));
      }
      // On new appointment for this doctor, refresh list
      if (payload?.type === 'appointment_created') {
        (async () => {
          try {
            setApptLoading(true);
            const res = await mongodbService.doctorListAppointments();
            setAppointments(res?.data || []);
          } catch {}
          setApptLoading(false);
        })();
      }
      if (payload?.type === 'referral_created' || payload?.type === 'referral_status') {
        (async () => {
          try {
            const [rec, sent] = await Promise.all([
              mongodbService.listReceivedReferrals(),
              mongodbService.listSentReferrals()
            ]);
            setReceivedReferrals(rec?.data || []);
            setSentReferrals(sent?.data || []);
          } catch {}
        })();
      }
    };
    s.on('notification', onNotification);
    return () => {
      s.off('notification', onNotification);
    };
  }, [user]);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter((a) => `${a?.patient?.name || ''}`.toLowerCase().includes(q));
  }, [appointments, searchQuery]);

  // MRI Upload & Queue (mock client-side behavior)
  const [mriQueue, setMriQueue] = useState([
    { id: 'MRI-1001', patientId: 'P-45321', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'Completed' },
    { id: 'MRI-1002', patientId: 'P-94710', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), status: 'Analyzing' },
    { id: 'MRI-1003', patientId: 'P-33822', uploadedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: 'Pending' },
  ]);
  const fileInputRef = useRef(null);

  const progressItem = (id) => {
    setMriQueue((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              status: it.status === 'Pending' ? 'Analyzing' : 'Completed',
            }
          : it
      )
    );
  };

  const queueNewFiles = (files) => {
    const now = new Date().toISOString();
    const items = Array.from(files).map((f, idx) => ({
      id: `MRI-${Math.floor(Math.random() * 9000 + 1000)}`,
      patientId: `P-${Math.floor(Math.random() * 90000 + 10000)}`,
      uploadedAt: now,
      status: 'Pending',
      name: f.name,
    }));
    setMriQueue((prev) => [...items, ...prev]);

    // simulate progression
    items.forEach((it, i) => {
      setTimeout(() => progressItem(it.id), 1500 + i * 500);
      setTimeout(() => progressItem(it.id), 3000 + i * 500);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length) queueNewFiles(files);
  };

  const onBrowse = (e) => {
    const files = e.target?.files;
    if (files && files.length) queueNewFiles(files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AI Prediction & Heatmap (mock)
  const [selectedScan, setSelectedScan] = useState(null);
  const completedScans = mriQueue.filter((q) => q.status === 'Completed');
  const prediction = useMemo(() => {
    if (!selectedScan) return null;
    // mock prediction
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-99
    const isAbnormal = Number(selectedScan.id.replace(/\D/g, '')) % 2 === 0;
    return {
      label: isAbnormal ? 'Abnormal' : 'Normal',
      confidence,
    };
  }, [selectedScan]);

  const [showHeatmap, setShowHeatmap] = useState(false);

  // Availability editor (doctor)
  const now = new Date();
  const toIsoDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [availDate, setAvailDate] = useState(toIsoDate(now));
  const [availSlots, setAvailSlots] = useState([]); // ["09:00", ...]
  const [availSaving, setAvailSaving] = useState(false);
  const [availMsg, setAvailMsg] = useState('');
  const doctorIdStr = String(user?._id || user?.id || '');
  const [rangeStart, setRangeStart] = useState('09:00');
  const [rangeEnd, setRangeEnd] = useState('12:00');

  // Consultation Fee (doctor)
  const [consultationFee, setConsultationFee] = useState(() => {
    const n = Number(user?.consultationFeeInRupees);
    return Number.isFinite(n) && n >= 0 ? String(n) : '';
  });
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');
  const saveFee = async () => {
    try {
      setFeeSaving(true);
      setFeeMsg('');
      const amount = Math.max(0, Math.floor(Number(consultationFee || 0)));
      const res = await mongodbService.doctorSetConsultationFee(amount);
      if (res?.error) throw new Error(res.error.message);
      setFeeMsg('Consultation fee saved');
    } catch (e) {
      setFeeMsg(e?.message || 'Failed to save');
    } finally {
      setFeeSaving(false);
    }
  };

  const allSlots = useMemo(() => {
    // 09:00 - 17:00 30-min increments
    const slots = [];
    for (let h = 9; h <= 17; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hh = String(h).padStart(2, '0');
        const mm = String(m).padStart(2, '0');
        const label = `${hh}:${mm}`;
        slots.push(label);
      }
    }
    return slots;
  }, []);

  const toggleSlot = (s) => {
    setAvailSlots((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const addRange = () => {
    // build inclusive half-hour slots between rangeStart and rangeEnd
    const startIdx = allSlots.indexOf(rangeStart);
    const endIdx = allSlots.indexOf(rangeEnd);
    if (startIdx === -1 || endIdx === -1) return;
    const [from, to] = startIdx <= endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const newSlots = allSlots.slice(from, to + 1);
    setAvailSlots((prev) => Array.from(new Set([...prev, ...newSlots])));
  };

  const loadAvailability = async (dateStr) => {
    try {
      setAvailMsg('');
      const res = await mongodbService.listAvailabilityByDate(dateStr);
      const mine = (res?.data || []).find((a) => String(a?.doctor?.id) === doctorIdStr);
      setAvailSlots(mine?.slots || []);
    } catch (e) {
      setAvailSlots([]);
    }
  };

  useEffect(() => {
    if (!doctorIdStr || !availDate) return;
    loadAvailability(availDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorIdStr, availDate]);

  const saveAvailability = async () => {
    try {
      setAvailSaving(true);
      setAvailMsg('');
      const res = await mongodbService.doctorUpsertAvailability(availDate, availSlots.sort());
      if (res?.error) throw new Error(res.error.message);
      setAvailMsg('Availability saved');
    } catch (e) {
      setAvailMsg(e?.message || 'Failed to save');
    } finally {
      setAvailSaving(false);
    }
  };

  // Quick Chat (mock UI)
  const [doctorOnline, setDoctorOnline] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: 'patient', text: 'Hello Doctor, I uploaded my MRI yesterday.', ts: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
    { id: 2, from: 'doctor', text: 'I see it in the queue. I will review shortly.', ts: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
  ]);

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now(), from: 'doctor', text, ts: new Date().toISOString() },
    ]);
    setChatInput('');
    // mock patient typing back
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: 'patient', text: 'Thanks for the update!', ts: new Date().toISOString() },
      ]);
    }, 1200);
  };

  // Analytics (derived from real lists)
  const analytics = useMemo(() => {
    const totalPatients = Array.isArray(patients) ? patients.length : 0;
    const pendingReports = mriQueue.filter((q) => q.status !== 'Completed').length;
    const completed = mriQueue.filter((q) => q.status === 'Completed').length;
    // Estimate average wait time from appointment creation to scheduled start (in minutes)
    const durations = (appointments || [])
      .map((a) => {
        try {
          const created = new Date(a.createdAt || a.requestedAt || a.bookedAt || Date.now());
          const when = a.date ? new Date(`${a.date} ${a.time || '00:00'}`) : null;
          if (!when || isNaN(when.getTime())) return null;
          const diffMs = Math.max(0, when.getTime() - created.getTime());
          return Math.round(diffMs / 60000);
        } catch {
          return null;
        }
      })
      .filter((n) => typeof n === 'number');
    const avgWaitMins = durations.length ? Math.round(durations.reduce((s, n) => s + n, 0) / durations.length) : 0;
    return { totalPatients, pendingReports, completed, avgWaitMins };
  }, [patients, mriQueue, appointments]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} hidden md:flex flex-col bg-white/70 backdrop-blur-xl border-r border-white/60 shadow-md transition-all`}>
        <div className="h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
              <FaBrain />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-gray-800">NeuroCare AI</span>
            )}
          </div>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title="Toggle sidebar"
          >
            <FaBars />
          </button>
        </div>

        <nav className="px-2 py-3 flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {[
              { icon: FaCalendarAlt, label: 'Dashboard', route: '/doctor-dashboard', active: true },
              { icon: FaCalendarAlt, label: 'View Appointments', route: '/doctor-appointments' },
              { icon: FaUsers, label: 'Patients', route: '/patients' },
              { icon: FaUsers, label: 'Referred Patients', route: '/referred-patients' },
              { icon: FaUpload, label: 'MRI Upload', route: '/mri-analysis' },
              { icon: FaMicrochip, label: 'AI Predictions', route: '/doctor-dashboard' },
              { icon: FaComments, label: 'Chat', route: '/doctor-patient-chat' },
              { icon: FaFileAlt, label: 'Reports', route: '/reports' },
              { icon: FaClock, label: 'Audit Logs', route: '/audit-logs' },
              { icon: FaCog, label: 'Settings', route: '/settings' },
            ].map((item, idx) => (
              <li key={idx}>
                <button
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    item.active
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-100 shadow-sm'
                      : 'text-slate-700 bg-white/40 hover:bg-white/70 border border-transparent hover:border-white/60 hover:shadow-sm backdrop-blur-md'
                  }`}
                  onClick={() => item.route && navigate(item.route)}
                >
                  <item.icon className="text-base" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-white/60 shadow-md">
          <div className="h-16 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <button className="md:hidden text-gray-700" onClick={() => setSidebarCollapsed((v) => !v)}>
                <FaBars />
              </button>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center shadow-sm">
                  <FaBrain />
                </div>
                <span className="hidden sm:block text-base md:text-lg font-bold text-gray-800">NeuroCare AI</span>
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-4 hidden sm:block">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patients, appointments..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="relative">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg" onClick={() => setShowNotif((v)=>!v)}>
                  <FaBell className="text-lg" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2 max-h-80 overflow-auto">
                      {notificationItems.length === 0 && (
                        <div className="text-sm text-gray-500 p-3">No notifications</div>
                      )}
                      {notificationItems.map((n)=> {
                        const isReferral = (n?.type || '').startsWith('referral');
                        const title = isReferral
                          ? (n.type === 'referral_created' ? 'New Referral Received' : 'Referral Update')
                          : (n.type === 'appointment_created' ? 'New Appointment Request' : 'Appointment Update');
                        const subtitle = isReferral
                          ? `${n?.referral?.patientName || n?.referral?.patientId || ''} ${n?.referral?.reason ? '• ' + n.referral.reason : ''}`
                          : `${n?.appointment?.date || ''} ${n?.appointment?.time || ''} • ${n?.appointment?.mode || ''}`;
                        const target = isReferral ? '/referred-patients' : '/doctor-appointments';
                        return (
                          <button key={n.id} className="w-full text-left p-3 rounded-lg hover:bg-gray-50" onClick={() => { setShowNotif(false); navigate(target); }}>
                            <div className="text-sm font-semibold text-gray-800">{title}</div>
                            <div className="text-xs text-gray-600 mt-1">{subtitle}</div>
                            <div className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt || Date.now()).toLocaleString()}</div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-200 p-2 flex items-center justify-between">
                      <button className="text-xs text-gray-600 hover:underline" onClick={()=>{setNotificationItems([]); setNotifications(0);}}>Clear</button>
                      <button className="text-xs text-blue-600 hover:underline" onClick={()=>setShowNotif(false)}>Close</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  <img
                    src={user?.avatarUrl || user?.picture || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop&crop=face'}
                    alt="Doctor"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="hidden md:block leading-tight text-left">
                    <div className="text-sm font-semibold text-gray-800">{user?.fullName || user?.name || user?.email || 'Doctor'}</div>
                    <div className="text-xs text-gray-500">{user?.role === 'doctor' ? (user?.specialty || 'Doctor') : 'User'}</div>
                  </div>
                  <FaChevronDown className="text-gray-400" />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      <button onClick={() => { navigate('/profile'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"><FaUser /> Profile</button>
                      <button onClick={() => { navigate('/settings'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"><FaCog /> Settings</button>
                      <button onClick={() => { navigate('/help-support'); setShowUserDropdown(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm">Support</button>
                      <hr className="my-2 border-gray-200" />
                      <button
                        onClick={async () => { try { await signOut(); navigate('/'); } catch {} }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        <FaSignOutAlt className="text-xs" /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid */}
        <div className="flex-1 px-4 md:px-6 py-6 grid grid-cols-12 gap-6">
          {/* Main Column (left) */}
          <div className="col-span-12 xl:col-span-9 space-y-6">
            {/* Overview Hero */}
            <section className="p-4 md:p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-lg">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-sm">
                      <FaBrain />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold">Welcome{user?.fullName ? `, ${user.fullName}` : ''}</h2>
                  </div>
                  <p className="mt-1 text-sm text-white/90">Track patients, manage MRIs, and review AI predictions in one place.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
                  <div className="p-3 rounded-xl bg-white/15 border border-white/20">
                    <div className="text-[11px] uppercase tracking-wide text-white/80">Patients</div>
                    <div className="text-2xl font-extrabold">{analytics.totalPatients}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/15 border border-white/20">
                    <div className="text-[11px] uppercase tracking-wide text-white/80">Pending</div>
                    <div className="text-2xl font-extrabold">{analytics.pendingReports}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/15 border border-white/20">
                    <div className="text-[11px] uppercase tracking-wide text-white/80">Completed</div>
                    <div className="text-2xl font-extrabold">{analytics.completed}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/15 border border-white/20">
                    <div className="text-[11px] uppercase tracking-wide text-white/80">Avg Wait</div>
                    <div className="text-2xl font-extrabold">{analytics.avgWaitMins}m</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm transition-all">
                  <FaCloudUploadAlt /> Upload MRI
                </button>
                <button className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white/20 hover:bg-white/25 text-white border border-white/30 font-medium shadow-sm transition-all" onClick={()=>navigate('/doctor-appointments')}>
                  <FaCalendarAlt /> View Appointments
                </button>
              </div>
            </section>

            {/* My Availability */}
            <section className={`${cardClass} p-4 md:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">My Availability</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      value={consultationFee}
                      onChange={(e)=>setConsultationFee(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 500"
                    />
                    <button className={blueBtn} onClick={saveFee} disabled={feeSaving}>{feeSaving ? 'Saving…' : 'Save'}</button>
                  </div>
                  {feeMsg && <div className="mt-1 text-xs text-gray-600">{feeMsg}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                  <input type="date" value={availDate} onChange={(e)=>setAvailDate(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Range (Start)</label>
                  <select value={rangeStart} onChange={(e)=>setRangeStart(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {allSlots.map((s)=> (<option key={`s-${s}`} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Range (End)</label>
                  <select value={rangeEnd} onChange={(e)=>setRangeEnd(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {allSlots.map((s)=> (<option key={`e-${s}`} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <button className={ghostBtn} onClick={addRange}>Add Range</button>
                <button className={ghostBtn} onClick={()=>setAvailSlots([])}>Clear Slots</button>
                <button className={blueBtn} onClick={saveAvailability} disabled={availSaving}>
                  {availSaving ? 'Saving…' : 'Save Availability'}
                </button>
                {availMsg && <span className="text-sm text-gray-600">{availMsg}</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Time Slots (30 min)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                  {allSlots.map((s) => {
                    const active = availSlots.includes(s);
                    return (
                      <button key={s} type="button" onClick={()=>toggleSlot(s)} className={`px-2 py-1 rounded-md text-sm border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Today’s Appointments */}
            <section className={`${cardClass} p-4 md:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">Today’s Appointments</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className={ghostBtn}>
                    <FaSearch />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button className={blueBtn} onClick={()=>navigate('/doctor-appointments')}>
                    <FaCalendarAlt />
                    View Appointment
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-3 pr-4 font-semibold">Patient</th>
                      <th className="py-3 pr-4 font-semibold">Time</th>
                      <th className="py-3 pr-4 font-semibold">Status</th>
                      <th className="py-3 pr-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {apptLoading && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">Loading appointments…</td>
                      </tr>
                    )}
                    {apptError && !apptLoading && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-red-600">{apptError}</td>
                      </tr>
                    )}
                    {!apptLoading && !apptError && (filteredAppointments?.length ? filteredAppointments : []).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm font-bold">
                              {(a?.patient?.name || 'P')[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{a?.patient?.name || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">ID: {a?.patient?.id || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">{a?.date ? `${a.date} ${a.time || ''}` : '—'}</td>
                        <td className="py-3 pr-4"><span className={statusBadge(a.status)}>{a.status || '—'}</span></td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <button className={ghostBtn} onClick={()=>navigate('/doctor-appointments')}>
                              <FaEye />
                              <span className="hidden sm:inline">View Details</span>
                            </button>
                            <button className={blueBtn}>Reschedule</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Referred Patients moved to dedicated page */}
            {/* MRI Upload & Queue */}
            <section className={`${cardClass} p-4 md:p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaBrain className="text-blue-600" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800">MRI Upload & Queue</h2>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".dcm,.nii,.nii.gz,image/*"
                    className="hidden"
                    onChange={onBrowse}
                  />
                  <button className={blueBtn} onClick={() => fileInputRef.current?.click()}>
                    <FaCloudUploadAlt />
                    Upload MRI
                  </button>
                </div>
              </div>

              {/* Drag & Drop */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group border-2 border-dashed border-blue-200/80 rounded-2xl bg-gradient-to-br from-white/60 to-blue-50/50 p-6 text-center text-gray-600 hover:from-white/80 hover:to-blue-50/80 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex flex-col items-center gap-2">
                  <FaUpload className="text-blue-500 text-2xl" />
                  <div className="font-medium">Drag & drop MRI files here</div>
                  <div className="text-xs text-gray-500">DICOM (.dcm), NIfTI (.nii/.nii.gz), or images</div>
                </div>
              </div>

              {/* Queue List */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-800">Recent Uploads</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {mriQueue.map((q) => (
                    <div key={q.id} className="py-3 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                        <FaBrain />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900 truncate">{q.id} · {q.patientId}</div>
                          <div className="text-xs text-gray-500">{formatTime(q.uploadedAt)}</div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className={`font-medium ${
                            q.status === 'Completed'
                              ? 'text-blue-700'
                              : q.status === 'Analyzing'
                              ? 'text-amber-700'
                              : 'text-gray-600'
                          }`}>
                            {q.status}
                          </span>
                          <div className="flex items-center gap-1 text-gray-400">
                            <span>Pending</span>
                            <span>→</span>
                            <span>Analyzing</span>
                            <span>→</span>
                            <span>Completed</span>
                          </div>
                        </div>
                      </div>
                      <button
                        className={ghostBtn}
                        onClick={() => setSelectedScan(q)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* AI Prediction & Heatmap Viewer + Quick Chat side-by-side on wide screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Prediction */}
              <section className={`${cardClass} p-4 md:p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaMicrochip className="text-blue-600" />
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">AI Prediction & MRI Heatmap</h2>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select MRI Scan</label>
                  <select
                    value={selectedScan?.id || ''}
                    onChange={(e) => {
                      const it = mriQueue.find((q) => q.id === e.target.value);
                      setSelectedScan(it || null);
                    }}
                    className="w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-3 py-2"
                  >
                    <option value="" disabled>Select a completed scan…</option>
                    {completedScans.map((q) => (
                      <option key={q.id} value={q.id}>{q.id} · {q.patientId}</option>
                    ))}
                  </select>
                </div>

                {selectedScan ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        prediction?.label === 'Abnormal' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {prediction?.label || '—'}
                      </div>
                      <div className="text-gray-700 text-sm">Confidence: <span className="font-semibold">{prediction?.confidence || 0}%</span></div>
                    </div>

                    <div className="aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                      MRI preview / heatmap overlay
                    </div>

                    <div className="flex items-center gap-2">
                      <button className={blueBtn} onClick={() => setShowHeatmap(true)}>
                        <FaEye />
                        View Heatmap
                      </button>
                      <button className={ghostBtn}>Download Report</button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Choose a completed scan to view prediction and heatmap.</div>
                )}
              </section>

              {/* Quick Chat */}
              <section className={`${cardClass} p-4 md:p-6 flex flex-col`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaComments className="text-blue-600" />
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Quick Chat</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={`font-medium ${doctorOnline ? 'text-green-700' : 'text-gray-600'}`}>{doctorOnline ? 'Online' : 'Offline'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={doctorOnline} onChange={(e) => setDoctorOnline(e.target.checked)} />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {chatMessages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`${m.from === 'doctor' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'} px-3 py-2 rounded-2xl max-w-[75%] shadow-sm`}>
                        <div className="text-sm">{m.text}</div>
                        <div className={`text-[10px] mt-1 ${m.from === 'doctor' ? 'text-blue-100' : 'text-gray-500'}`}>{formatTime(m.ts)}</div>
                      </div>
                    </div>
                  ))}
                  {!!chatInput && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <span className="animate-pulse">•</span>
                      <span className="animate-pulse">•</span>
                      <span className="animate-pulse">•</span>
                      <span> typing…</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Write a message…"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button className={blueBtn} onClick={sendMessage}>Send</button>
                </div>
              </section>
            </div>
          </div>

          {/* Analytics Bar (right) */}
          <aside className="col-span-12 xl:col-span-3 space-y-6">
            <section className={`${cardClass} p-4 md:p-5`}>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Analytics</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-xs text-blue-700 font-medium flex items-center gap-2">
                    <FaUsers /> Total Patients
                  </div>
                  <div className="mt-1 text-2xl font-bold text-blue-900">{analytics.totalPatients}</div>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-xs text-amber-700 font-medium flex items-center gap-2">
                    <FaFileAlt /> Pending Reports
                  </div>
                  <div className="mt-1 text-2xl font-bold text-amber-900">{analytics.pendingReports}</div>
                </div>
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-xs text-emerald-700 font-medium flex items-center gap-2">
                    <FaCheckCircle /> Completed Scans
                  </div>
                  <div className="mt-1 text-2xl font-bold text-emerald-900">{analytics.completed}</div>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="text-xs text-gray-700 font-medium flex items-center gap-2">
                    <FaClock /> Avg Wait Time
                  </div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{analytics.avgWaitMins}m</div>
                </div>
              </div>
            </section>

            {/* Small help card */}
            <section className={`${cardClass} p-4 md:p-5`}>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Tips</h3>
              <p className="text-sm text-gray-600">
                Use the MRI queue to monitor processing. Click Select on a completed scan to view AI predictions and heatmaps.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {/* Heatmap Modal */}
      {showHeatmap && (
        <div className="fixed inset-0 z-20 bg-black/50 backdrop-blur flex items-center justify-center p-4" role="dialog" aria-modal>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="px-4 md:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-800 font-semibold">
                <FaBrain className="text-blue-600" /> MRI Heatmap Visualization
              </div>
              <button className="text-gray-600 hover:text-gray-800" onClick={() => setShowHeatmap(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="p-4 md:p-6">
              <div className="aspect-video bg-gray-50 border border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                Heatmap canvas placeholder
              </div>
              <div className="mt-4 flex items-center gap-2">
                <button className={ghostBtn}>Zoom In</button>
                <button className={ghostBtn}>Zoom Out</button>
                <button className={blueBtn} onClick={() => setShowHeatmap(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
