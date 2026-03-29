import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../lib/socket';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mongodbService } from '../lib/mongodb';
import {
  FaBars, FaBell, FaBrain, FaCalendarAlt, FaCheckCircle, FaChevronDown,
  FaCloudUploadAlt, FaCog, FaComments, FaFileAlt, FaMicrochip, FaSearch,
  FaUser, FaUsers, FaUpload, FaClock, FaEye, FaTimes, FaSignOutAlt,
  FaCrown, FaHeadset, FaStethoscope, FaChartLine, FaPaperPlane
} from 'react-icons/fa';

const statusBadge = (status) => {
  const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold';
  const s = (status || '').toLowerCase();
  if (s === 'approved') return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
  if (s === 'pending') return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
  if (s === 'completed') return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
  if (s === 'rejected') return `${base} bg-red-50 text-red-600 border border-red-200`;
  return `${base} bg-slate-100 text-slate-500 border border-slate-200`;
};

const formatTime = (iso) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(0);
  const [notificationItems, setNotificationItems] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptError, setApptError] = useState('');
  const [receivedReferrals, setReceivedReferrals] = useState([]);
  const [sentReferrals, setSentReferrals] = useState([]);
  const [patients, setPatients] = useState([]);

  // Availability
  const now = new Date();
  const toIsoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const [availDate, setAvailDate] = useState(toIsoDate(now));
  const [availSlots, setAvailSlots] = useState([]);
  const [availSaving, setAvailSaving] = useState(false);
  const [availMsg, setAvailMsg] = useState('');
  const doctorIdStr = String(user?._id || user?.id || '');
  const [rangeStart, setRangeStart] = useState('09:00');
  const [rangeEnd, setRangeEnd] = useState('12:00');

  // Consultation fee
  const [consultationFee, setConsultationFee] = useState(() => {
    const n = Number(user?.consultationFeeInRupees);
    return Number.isFinite(n) && n >= 0 ? String(n) : '';
  });
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');

  // MRI Upload & Queue
  const [mriQueue, setMriQueue] = useState([
    { id: 'MRI-1001', patientId: 'P-45321', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), status: 'Completed' },
    { id: 'MRI-1002', patientId: 'P-94710', uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(), status: 'Analyzing' },
    { id: 'MRI-1003', patientId: 'P-33822', uploadedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: 'Pending' },
  ]);
  const fileInputRef = useRef(null);
  const [selectedScan, setSelectedScan] = useState(null);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Quick Chat
  const [doctorOnline, setDoctorOnline] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, from: 'patient', text: 'Hello Doctor, I uploaded my MRI yesterday.', ts: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
    { id: 2, from: 'doctor', text: 'I see it in the queue. I will review shortly.', ts: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
  ]);

  const pName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.fullName || user?.name || user?.email || 'Doctor');

  // ── Data loading ──
  useEffect(() => {
    (async () => {
      try {
        setApptLoading(true);
        const res = await mongodbService.doctorListAppointments();
        if (res?.error) setApptError(res.error.message);
        setAppointments(res?.data || []);
      } catch (e) { setApptError(e?.message || 'Failed loading appointments'); }
      finally { setApptLoading(false); }
    })();
    (async () => {
      try {
        const [rec, sent] = await Promise.all([mongodbService.listReceivedReferrals(), mongodbService.listSentReferrals()]);
        setReceivedReferrals(rec?.data || []);
        setSentReferrals(sent?.data || []);
      } catch {}
    })();
    (async () => { try { const res = await mongodbService.doctorListPatients(); setPatients(res?.data || []); } catch {} })();
  }, []);

  // Notifications
  useEffect(() => {
    const pendingAppts = (appointments || []).filter(a => (a.status || '').toLowerCase() === 'pending').length;
    const pendingRefs = (receivedReferrals || []).filter(r => (r.status || '').toLowerCase() === 'pending').length;
    setNotifications(pendingAppts + pendingRefs);
  }, [appointments, receivedReferrals]);

  useEffect(() => {
    const apptItems = (appointments || []).filter(a => (a.status || '').toLowerCase() === 'pending').slice(0, 5)
      .map(a => ({ id: `appt-${a.id}`, type: 'appointment_created', appointment: a, createdAt: a.createdAt || new Date().toISOString() }));
    const refItems = (receivedReferrals || []).filter(r => (r.status || '').toLowerCase() === 'pending').slice(0, 5)
      .map(r => ({ id: `ref-${r.id}`, type: 'referral_created', referral: r, createdAt: r.createdAt || new Date().toISOString() }));
    setNotificationItems([...refItems, ...apptItems].slice(0, 10));
  }, [appointments, receivedReferrals]);

  // Realtime socket
  useEffect(() => {
    const s = getSocket(); if (!s) return;
    const onNotification = (payload) => {
      if ((payload?.appointment?.status || '').toLowerCase() === 'pending' || payload?.type?.startsWith('referral'))
        setNotificationItems(items => [{ id: Date.now(), ...payload }, ...items].slice(0, 10));
      if (payload?.type === 'appointment_created')
        (async () => { try { setApptLoading(true); const res = await mongodbService.doctorListAppointments(); setAppointments(res?.data || []); } catch {} setApptLoading(false); })();
      if (payload?.type === 'referral_created' || payload?.type === 'referral_status')
        (async () => { try { const [rec, sent] = await Promise.all([mongodbService.listReceivedReferrals(), mongodbService.listSentReferrals()]); setReceivedReferrals(rec?.data || []); setSentReferrals(sent?.data || []); } catch {} })();
    };
    s.on('notification', onNotification);
    return () => { s.off('notification', onNotification); };
  }, [user]);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const q = searchQuery.toLowerCase();
    return appointments.filter(a => `${a?.patient?.name || ''}`.toLowerCase().includes(q));
  }, [appointments, searchQuery]);

  // Availability helpers
  const allSlots = useMemo(() => {
    const slots = [];
    for (let h = 9; h <= 17; h++) for (let m = 0; m < 60; m += 30) slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    return slots;
  }, []);

  const toggleSlot = (s) => setAvailSlots(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const addRange = () => {
    const si = allSlots.indexOf(rangeStart), ei = allSlots.indexOf(rangeEnd);
    if (si === -1 || ei === -1) return;
    const [f, t] = si <= ei ? [si, ei] : [ei, si];
    setAvailSlots(prev => Array.from(new Set([...prev, ...allSlots.slice(f, t + 1)])));
  };

  const loadAvailability = async (dateStr) => {
    try { setAvailMsg(''); const res = await mongodbService.listAvailabilityByDate(dateStr); const mine = (res?.data || []).find(a => String(a?.doctor?.id) === doctorIdStr); setAvailSlots(mine?.slots || []); } catch { setAvailSlots([]); }
  };
  useEffect(() => { if (doctorIdStr && availDate) loadAvailability(availDate); }, [doctorIdStr, availDate]);

  const saveAvailability = async () => {
    try { setAvailSaving(true); setAvailMsg(''); const res = await mongodbService.doctorUpsertAvailability(availDate, availSlots.sort()); if (res?.error) throw new Error(res.error.message); setAvailMsg('Saved!'); } catch (e) { setAvailMsg(e?.message || 'Failed'); } finally { setAvailSaving(false); }
  };
  const saveFee = async () => {
    try { setFeeSaving(true); setFeeMsg(''); const amount = Math.max(0, Math.floor(Number(consultationFee || 0))); const res = await mongodbService.doctorSetConsultationFee(amount); if (res?.error) throw new Error(res.error.message); setFeeMsg('Saved!'); } catch (e) { setFeeMsg(e?.message || 'Failed'); } finally { setFeeSaving(false); }
  };

  // MRI helpers
  const progressItem = (id) => setMriQueue(prev => prev.map(it => it.id === id ? { ...it, status: it.status === 'Pending' ? 'Analyzing' : 'Completed' } : it));
  const queueNewFiles = (files) => {
    const items = Array.from(files).map(f => ({ id: `MRI-${Math.floor(Math.random() * 9000 + 1000)}`, patientId: `P-${Math.floor(Math.random() * 90000 + 10000)}`, uploadedAt: new Date().toISOString(), status: 'Pending', name: f.name }));
    setMriQueue(prev => [...items, ...prev]);
    items.forEach((it, i) => { setTimeout(() => progressItem(it.id), 1500 + i * 500); setTimeout(() => progressItem(it.id), 3000 + i * 500); });
  };
  const onDrop = (e) => { e.preventDefault(); if (e.dataTransfer?.files?.length) queueNewFiles(e.dataTransfer.files); };
  const onBrowse = (e) => { if (e.target?.files?.length) queueNewFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const completedScans = mriQueue.filter(q => q.status === 'Completed');
  const prediction = useMemo(() => {
    if (!selectedScan) return null;
    return { label: Number(selectedScan.id.replace(/\D/g, '')) % 2 === 0 ? 'Abnormal' : 'Normal', confidence: Math.floor(Math.random() * 30) + 70 };
  }, [selectedScan]);

  const sendMessage = () => {
    const text = chatInput.trim(); if (!text) return;
    setChatMessages(prev => [...prev, { id: Date.now(), from: 'doctor', text, ts: new Date().toISOString() }]);
    setChatInput('');
    setTimeout(() => { setChatMessages(prev => [...prev, { id: Date.now() + 1, from: 'patient', text: 'Thanks for the update!', ts: new Date().toISOString() }]); }, 1200);
  };

  // Analytics
  const analytics = useMemo(() => {
    const totalPatients = Array.isArray(patients) ? patients.length : 0;
    const pendingReports = mriQueue.filter(q => q.status !== 'Completed').length;
    const completed = mriQueue.filter(q => q.status === 'Completed').length;
    const durations = (appointments || []).map(a => {
      try { const c = new Date(a.createdAt || Date.now()); const w = a.date ? new Date(`${a.date} ${a.time || '00:00'}`) : null; if (!w || isNaN(w.getTime())) return null; return Math.round(Math.max(0, w.getTime() - c.getTime()) / 60000); } catch { return null; }
    }).filter(n => typeof n === 'number');
    const avgWaitMins = durations.length ? Math.round(durations.reduce((s, n) => s + n, 0) / durations.length) : 0;
    return { totalPatients, pendingReports, completed, avgWaitMins };
  }, [patients, mriQueue, appointments]);

  const mriStatusColor = (s) => s === 'Completed' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : s === 'Analyzing' ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-slate-500 bg-slate-50 border-slate-200';

  const sidebarItems = [
    { icon: FaChartLine, label: 'Dashboard', route: '/doctor-dashboard', active: true },
    { icon: FaCalendarAlt, label: 'View Appointments', route: '/doctor-appointments' },
    { icon: FaUsers, label: 'Patients', route: '/patients' },
    { icon: FaUsers, label: 'Referred Patients', route: '/referred-patients' },
    { icon: FaUpload, label: 'MRI Upload', route: '/mri-analysis' },
    { icon: FaComments, label: 'Chat', route: '/doctor-patient-chat' },
    { icon: FaFileAlt, label: 'Reports', route: '/reports' },
    { icon: FaClock, label: 'Audit Logs', route: '/audit-logs' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ━━━ Sidebar ━━━ */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-slate-200 flex-shrink-0">
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><FaBrain className="text-white text-sm" /></div>
          <span className="text-base font-bold text-slate-900 tracking-tight">NeuroCare</span>
        </div>
        <nav className="flex-1 px-2 py-3 overflow-y-auto">
          <ul className="space-y-0.5">
            {sidebarItems.map((item, idx) => (
              <li key={idx}>
                <button onClick={() => item.route && navigate(item.route)}
                  className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${item.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                  <item.icon className="text-xs" /> {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-3 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{pName.charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{pName}</p>
              <p className="text-[10px] text-slate-400">{user?.specialization || user?.specialty || 'Doctor'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ━━━ Main ━━━ */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 h-14 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setShowMobileMenu(!showMobileMenu)}><FaBars /></button>
            <div className="lg:hidden flex items-center gap-2 cursor-pointer" onClick={() => navigate('/doctor-dashboard')}>
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><FaBrain className="text-white text-sm" /></div>
              <span className="font-bold text-slate-900">NeuroCare</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search patients..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition" onClick={() => setShowNotif(!showNotif)}>
                <FaBell className="text-sm" />
                {notifications > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">{notifications}</span>}
              </button>
              {showNotif && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-100 z-50">
                  <div className="p-3 border-b border-slate-50 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">Notifications</span>
                    <button className="text-[10px] text-slate-400 hover:text-red-500" onClick={() => { setNotificationItems([]); setNotifications(0); }}>Clear all</button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notificationItems.length === 0 && <div className="p-4 text-xs text-slate-400 text-center">No notifications</div>}
                    {notificationItems.map(n => {
                      const isRef = (n?.type || '').startsWith('referral');
                      return (
                        <button key={n.id} className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition"
                          onClick={() => { setShowNotif(false); navigate(isRef ? '/referred-patients' : '/doctor-appointments'); }}>
                          <p className="text-xs font-semibold text-slate-700">{isRef ? (n.type === 'referral_created' ? 'New Referral' : 'Referral Update') : (n.type === 'appointment_created' ? 'New Appointment' : 'Update')}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{isRef ? (n?.referral?.patientName || '') : `${n?.appointment?.date || ''} ${n?.appointment?.time || ''}`}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* User dropdown */}
            <div className="relative">
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{pName.charAt(0).toUpperCase()}</div>
                <span className="text-sm font-medium hidden md:inline">{pName}</span>
                <FaChevronDown className="text-[10px]" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1.5">
                  <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaUser className="text-xs text-slate-400" /> Profile</button>
                  <button onClick={() => navigate('/help-support')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaHeadset className="text-xs text-slate-400" /> Support</button>
                  <hr className="my-1.5 border-slate-100" />
                  <button onClick={async () => { try { await signOut(); navigate('/'); } catch {} }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaSignOutAlt className="text-xs" /> Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1">
            {sidebarItems.map((item, idx) => (
              <button key={idx} onClick={() => { navigate(item.route); setShowMobileMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${item.active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                <item.icon className="text-xs" /> {item.label}
              </button>
            ))}
          </div>
        )}

        {/* ━━━ Content ━━━ */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">

            {/* Welcome + Stats */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Welcome back{pName !== 'Doctor' ? `, Dr. ${pName.split(' ')[0]}` : ''}!</h1>
              <p className="text-sm text-slate-500 mt-0.5">Here's your practice overview for today.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Patients', value: analytics.totalPatients, icon: FaUsers, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                { label: 'Pending', value: analytics.pendingReports, icon: FaFileAlt, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                { label: 'Completed', value: analytics.completed, icon: FaCheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                { label: 'Avg Wait', value: `${analytics.avgWaitMins}m`, icon: FaClock, color: 'text-slate-600 bg-slate-50 border-slate-200' },
              ].map(s => (
                <div key={s.label} className={`rounded-xl border px-4 py-3.5 ${s.color}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className="text-[10px] opacity-60" />
                    <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">{s.label}</p>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition">
                <FaCloudUploadAlt className="text-[10px]" /> Upload MRI
              </button>
              <button onClick={() => navigate('/doctor-appointments')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition">
                <FaCalendarAlt className="text-[10px]" /> View Appointments
              </button>
              <button onClick={() => navigate('/doctor-patient-chat')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition">
                <FaComments className="text-[10px]" /> Patient Chat
              </button>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

              {/* LEFT — 8 cols */}
              <div className="xl:col-span-8 space-y-6">

                {/* My Availability */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FaCalendarAlt className="text-blue-500 text-xs" /> My Availability</h2>
                    <div className="flex items-center gap-2">
                      {availMsg && <span className="text-[10px] text-emerald-600 font-medium">{availMsg}</span>}
                      <button onClick={saveAvailability} disabled={availSaving}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                        {availSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Fee (₹)</label>
                        <div className="flex gap-1.5">
                          <input type="number" min={0} value={consultationFee} onChange={e => setConsultationFee(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-300" placeholder="500" />
                          <button onClick={saveFee} disabled={feeSaving}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">{feeSaving ? '...' : 'Set'}</button>
                        </div>
                        {feeMsg && <p className="text-[10px] text-emerald-600 mt-1">{feeMsg}</p>}
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Date</label>
                        <input type="date" value={availDate} onChange={e => setAvailDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-300" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">From</label>
                        <select value={rangeStart} onChange={e => setRangeStart(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-300">
                          {allSlots.map(s => <option key={`s-${s}`} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">To</label>
                        <div className="flex gap-1.5">
                          <select value={rangeEnd} onChange={e => setRangeEnd(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-300">
                            {allSlots.map(s => <option key={`e-${s}`} value={s}>{s}</option>)}
                          </select>
                          <button onClick={addRange} className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">Add</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Time Slots</p>
                      <button onClick={() => setAvailSlots([])} className="text-[10px] text-red-400 hover:text-red-600">Clear all</button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                      {allSlots.map(s => (
                        <button key={s} type="button" onClick={() => toggleSlot(s)}
                          className={`py-1.5 rounded-md text-xs font-medium transition ${availSlots.includes(s) ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Today's Appointments */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FaCalendarAlt className="text-blue-500 text-xs" /> Today's Appointments</h2>
                    <button onClick={() => navigate('/doctor-appointments')} className="text-xs text-blue-600 font-medium hover:text-blue-700">View All →</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400">
                          <th className="text-left px-5 py-2.5 font-semibold">Patient</th>
                          <th className="text-left px-3 py-2.5 font-semibold">Date / Time</th>
                          <th className="text-left px-3 py-2.5 font-semibold">Status</th>
                          <th className="text-right px-5 py-2.5 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {apptLoading && <tr><td colSpan={4} className="px-5 py-6 text-center text-xs text-slate-400">Loading...</td></tr>}
                        {apptError && !apptLoading && <tr><td colSpan={4} className="px-5 py-6 text-center text-xs text-red-500">{apptError}</td></tr>}
                        {!apptLoading && !apptError && filteredAppointments.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold">{(a?.patient?.name || 'P')[0]}</div>
                                <div>
                                  <p className="text-sm font-medium text-slate-800">{a?.patient?.name || 'Unknown'}</p>
                                  <p className="text-[10px] text-slate-400">ID: {a?.patient?.id || '—'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-xs text-slate-600">{a?.date ? `${a.date} ${a.time || ''}` : '—'}</td>
                            <td className="px-3 py-3"><span className={statusBadge(a.status)}>{a.status || '—'}</span></td>
                            <td className="px-5 py-3 text-right">
                              <button onClick={() => navigate('/doctor-appointments')} className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium hover:bg-slate-50 transition">Details</button>
                            </td>
                          </tr>
                        ))}
                        {!apptLoading && !apptError && filteredAppointments.length === 0 && (
                          <tr><td colSpan={4} className="px-5 py-8 text-center text-xs text-slate-400">No appointments found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* MRI Upload & Queue */}
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FaBrain className="text-blue-500 text-xs" /> MRI Upload & Queue</h2>
                    <input ref={fileInputRef} type="file" multiple accept=".dcm,.nii,.nii.gz,image/*" className="hidden" onChange={onBrowse} />
                    <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5">
                      <FaCloudUploadAlt className="text-[10px]" /> Upload
                    </button>
                  </div>
                  <div className="p-5">
                    <div onDragOver={e => e.preventDefault()} onDrop={onDrop}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/30 transition">
                      <FaUpload className="text-slate-300 text-xl mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Drag & drop MRI files here</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">DICOM, NIfTI, or images</p>
                    </div>
                    <div className="mt-4 divide-y divide-slate-50">
                      {mriQueue.map(q => (
                        <div key={q.id} className="py-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><FaBrain className="text-blue-500 text-xs" /></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{q.id} · {q.patientId}</p>
                            <p className="text-[10px] text-slate-400">{formatTime(q.uploadedAt)}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${mriStatusColor(q.status)}`}>{q.status}</span>
                          {q.status === 'Completed' && (
                            <button onClick={() => setSelectedScan(q)} className="px-2 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 hover:bg-slate-50">Select</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* AI Prediction + Quick Chat side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AI Prediction */}
                  <section className="bg-white rounded-xl border border-slate-200 p-5">
                    <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4"><FaMicrochip className="text-blue-500 text-xs" /> AI Prediction</h2>
                    <select value={selectedScan?.id || ''} onChange={e => setSelectedScan(mriQueue.find(q => q.id === e.target.value) || null)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-300 mb-4">
                      <option value="" disabled>Select a completed scan…</option>
                      {completedScans.map(q => <option key={q.id} value={q.id}>{q.id} · {q.patientId}</option>)}
                    </select>
                    {selectedScan ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${prediction?.label === 'Abnormal' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>{prediction?.label}</span>
                          <span className="text-xs text-slate-500">Confidence: <strong>{prediction?.confidence}%</strong></span>
                        </div>
                        <div className="aspect-video bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-300 text-xs">MRI preview / heatmap</div>
                        <button onClick={() => setShowHeatmap(true)} className="w-full py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-1.5"><FaEye className="text-[10px]" /> View Heatmap</button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Choose a completed scan above.</p>
                    )}
                  </section>

                  {/* Quick Chat */}
                  <section className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FaComments className="text-blue-500 text-xs" /> Quick Chat</h2>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-medium ${doctorOnline ? 'text-emerald-600' : 'text-slate-400'}`}>{doctorOnline ? 'Online' : 'Offline'}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={doctorOnline} onChange={e => setDoctorOnline(e.target.checked)} />
                          <div className="w-8 h-4 bg-slate-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition peer-checked:after:translate-x-4" />
                        </label>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-48">
                      {chatMessages.map(m => (
                        <div key={m.id} className={`flex ${m.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${m.from === 'doctor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'} px-3 py-2 rounded-xl max-w-[80%]`}>
                            <p className="text-xs">{m.text}</p>
                            <p className={`text-[9px] mt-0.5 ${m.from === 'doctor' ? 'text-blue-200' : 'text-slate-400'}`}>{formatTime(m.ts)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Write a message…" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-300" />
                      <button onClick={sendMessage} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"><FaPaperPlane className="text-xs" /></button>
                    </div>
                  </section>
                </div>
              </div>

              {/* RIGHT — 4 cols sidebar */}
              <aside className="xl:col-span-4 space-y-5">
                {/* Analytics */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><FaChartLine className="text-blue-500 text-xs" /> Analytics</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: 'Patients', value: analytics.totalPatients, icon: FaUsers, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                      { label: 'Pending', value: analytics.pendingReports, icon: FaFileAlt, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                      { label: 'Completed', value: analytics.completed, icon: FaCheckCircle, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                      { label: 'Avg Wait', value: `${analytics.avgWaitMins}m`, icon: FaClock, color: 'bg-slate-50 text-slate-600 border-slate-200' },
                    ].map(s => (
                      <div key={s.label} className={`rounded-xl p-3 border ${s.color}`}>
                        <div className="flex items-center gap-1 mb-1"><s.icon className="text-[9px] opacity-60" /><span className="text-[10px] font-semibold opacity-70">{s.label}</span></div>
                        <p className="text-xl font-bold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Referrals Summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><FaUsers className="text-blue-500 text-xs" /> Referrals</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <span className="text-xs text-blue-700">Received</span>
                      <span className="text-sm font-bold text-blue-700">{receivedReferrals.length}</span>
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <span className="text-xs text-slate-600">Sent</span>
                      <span className="text-sm font-bold text-slate-700">{sentReferrals.length}</span>
                    </div>
                  </div>
                  <button onClick={() => navigate('/referred-patients')} className="w-full mt-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50 transition">View Referrals →</button>
                </div>

                {/* Quick links */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-800 mb-3">Quick Links</h3>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Patient List', icon: FaUsers, route: '/patients' },
                      { label: 'Reports', icon: FaFileAlt, route: '/reports' },
                      { label: 'Audit Logs', icon: FaClock, route: '/audit-logs' },
                    ].map(l => (
                      <button key={l.label} onClick={() => navigate(l.route)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition">
                        <l.icon className="text-[10px] text-slate-400" /> {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold text-slate-700 mb-1">💡 Tip</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">Use the MRI queue to monitor processing. Click "Select" on completed scans to view AI predictions and heatmaps.</p>
                </div>
              </aside>
            </div>

            {/* Footer */}
            <div className="mt-10 pb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center"><FaBrain className="text-white text-[9px]" /></div>
                <span className="text-sm font-semibold text-slate-700">NeuroCare</span>
              </div>
              <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} NeuroCare · Doctor Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ Heatmap Modal ━━━ */}
      {showHeatmap && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2"><FaBrain className="text-blue-500 text-xs" /> MRI Heatmap</h3>
              <button onClick={() => setShowHeatmap(false)} className="text-slate-400 hover:text-slate-600 transition"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="aspect-video bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-300 text-sm">Heatmap visualization</div>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setShowHeatmap(false)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
