import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaUser, FaComments, FaStethoscope, FaClipboardCheck, FaExchangeAlt, FaCreditCard } from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const { user, authChecked } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [showRefer, setShowRefer] = useState(false);
  const [referForAppt, setReferForAppt] = useState(null);
  const [referDoctors, setReferDoctors] = useState([]);
  const [referDoctorId, setReferDoctorId] = useState('');
  const [referReason, setReferReason] = useState('');
  const [referNotes, setReferNotes] = useState('');
  const [referError, setReferError] = useState('');
  const [referLoading, setReferLoading] = useState(false);

  useEffect(() => {
    if (!authChecked) return;
    const load = async () => {
      setLoading(true);
      setError('');
      const res = await mongodbService.doctorListAppointments();
      if (res.error) setError(res.error.message);
      setAppointments(res.data || []);
      setLoading(false);
    };
    load();
  }, [authChecked]);

  const openRefer = async (appt) => {
    setReferForAppt(appt);
    setShowRefer(true);
    setReferError('');
    setReferDoctorId('');
    setReferReason('');
    setReferNotes('');
    const docs = await mongodbService.listDoctors('');
    const sameHospital = (docs.data || []).filter(d => {
      const myHospital = String(user?.hospital || '').trim().toLowerCase();
      const theirHospital = String(d.hospital || '').trim().toLowerCase();
      return myHospital && theirHospital && myHospital === theirHospital;
    });
    setReferDoctors(sameHospital);
  };

  const submitReferral = async () => {
    try {
      if (!referDoctorId || !referReason) {
        setReferError('Select doctor and add reason');
        return;
      }
      setReferLoading(true);
      const res = await mongodbService.createReferral({
        referredTo: referDoctorId,
        patientId: String(referForAppt?.patient?.id),
        reason: referReason,
        notes: referNotes
      });
      if (res.error) throw new Error(res.error.message);
      setShowRefer(false);
    } catch (e) {
      setReferError(e.message || 'Failed to create referral');
    } finally {
      setReferLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter(a =>
      [a.patientName, a.patientId, a.status, a.notes]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(q))
    );
  }, [appointments, query]);


  const updateConsultationStatus = async (id, consultationStatus) => {
    try {
      setUpdatingId(id);
      // For now, we'll update the local state. In a real app, you'd have a backend endpoint for this
      setAppointments(prev => prev.map(a => 
        a.id === id ? { ...a, consultationStatus } : a
      ));
    } catch (e) {
      setError(e.message || 'Failed to update consultation status');
    } finally {
      setUpdatingId('');
    }
  };

  const getConsultationStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Appointments</h1>
              <p className="text-gray-600">Manage your patient appointments and consultations</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/doctor-dashboard')} 
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/doctor-chat')} 
                className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 transition-colors"
              >
                <FaComments /> Chat
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                value={query} 
                onChange={e=>setQuery(e.target.value)} 
                placeholder="Search patients, status, notes" 
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
              />
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {filtered.length} appointment{filtered.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {/* Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
              {/* Patient Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {(a?.patient?.name || 'P')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg truncate">{a?.patient?.name || 'Patient'}</h3>
                  <p className="text-sm text-gray-500">ID: {a?.patient?.id || '—'}</p>
                  {a?.patient?.email && (
                    <p className="text-xs text-gray-400 truncate">{a.patient.email}</p>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Date & Time</span>
                  <span className="font-semibold text-gray-900">{a.date ? `${a.date} ${a.time || ''}` : '—'}</span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Mode</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">{a.mode || 'online'}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-600">Consultation</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConsultationStatusBadge(a.consultationStatus || 'scheduled')}`}>
                    {a.consultationStatus || 'Scheduled'}
                  </span>
                </div>

                {a.notes && (
                  <div className="pt-3 border-t border-gray-100">
                    <span className="text-sm font-medium text-gray-600 block mb-2">Appointment Notes</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{a.notes}</p>
                  </div>
                )}

                {/* Additional Patient Information */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {a?.patient?.phone && (
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Phone</span>
                        <p className="font-semibold text-gray-700 mt-1">{a.patient.phone}</p>
                      </div>
                    )}
                    {a?.patient?.date_of_birth && (
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Age</span>
                        <p className="font-semibold text-gray-700 mt-1">
                          {new Date().getFullYear() - new Date(a.patient.date_of_birth).getFullYear()} years
                        </p>
                      </div>
                    )}
                    {a?.patient?.gender && (
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Gender</span>
                        <p className="font-semibold text-gray-700 mt-1 capitalize">{a.patient.gender}</p>
                      </div>
                    )}
                    {a?.patient?.bloodType && (
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Blood Type</span>
                        <p className="font-semibold text-gray-700 mt-1">{a.patient.bloodType}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                {a.payment && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaCreditCard className="text-green-600" />
                        <span className="text-sm font-medium text-gray-600">Payment Details</span>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Paid
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Amount</span>
                        <p className="font-semibold text-gray-700 mt-1">₹{a.payment.amount}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Payment ID</span>
                        <p className="font-semibold text-gray-700 mt-1 text-xs">
                          {a.payment.razorpay_payment_id ? a.payment.razorpay_payment_id.slice(-8) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Paid At</span>
                        <p className="font-semibold text-gray-700 mt-1 text-xs">
                          {a.payment.paidAt ? new Date(a.payment.paidAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Currency</span>
                        <p className="font-semibold text-gray-700 mt-1">{a.payment.currency || 'INR'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {/* Consultation buttons - all appointments are automatically approved */}
                {(!a.consultationStatus || a.consultationStatus === 'scheduled') && (
                  <button 
                    disabled={updatingId===a.id} 
                    onClick={()=>updateConsultationStatus(a.id, 'in-progress')} 
                    className="w-full px-4 py-3 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    <FaStethoscope /> Start Consultation
                  </button>
                )}
                {a.consultationStatus === 'in-progress' && (
                  <button 
                    disabled={updatingId===a.id} 
                    onClick={()=>updateConsultationStatus(a.id, 'completed')} 
                    className="w-full px-4 py-3 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 flex items-center justify-center gap-2 disabled:opacity-50 text-sm font-medium transition-colors"
                  >
                    <FaClipboardCheck /> Complete
                  </button>
                )}
                
                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={()=>navigate('/doctor-patient-chat', { state: { patientId: a?.patient?.id, patientName: a?.patient?.name } })} 
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <FaComments /> Chat
                  </button>
                  
                  <button
                    onClick={()=>openRefer(a)}
                    className="flex-1 px-3 py-2 rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                  >
                    <FaExchangeAlt /> Refer
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <FaCalendarAlt className="text-2xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments</h3>
              <p className="text-gray-500">No appointments found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
      {showRefer && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-semibold">Refer Patient</div>
              <button onClick={()=>setShowRefer(false)} className="text-gray-500 hover:text-gray-800">✕</button>
            </div>
            <div className="p-4 space-y-3">
              {referError && <div className="p-2 text-sm rounded bg-red-50 text-red-700 border border-red-200">{referError}</div>}
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Doctor</label>
                <select value={referDoctorId} onChange={e=>setReferDoctorId(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="">Choose…</option>
                  {referDoctors.filter(d=>String(d.id)!==String(user?._id)).map(d => (
                    <option key={d.id} value={String(d.id)}>{d.name} — {d.specialization || 'General'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Reason for referral</label>
                <input value={referReason} onChange={e=>setReferReason(e.target.value)} className="w-full border rounded-lg px-3 py-2" placeholder="e.g., Specialized epilepsy management" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={referNotes} onChange={e=>setReferNotes(e.target.value)} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="Add any relevant context" />
              </div>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button onClick={()=>setShowRefer(false)} className="px-3 py-2 rounded-lg border">Cancel</button>
              <button disabled={referLoading} onClick={submitReferral} className="px-3 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50">{referLoading?'Sending…':'Send Referral'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


