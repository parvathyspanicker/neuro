import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch, FaCalendarAlt, FaClock, FaStethoscope, FaTimes, FaBrain,
  FaChevronDown, FaBars, FaSignOutAlt, FaUser, FaCrown, FaHeadset,
  FaCalendarCheck, FaVideo, FaHospital, FaMapMarkerAlt, FaCheckCircle,
  FaExclamationTriangle, FaNotesMedical, FaRupeeSign,
} from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';

/* ── Status badge ── */
const statusBadge = (status) => {
  const s = String(status || '').toLowerCase();
  const base = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold';
  if (s === 'approved') return `${base} bg-emerald-50 text-emerald-700 border border-emerald-200`;
  if (s === 'rejected') return `${base} bg-red-50 text-red-600 border border-red-200`;
  if (s === 'cancelled') return `${base} bg-slate-100 text-slate-500 border border-slate-200`;
  return `${base} bg-amber-50 text-amber-700 border border-amber-200`;
};

const statusIcon = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return <FaCheckCircle className="text-emerald-500 text-[9px]" />;
  if (s === 'rejected') return <FaTimes className="text-red-500 text-[9px]" />;
  if (s === 'cancelled') return <FaTimes className="text-slate-400 text-[9px]" />;
  return <FaClock className="text-amber-500 text-[9px]" />;
};

