import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaStethoscope,
  FaTimes,
  FaBrain,
  FaChevronDown,
  FaBars,
  FaSignOutAlt,
  FaHeartbeat,
  FaShieldAlt,
  FaArrowRight,
  FaCalendarCheck,
  FaBolt,
} from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';

const statusBadge = (status) => {
  const base = 'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border';
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return `${base} bg-green-50 text-green-700 border-green-200`;
  if (s === 'rejected') return `${base} bg-red-50 text-red-700 border-red-200`;
  if (s === 'cancelled') return `${base} bg-gray-100 text-gray-700 border-gray-200`;
  return `${base} bg-amber-50 text-amber-700 border-amber-200`;
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

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    const load = async () => {
      setLoading(true);
      setError('');
      const [docRes, apptRes] = await Promise.all([
        mongodbService.listDoctors(''),
        mongodbService.listAppointments(),
      ]);
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
      if (!date) {
        setAvailability([]);
        setDoctorSlots([]);
        return;
      }
      const { data, error: availabilityError } = await mongodbService.listAvailabilityByDate(date);
      if (availabilityError) {
        setError(availabilityError.message);
        setAvailability([]);
      } else {
        setAvailability(data || []);
        const sel = (data || []).find((a) => String(a?.doctor?.id) === String(selectedDoctorId));
        setDoctorSlots(sel?.slots || []);
        setSelectedDoctorFee(sel?.doctor?.consultationFeeInRupees ?? null);
      }
    };
    fetchAvail();
  }, [date, selectedDoctorId]);

  const filteredDoctors = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return doctors;
    return doctors.filter((d) =>
      [d.name, d.email, d.specialization, d.hospital]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [search, doctors]);

  const openDoctorModal = (doctor) => {
    setDoctorModalData(doctor);
    setDoctorModalOpen(true);
  };

  const closeDoctorModal = () => {
    setDoctorModalOpen(false);
    setDoctorModalData(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // If doctor has consultation fee, redirect to payment page
    if (selectedDoctorFee && selectedDoctorFee > 0) {
      const appointmentData = {
        doctorId: selectedDoctorId,
        date,
        time,
        notes,
        mode,
      };
      
      const doctorData = {
        id: selectedDoctorId,
        name: doctors.find(d => String(d.id) === String(selectedDoctorId))?.name,
        specialization: doctors.find(d => String(d.id) === String(selectedDoctorId))?.specialization,
        hospital: doctors.find(d => String(d.id) === String(selectedDoctorId))?.hospital,
        avatar: doctors.find(d => String(d.id) === String(selectedDoctorId))?.avatar,
        fee: selectedDoctorFee,
      };
      
      navigate('/payment', { 
        state: { 
          appointmentData, 
          doctorData 
        } 
      });
      return;
    } else {
      // For doctors without consultation fee, use the old flow
      const payload = {
        doctorId: selectedDoctorId,
        date,
        time,
        notes,
        mode,
      };
      const { data, error: submitError } = await mongodbService.createAppointment(payload);
      if (submitError) {
        setError(submitError.message);
      } else if (data) {
        setAppointments((prev) => [data, ...prev]);
        setSelectedDoctorId('');
        setDate('');
        setTime('');
        setNotes('');
        setMode('online');
      }
      setSubmitting(false);
    }
  };

  const cancel = async (id) => {
    const { error: cancelError } = await mongodbService.cancelAppointment(id);
    if (cancelError) setError(cancelError.message);
    else setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error signing out:', err);
    }
  };

  const upcomingAppointment = useMemo(() => {
    const parseDateTime = (appt) => {
      if (!appt?.date) return null;
      const dateString = `${appt.date}${appt.time ? ` ${appt.time}` : ''}`;
      const normalized = new Date(dateString.replace(/-/g, '/'));
      return Number.isNaN(normalized.getTime()) ? null : normalized.getTime();
    };

    return [...appointments]
      .map((appt) => ({ appt, time: parseDateTime(appt) }))
      .filter((entry) => entry.time)
      .sort((a, b) => a.time - b.time)[0]?.appt;
  }, [appointments]);

  const availableDoctorCount = date ? availability.length : filteredDoctors.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-sky-400/40 rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-transparent border-t-sky-400 rounded-full animate-spin-slow" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-screen bg-white text-gray-900 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-32 h-96 w-96 bg-blue-100/30 blur-3xl" />
          <div className="absolute top-0 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-green-100/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-[20rem] w-[20rem] -translate-x-1/2 bg-blue-100/20 blur-3xl" />
        </div>

        <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-xl px-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <FaBrain className="text-xl" />
            </div>
            <div>
              <p className="text-lg font-semibold">NeuroCare</p>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Appointment studio</p>
            </div>
          </div>
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <button
              onClick={() => navigate('/dashboard')}
              className="transition-colors text-gray-600 hover:text-blue-600"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/mri-analysis')}
              className="transition-colors text-gray-600 hover:text-blue-600"
            >
              Upload MRI
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="transition-colors text-gray-600 hover:text-blue-600"
            >
              My Reports
            </button>
            <span className="rounded-full bg-blue-50 px-4 py-1 text-blue-600">
              Appointments
            </span>
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="h-8 w-8 rounded-full border border-white/20 object-cover"
                />
                <span className="text-gray-700">{user?.user_metadata?.full_name || user?.email || 'User'}</span>
                <FaChevronDown className="text-xs" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="p-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => navigate('/help-support')}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                    >
                      Support
                    </button>
                    {user && user.role === 'admin' && (
                      <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-purple-700 transition hover:bg-purple-50"
                      >
                        Admin Dashboard
                      </button>
                    )}
                    <div className="my-2 border-t border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <FaSignOutAlt className="text-xs" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowMobileMenu((prev) => !prev)}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-700 transition hover:bg-gray-50 md:hidden"
          >
            <FaBars />
          </button>
        </div>
        {showMobileMenu && (
          <div className="md:hidden">
            <div className="space-y-2 border-t border-gray-200 py-5 text-sm text-gray-700">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setShowMobileMenu(false);
                }}
                className="block w-full rounded-xl bg-white px-4 py-2 text-left transition hover:bg-gray-50"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/mri-analysis');
                  setShowMobileMenu(false);
                }}
                className="block w-full rounded-xl bg-white px-4 py-2 text-left transition hover:bg-gray-50"
              >
                Upload MRI
              </button>
              <button
                onClick={() => {
                  navigate('/reports');
                  setShowMobileMenu(false);
                }}
                className="block w-full rounded-xl bg-white px-4 py-2 text-left transition hover:bg-gray-50"
              >
                My Reports
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setShowMobileMenu(false);
                }}
                className="block w-full rounded-xl bg-white px-4 py-2 text-left transition hover:bg-gray-50"
              >
                Profile
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="relative z-10">
        <section className="px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.4fr,1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-blue-50 px-4 py-1 text-xs tracking-wide text-blue-700">
                <FaShieldAlt className="text-[10px]" />
                Seamless neurocare journeys
              </div>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">
                Book brilliant <span className="text-blue-600">appointments</span> with specialists in seconds.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Discover curated neuro specialists, explore their availability, and confirm consultations in a cinematic interface designed to inspire confidence.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-700">
                <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
                  <FaHeartbeat className="text-rose-500" />
                  Personalised care
                </span>
                <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
                  <FaCalendarCheck className="text-green-600" />
                  Instant scheduling
                </span>
                <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
                  <FaBolt className="text-blue-600" />
                  Real-time updates
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-50 via-white to-transparent blur-3xl" />
              <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="flex items-center justify-between text-sm text-gray-700">
                  <span>Today&apos;s dashboard</span>
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs uppercase tracking-[0.4em] text-gray-500">
                    Live
                  </span>
                </div>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Available doctors</p>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{availableDoctorCount}</p>
                    <p className="text-xs text-gray-500">Curated specialists ready for your chosen day.</p>
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-600">Next appointment</p>
                    {upcomingAppointment ? (
                      <>
                        <p className="mt-2 text-lg font-semibold text-gray-900">{upcomingAppointment.doctor?.name || 'Specialist'}</p>
                        <p className="text-sm text-blue-700">
                          {upcomingAppointment.date} • {upcomingAppointment.time || 'TBD'} • {upcomingAppointment.mode?.toUpperCase() || 'ONLINE'}
                        </p>
                      </>
                    ) : (
                      <p className="mt-2 text-sm text-blue-700">No confirmed sessions yet. Plan your first visit today.</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const target = document.getElementById('booking-panel');
                      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="group inline-flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50"
                  >
                    Start booking
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-800 transition group-hover:bg-blue-600 group-hover:text-white">
                      <FaArrowRight />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex items-center gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <FaTimes className="text-red-500" />
                <span>{error}</span>
              </div>
            </div>
          </div>
        )}

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 rounded-3xl border border-gray-200 bg-white p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Progress</p>
              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Your appointment journey</h2>
                <div className="grid w-full gap-2 text-xs text-gray-700 md:w-auto md:grid-cols-3">
                  {['Request sent', 'Pending approval', 'Confirmed'].map((label, idx) => (
                    <div key={label} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                        {idx + 1}
                      </div>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-xs text-gray-600 sm:grid-cols-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-blue-700">1. Request sent</p>
                  <p className="mt-1 text-gray-700">The doctor receives your detailed request instantly.</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="text-gray-700">2. Pending approval</p>
                  <p className="mt-1">Get notified in real-time when your doctor responds.</p>
                </div>
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
                  <p className="text-green-700">3. Confirmed</p>
                  <p className="mt-1">Secure your slot with an optional one-click payment.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.6fr,1fr]" id="booking-panel">
              <div>
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">Choose your specialist</h3>
                    <p className="text-sm text-slate-300">Filter brilliant neuro experts and preview their availability.</p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, specialization, hospital"
                      className="w-full rounded-full border border-white/10 bg-white/10 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder-slate-400 outline-none transition focus:border-sky-400/60 focus:bg-slate-900/40"
                    />
                  </div>
                </div>

                {!date && (
                <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 shadow-sm border-l-4 border-l-amber-400">
                  <FaCalendarAlt className="text-amber-500" />
                  <span>Select a date to reveal live availability.</span>
                </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {(date
                    ? availability.map((a) => ({
                        doctorId: a?.doctor?.id,
                        name: a?.doctor?.name,
                        specialization: a?.doctor?.specialization,
                        hospital: a?.doctor?.hospital,
                        avatar: a?.doctor?.avatar,
                        fee: a?.doctor?.consultationFeeInRupees,
                        slots: a?.slots || [],
                      }))
                    : filteredDoctors.map((d) => ({
                        doctorId: d.id,
                        name: d.name,
                        specialization: d.specialization,
                        hospital: d.hospital,
                        avatar: d.avatar,
                        fee: d.consultationFeeInRupees,
                        slots: [],
                      }))
                  ).map((card) => (
                    <div
                      key={card.doctorId}
                      className={`group relative overflow-hidden rounded-3xl border bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 shadow-md hover:shadow-xl duration-300 ${
                        String(selectedDoctorId) === String(card.doctorId)
                          ? 'border-blue-400 ring-2 ring-blue-100'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-400/20" />
                      <div className="relative flex items-start gap-4">
                        <img
                          src={
                            card.avatar ||
                            `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(card.name || 'Doctor')}`
                          }
                          alt={card.name}
                          className="h-14 w-14 rounded-2xl border border-gray-200 object-cover shadow-lg"
                        />
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() =>
                              openDoctorModal({
                                id: card.doctorId,
                                name: card.name,
                                specialization: card.specialization,
                                hospital: card.hospital,
                                avatar: card.avatar,
                                fee: card.fee,
                              })
                            }
                            className="truncate text-left text-lg font-semibold text-gray-900 transition hover:text-blue-600"
                          >
                            {card.name}
                          </button>
                          <p className="truncate text-xs text-gray-600">
                            {card.specialization || 'Specialist'} • {card.hospital || 'Hospital'}
                          </p>
                          {typeof card.fee === 'number' && (
                            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-[11px] font-medium text-green-700">
                              ₹{card.fee} per consult
                            </div>
                          )}
                          {date && (
                            <div className="mt-2 text-xs text-blue-700">
                              {(card.slots || []).length} slots on {date}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="relative mt-5 grid grid-cols-2 gap-2 text-sm">
                        <button
                          onClick={() =>
                            openDoctorModal({
                              id: card.doctorId,
                              name: card.name,
                              specialization: card.specialization,
                              hospital: card.hospital,
                              avatar: card.avatar,
                              fee: card.fee,
                            })
                          }
                          className="rounded-2xl border border-gray-300 bg-white py-2 text-gray-700 transition hover:bg-gray-50 hover:border-blue-300"
                        >
                          View profile
                        </button>
                        <button
                          onClick={() => {
                            if (!date) {
                              setError('Please select a date first.');
                              return;
                            }
                            setSelectedDoctorId(card.doctorId);
                            const av = availability.find((a) => String(a?.doctor?.id) === String(card.doctorId));
                            setDoctorSlots(av?.slots || []);
                            setSelectedDoctorFee(av?.doctor?.consultationFeeInRupees ?? card.fee ?? null);
                            if (!(av?.slots || []).length) {
                              setError('Selected doctor has no slots on this date. Try another expert.');
                            } else {
                              setError('');
                            }
                          }}
                          className="rounded-2xl bg-blue-600 hover:bg-blue-700 py-2 font-semibold text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-blue-200"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {date && availability.length === 0 && (
                  <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">No specialists available on this date.</p>
                    <p className="mt-2 text-gray-600">Try exploring another day or reach out to your doctor to unlock more slots.</p>
                  </div>
                )}

                {!date && filteredDoctors.length === 0 && (
                  <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                    No doctors match your search just yet.
                  </div>
                )}
              </div>

              <div>
                <div className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-slate-400">
                    <FaCalendarAlt className="text-gray-500" />
                    Plan your visit
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-gray-900">Book consultation</h3>
                  <p className="text-sm text-gray-600">Craft your perfect appointment with tailored preferences.</p>

                  {selectedDoctorId ? (
                    <div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 shadow-sm">
                      <span className="font-semibold text-gray-900">
                        Booking with {doctors.find((d) => String(d.id) === String(selectedDoctorId))?.name || 'selected doctor'}
                      </span>
                      {selectedDoctorFee != null && <span className="ml-2">• Fee: ₹{selectedDoctorFee}</span>}
                    </div>
                  ) : (
                    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 shadow-sm border-l-4 border-l-amber-400">
                      <FaSearch className="text-amber-500" />
                      <span>Select a doctor to unlock appointment options.</span>
                    </div>
                  )}

                  <form onSubmit={submit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="relative">
                        <span className="absolute left-4 top-3 text-xs uppercase tracking-[0.3em] text-gray-500">Date</span>
                        <input
                          type="date"
                          value={date}
                          onChange={(e) => {
                            setDate(e.target.value);
                            setTime('');
                          }}
                          required
                          className="mt-6 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                        />
                      </label>
                      <label className="relative">
                        <span className="absolute left-4 top-3 text-xs uppercase tracking-[0.3em] text-gray-500">Time</span>
                        {selectedDoctorId && date ? (
                          <select
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="mt-6 w-full appearance-none rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                          >
                            <option value="" disabled>
                              Select a slot
                            </option>
                            {doctorSlots.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            disabled
                            className="mt-6 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500"
                          />
                        )}
                      </label>
                    </div>

                    <div className="grid gap-4 text-sm sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setMode('online')}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 transition ${
                          mode === 'online'
                            ? 'border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Online session
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode('offline')}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 transition ${
                          mode === 'offline'
                            ? 'border-green-300 bg-green-50 text-green-700 ring-2 ring-green-100'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        In-person visit
                      </button>
                    </div>

                    <label className="block text-sm text-gray-700">
                      Notes for your doctor
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Symptoms, questions, or goals for the session"
                        className="mt-2 h-28 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                      />
                    </label>

                    <button
                      disabled={submitting || paying || !selectedDoctorId}
                      className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-semibold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-blue-200"
                    >
                      {submitting || paying ? (paying ? 'Processing payment…' : 'Booking…') : (selectedDoctorFee && selectedDoctorFee > 0 ? 'Book & Pay' : 'Book appointment')}
                    </button>
                  </form>

                  {selectedDoctorId && selectedDoctorFee != null && selectedDoctorFee > 0 && (
                    <div className="mt-6 space-y-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                      <p className="font-semibold text-gray-900">Consultation Fee: ₹{selectedDoctorFee}</p>
                      <p>Payment will be processed automatically when you book the appointment.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 rounded-[2.5rem] border border-gray-200 bg-white p-6 shadow-2xl">
              <div className="flex flex-col gap-3 border-b border-white/5 pb-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">My appointments</h3>
                  <p className="text-sm text-gray-600">Track upcoming sessions, reschedule with a tap, or cancel gracefully.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-gray-500">
                  <FaCalendarCheck />
                  Overview
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12 text-center text-gray-600">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-600">
                    <FaStethoscope className="text-2xl" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">No appointments yet</p>
                    <p className="text-sm text-gray-600">Discover a specialist to begin your neurocare journey.</p>
                  </div>
                </div>
              ) : (
                <div className="relative mt-8 space-y-6">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />
                  {appointments.map((a) => (
                    <div
                      key={a.id}
                      className="relative rounded-3xl border border-gray-200 bg-white px-6 py-6 pl-16 shadow transition hover:border-blue-300"
                    >
                      <div className="absolute left-0 top-7 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        <FaStethoscope />
                      </div>
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-gray-900">
                            {a.doctor?.name || 'Doctor'}
                            {a.doctor?.specialization && (
                              <span className="ml-2 text-xs text-gray-500">{a.doctor.specialization}</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600">
                            {a.date} • {a.time} • Mode: {a.mode || mode || 'online'}
                          </p>
                          {a.notes && <p className="mt-1 text-xs text-gray-500">Notes: {a.notes}</p>}
                        </div>
                        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                          <span className={statusBadge(a.status)}>
                            {a.status ? `${String(a.status).charAt(0).toUpperCase()}${String(a.status).slice(1)}` : 'Pending'}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                              onClick={() => {
                                setSelectedDoctorId(a.doctor?.id || a.doctorId);
                                setDate(a.date);
                                setTime(a.time);
                                setMode(a.mode || 'online');
                              }}
                            >
                              Reschedule
                            </button>
                            <button
                              onClick={() => cancel(a.id)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 transition hover:bg-red-100"
                            >
                              <FaTimes className="text-xs" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-12 flex items-center gap-3 text-sm text-gray-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-blue-600">
                <FaClock />
              </div>
              <p>Awaiting your doctor&apos;s review. We&apos;ll notify you instantly when the status changes.</p>
            </div>
          </div>
        </section>
      </main>
        </div>

      {doctorModalOpen && doctorModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur" onClick={closeDoctorModal} />
          <div className="relative mx-4 w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
            <div className="bg-gradient-to-r from-sky-500/10 via-white/5 to-transparent p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img
                    src={
                      doctorModalData.avatar ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(doctorModalData.name || 'Doctor')}`
                    }
                    alt={doctorModalData.name}
                    className="h-16 w-16 rounded-2xl border border-white/10 object-cover shadow-lg"
                  />
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-white">{doctorModalData.name}</p>
                    <p className="text-sm text-slate-300">
                      {doctorModalData.specialization || 'Specialist'} • {doctorModalData.hospital || 'Hospital'}
                    </p>
                    {doctorModalData.experience && (
                      <p className="mt-1 text-xs text-slate-300">Experience: {doctorModalData.experience} years</p>
                    )}
                  </div>
                </div>
                {typeof doctorModalData.fee === 'number' && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                    ₹{doctorModalData.fee}
                  </span>
                )}
                <button onClick={closeDoctorModal} className="text-slate-400 transition hover:text-white">
                  ✕
                </button>
              </div>
            </div>
            <div className="grid gap-6 p-6 text-sm text-slate-200 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">About</p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Email: {doctorModalData.email || 'Not provided'}</li>
                  <li>Phone: {doctorModalData.phone || 'Not provided'}</li>
                  <li>Hospital: {doctorModalData.hospital || 'Not provided'}</li>
                  <li>Specialization: {doctorModalData.specialization || 'Not provided'}</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Consultation</p>
                <ul className="mt-3 space-y-1 text-sm">
                  <li>Modes: Online & Offline</li>
                  <li>Availability: By appointment</li>
                  <li>Response time: Within 24 hours</li>
                  {typeof doctorModalData.fee === 'number' && (
                    <li className="mt-1">
                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[12px] font-semibold text-emerald-100">
                        Consultation Fee: ₹{doctorModalData.fee}
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex flex-col gap-3 p-6 sm:flex-row">
              <button
                onClick={() => {
                  setSelectedDoctorId(doctorModalData.id);
                  closeDoctorModal();
                }}
                className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition hover:from-sky-400 hover:to-cyan-300"
              >
                Book with this doctor
              </button>
              <button
                onClick={closeDoctorModal}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-slate-200 transition hover:border-sky-400/40 hover:bg-sky-500/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