export default function Appointments() {
  const { user, authChecked, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [mode, setMode] = useState('online');
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [selectedDoctorFee, setSelectedDoctorFee] = useState(null);
  const [paying, setPaying] = useState(false);

  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [doctorModalData, setDoctorModalData] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const pName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.user_metadata?.full_name || user?.email || 'User');

  useEffect(() => {
    if (!authChecked) return;
    if (!user) { navigate('/login', { replace: true }); return; }
    const load = async () => {
      setLoading(true); setError('');
      const [docRes, apptRes] = await Promise.all([mongodbService.listDoctors(''), mongodbService.listAppointments()]);
      if (docRes.error) setError(docRes.error.message);
      if (apptRes.error) setError(apptRes.error.message);
      setDoctors(docRes.data || []);
      setAppointments(apptRes.data || []);
      setLoading(false);
    };
    load();
  }, [authChecked, user, navigate]);

  useEffect(() => {
    const fetchAvail = async () => {
      if (!date) { setAvailability([]); setDoctorSlots([]); return; }
      const { data, error: availabilityError } = await mongodbService.listAvailabilityByDate(date);
      if (availabilityError) { setError(availabilityError.message); setAvailability([]); }
      else {
        setAvailability(data || []);
        const sel = (data || []).find(a => String(a?.doctor?.id) === String(selectedDoctorId));
        setDoctorSlots(sel?.slots || []);
        setSelectedDoctorFee(sel?.doctor?.consultationFeeInRupees ?? null);
      }
    };
    fetchAvail();
  }, [date, selectedDoctorId]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter(d => [d.name, d.email, d.specialization, d.hospital].filter(Boolean).some(v => String(v).toLowerCase().includes(q)));
  }, [search, doctors]);

  const openDoctorModal = (doctor) => { setDoctorModalData(doctor); setDoctorModalOpen(true); };
  const closeDoctorModal = () => { setDoctorModalOpen(false); setDoctorModalData(null); };

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true); setError('');
    if (selectedDoctorFee && selectedDoctorFee > 0) {
      const doctorData = {
        id: selectedDoctorId,
        name: doctors.find(d => String(d.id) === String(selectedDoctorId))?.name,
        specialization: doctors.find(d => String(d.id) === String(selectedDoctorId))?.specialization,
        hospital: doctors.find(d => String(d.id) === String(selectedDoctorId))?.hospital,
        avatar: doctors.find(d => String(d.id) === String(selectedDoctorId))?.avatar,
        fee: selectedDoctorFee,
      };
      navigate('/payment', { state: { appointmentData: { doctorId: selectedDoctorId, date, time, notes, mode }, doctorData } });
      return;
    }
    const { data, error: submitError } = await mongodbService.createAppointment({ doctorId: selectedDoctorId, date, time, notes, mode });
    if (submitError) setError(submitError.message);
    else if (data) { setAppointments(prev => [data, ...prev]); setSelectedDoctorId(''); setDate(''); setTime(''); setNotes(''); setMode('online'); }
    setSubmitting(false);
  };

  const cancel = async (id) => {
    const { error: cancelError } = await mongodbService.cancelAppointment(id);
    if (cancelError) setError(cancelError.message);
    else setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const handleLogout = async () => { try { await signOut(); navigate('/'); } catch (e) { console.error(e); } };

  const upcomingAppointment = useMemo(() => {
    return [...appointments]
      .map(appt => {
        if (!appt?.date) return null;
        const t = new Date(`${appt.date}${appt.time ? ` ${appt.time}` : ''}`.replace(/-/g, '/')).getTime();
        return Number.isNaN(t) ? null : { appt, time: t };
      })
      .filter(Boolean)
      .sort((a, b) => a.time - b.time)[0]?.appt;
  }, [appointments]);

  const selectedDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId));
  const doctorCards = date
    ? availability.map(a => ({ doctorId: a?.doctor?.id, name: a?.doctor?.name, specialization: a?.doctor?.specialization, hospital: a?.doctor?.hospital, avatar: a?.doctor?.avatar, fee: a?.doctor?.consultationFeeInRupees, slots: a?.slots || [] }))
    : filteredDoctors.map(d => ({ doctorId: d.id, name: d.name, specialization: d.specialization, hospital: d.hospital, avatar: d.avatar, fee: d.consultationFeeInRupees, slots: [] }));

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400">Loading appointments...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ━━━ Navbar ━━━ */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><FaBrain className="text-white text-sm" /></div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">NeuroCare</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Upload MRI', path: '/mri-analysis' },
              { label: 'Reports', path: '/reports' },
              { label: 'Appointments', path: '/appointments', active: true },
              { label: 'Doctor Chat', path: '/doctor-chat' },
            ].map(n => (
              <button key={n.path} onClick={() => navigate(n.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${n.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {n.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {pName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{pName}</span>
                <FaChevronDown className="text-[10px]" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1.5">
                  <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaUser className="text-xs text-slate-400" /> Profile</button>
                  <button onClick={() => navigate('/subscription')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaCrown className="text-xs text-slate-400" /> Subscription</button>
                  <button onClick={() => navigate('/help-support')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaHeadset className="text-xs text-slate-400" /> Support</button>
                  {user?.role === 'admin' && <button onClick={() => navigate('/admin-dashboard')} className="w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 flex items-center gap-2">Admin</button>}
                  <hr className="my-1.5 border-slate-100" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaSignOutAlt className="text-xs" /> Logout</button>
                </div>
              )}
            </div>
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><FaBars /></button>
          </div>
        </div>
        {showMobileMenu && (
          <div className="md:hidden border-t border-slate-100 mt-3 pt-3 pb-2 space-y-1">
            {['Dashboard', 'Upload MRI', 'Reports', 'Appointments', 'Doctor Chat'].map(l => (
              <button key={l} onClick={() => { navigate(`/${l.toLowerCase().replace(/\s+/g, '-')}`); setShowMobileMenu(false); }}
                className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">{l}</button>
            ))}
          </div>
        )}
      </nav>

      {/* ━━━ Main Content ━━━ */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
          <p className="text-sm text-slate-500 mt-1">Book consultations with neuro specialists and manage your sessions.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Doctors Available</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{date ? availability.length : filteredDoctors.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Total Appointments</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3.5 col-span-2">
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold">Next Session</p>
            {upcomingAppointment ? (
              <div className="mt-1">
                <p className="text-sm font-semibold text-slate-800">{upcomingAppointment.doctor?.name || 'Specialist'}</p>
                <p className="text-xs text-slate-500">{upcomingAppointment.date} · {upcomingAppointment.time || 'TBD'} · {upcomingAppointment.mode?.toUpperCase() || 'ONLINE'}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500 mt-1">No upcoming appointments</p>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <FaExclamationTriangle className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600"><FaTimes className="text-xs" /></button>
          </div>
        )}

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — Doctors list (8 cols) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search + filter */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Choose a Specialist</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{date ? `Showing availability for ${date}` : 'Select a date to see live availability'}</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, specialty..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
                </div>
              </div>
            </div>

            {!date && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-700">
                <FaCalendarAlt className="text-amber-400 text-[10px]" /> Select a date in the booking form to reveal live slots.
              </div>
            )}

            {/* Doctor cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {doctorCards.map(card => (
                <div key={card.doctorId}
                  className={`bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md cursor-pointer ${
                    String(selectedDoctorId) === String(card.doctorId)
                      ? 'border-blue-300 ring-2 ring-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    <img src={card.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(card.name || 'D')}`}
                      alt={card.name} className="w-11 h-11 rounded-xl border border-slate-100 object-cover flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => openDoctorModal({ id: card.doctorId, name: card.name, specialization: card.specialization, hospital: card.hospital, avatar: card.avatar, fee: card.fee })}
                        className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition truncate block text-left">{card.name}</button>
                      <p className="text-xs text-slate-400 truncate">{card.specialization || 'Specialist'} · {card.hospital || 'Hospital'}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {typeof card.fee === 'number' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100">
                            <FaRupeeSign className="text-[8px]" />{card.fee}
                          </span>
                        )}
                        {date && (
                          <span className="text-[10px] text-blue-600 font-medium">{card.slots.length} slot{card.slots.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openDoctorModal({ id: card.doctorId, name: card.name, specialization: card.specialization, hospital: card.hospital, avatar: card.avatar, fee: card.fee })}
                      className="flex-1 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium hover:bg-slate-50 transition">View Profile</button>
                    <button onClick={() => {
                      if (!date) { setError('Please select a date first.'); return; }
                      setSelectedDoctorId(card.doctorId);
                      const av = availability.find(a => String(a?.doctor?.id) === String(card.doctorId));
                      setDoctorSlots(av?.slots || []);
                      setSelectedDoctorFee(av?.doctor?.consultationFeeInRupees ?? card.fee ?? null);
                      if (!(av?.slots || []).length) setError('No slots available on this date.');
                      else setError('');
                    }}
                      className="flex-1 py-1.5 rounded-lg bg-blue-600 text-xs text-white font-semibold hover:bg-blue-700 transition">Select</button>
                  </div>
                </div>
              ))}
            </div>

            {date && availability.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <FaCalendarAlt className="text-slate-300 text-xl mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">No doctors available on {date}</p>
                <p className="text-xs text-slate-400 mt-1">Try selecting a different date.</p>
              </div>
            )}
            {!date && filteredDoctors.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-5 text-center">
                <p className="text-sm text-slate-500">No doctors match your search.</p>
              </div>
            )}
          </div>

          {/* RIGHT — Booking form (4 cols) */}
          <div className="lg:col-span-4 space-y-5">

            {/* Booking card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" id="booking-panel">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4">
                <p className="text-white font-semibold text-sm flex items-center gap-2"><FaCalendarCheck className="text-xs" /> Book Consultation</p>
                <p className="text-blue-200 text-xs mt-0.5">Select a doctor, date, and time slot.</p>
              </div>

              <div className="p-5">
                {selectedDoctor ? (
                  <div className="flex items-center gap-3 mb-4 bg-emerald-50 rounded-lg border border-emerald-100 p-3">
                    <img src={selectedDoctor.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(selectedDoctor.name || 'D')}`}
                      alt="" className="w-9 h-9 rounded-lg object-cover border border-emerald-200" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 truncate">{selectedDoctor.name}</p>
                      <p className="text-[10px] text-emerald-600">{selectedDoctorFee != null ? `₹${selectedDoctorFee} per consult` : 'Free consultation'}</p>
                    </div>
                    <button onClick={() => { setSelectedDoctorId(''); setDoctorSlots([]); }} className="text-slate-400 hover:text-red-500 transition"><FaTimes className="text-xs" /></button>
                  </div>
                ) : (
                  <div className="mb-4 flex items-center gap-2 bg-amber-50 rounded-lg border border-amber-100 p-3 text-xs text-amber-700">
                    <FaStethoscope className="text-amber-400 text-[10px]" /> Select a doctor from the list.
                  </div>
                )}

                <form onSubmit={submit} className="space-y-3.5">
                  {/* Date */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Date</label>
                    <input type="date" value={date} onChange={e => { setDate(e.target.value); setTime(''); }} required
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Time Slot</label>
                    {selectedDoctorId && date ? (
                      doctorSlots.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1.5">
                          {doctorSlots.map(slot => (
                            <button key={slot} type="button" onClick={() => setTime(slot)}
                              className={`py-1.5 rounded-lg text-xs font-medium transition ${time === slot ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}>
                              {slot}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic py-2">No slots on this date.</p>
                      )
                    ) : (
                      <div className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-400">
                        Select doctor & date first
                      </div>
                    )}
                  </div>

                  {/* Mode */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Consultation Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setMode('online')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${mode === 'online' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                        <FaVideo className="text-[10px]" /> Online
                      </button>
                      <button type="button" onClick={() => setMode('offline')}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition ${mode === 'offline' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
                        <FaHospital className="text-[10px]" /> In-Person
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">Notes for Doctor</label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Symptoms, questions, or goals..."
                      className="w-full h-20 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-300 outline-none resize-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition" />
                  </div>

                  {/* Fee info */}
                  {selectedDoctorId && selectedDoctorFee != null && selectedDoctorFee > 0 && (
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg border border-blue-100 px-3 py-2">
                      <span className="text-xs text-blue-600">Consultation Fee</span>
                      <span className="text-sm font-bold text-blue-700">₹{selectedDoctorFee}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button disabled={submitting || paying || !selectedDoctorId || !date || !time}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed">
                    {submitting || paying ? (paying ? 'Processing...' : 'Booking...') : (selectedDoctorFee && selectedDoctorFee > 0 ? `Book & Pay ₹${selectedDoctorFee}` : 'Book Appointment')}
                  </button>
                </form>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3">How It Works</p>
              <div className="space-y-3">
                {[
                  { step: '1', label: 'Request Sent', desc: 'Doctor receives your booking instantly', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { step: '2', label: 'Pending Review', desc: 'Get notified when doctor responds', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  { step: '3', label: 'Confirmed', desc: 'Your session is locked in', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                ].map(s => (
                  <div key={s.step} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5 border ${s.color}`}>{s.step}</div>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{s.label}</p>
                      <p className="text-[11px] text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── My Appointments ── */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2"><FaCalendarCheck className="text-blue-500 text-sm" /> My Appointments</h3>
              <p className="text-xs text-slate-400 mt-0.5">Track, reschedule, or cancel your sessions.</p>
            </div>
            <span className="text-xs text-slate-400">{appointments.length} total</span>
          </div>

          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center"><FaStethoscope className="text-slate-300 text-xl" /></div>
              <div>
                <p className="text-sm font-semibold text-slate-700">No appointments yet</p>
                <p className="text-xs text-slate-400 mt-0.5">Select a specialist above to get started.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {appointments.map(a => (
                <div key={a.id} className="px-6 py-4 hover:bg-slate-50/50 transition">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <FaStethoscope className="text-blue-500 text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {a.doctor?.name || 'Doctor'}
                          {a.doctor?.specialization && <span className="ml-1.5 text-[10px] text-slate-400 font-normal">· {a.doctor.specialization}</span>}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><FaCalendarAlt className="text-[9px]" /> {a.date}</span>
                          <span className="flex items-center gap-1"><FaClock className="text-[9px]" /> {a.time || 'TBD'}</span>
                          <span className="flex items-center gap-1">{a.mode === 'offline' ? <FaMapMarkerAlt className="text-[9px]" /> : <FaVideo className="text-[9px]" />} {a.mode || 'online'}</span>
                        </div>
                        {a.notes && <p className="text-[11px] text-slate-400 mt-1"><FaNotesMedical className="inline text-[9px] mr-1" />{a.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-12 md:ml-0">
                      <span className={statusBadge(a.status)}>
                        {statusIcon(a.status)}
                        {a.status ? `${String(a.status).charAt(0).toUpperCase()}${String(a.status).slice(1)}` : 'Pending'}
                      </span>
                      <button onClick={() => { setSelectedDoctorId(a.doctor?.id || a.doctorId); setDate(a.date); setTime(a.time); setMode(a.mode || 'online'); }}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium hover:bg-slate-50 transition">Reschedule</button>
                      <button onClick={() => cancel(a.id)}
                        className="px-2.5 py-1 rounded-lg border border-red-200 text-[11px] text-red-600 font-medium hover:bg-red-50 transition flex items-center gap-1">
                        <FaTimes className="text-[8px]" /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
          <FaClock className="text-[10px]" />
          <p>Appointments are subject to doctor approval. You'll be notified when the status changes.</p>
        </div>

        {/* Page footer */}
        <div className="mt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center"><FaBrain className="text-white text-[9px]" /></div>
            <span className="text-sm font-semibold text-slate-700">NeuroCare</span>
          </div>
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} NeuroCare · AI-Powered Neurological Analysis</p>
        </div>
      </div>

      {/* ━━━ Doctor Profile Modal ━━━ */}
      {doctorModalOpen && doctorModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeDoctorModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-5">
              <button onClick={closeDoctorModal} className="absolute top-4 right-4 text-slate-400 hover:text-white transition"><FaTimes /></button>
              <div className="flex items-center gap-4">
                <img src={doctorModalData.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctorModalData.name || 'D')}`}
                  alt={doctorModalData.name} className="w-14 h-14 rounded-xl border-2 border-white/20 object-cover" />
                <div>
                  <p className="text-white font-semibold text-lg">{doctorModalData.name}</p>
                  <p className="text-slate-300 text-sm">{doctorModalData.specialization || 'Specialist'} · {doctorModalData.hospital || 'Hospital'}</p>
                </div>
              </div>
            </div>
            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Specialization</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{doctorModalData.specialization || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Hospital</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">{doctorModalData.hospital || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Modes</p>
                  <p className="text-sm font-medium text-slate-700 mt-1">Online & In-Person</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Consultation Fee</p>
                  <p className="text-sm font-bold text-emerald-600 mt-1">{typeof doctorModalData.fee === 'number' ? `₹${doctorModalData.fee}` : 'Free'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setSelectedDoctorId(doctorModalData.id); closeDoctorModal(); }}
                  className="flex-1 py-2.5 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition">Book with this Doctor</button>
                <button onClick={closeDoctorModal}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
