import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaEye,
  FaSync,
  FaSearch,
  FaFilter,
  FaCheck,
  FaTimes,
  FaHourglassHalf,
  FaPaperPlane,
  FaInbox,
  FaChevronRight,
  FaUserMd,
} from 'react-icons/fa';
import { mongodbService } from '../lib/mongodb';

// Small colored status pill with dot
const StatusPill = ({ status }) => {
  const s = (status || '').toLowerCase();
  const map = {
    accepted: { wrap: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
    pending: { wrap: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    completed: { wrap: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
    declined: { wrap: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
    default: { wrap: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' },
  };
  const cfg = map[s] || map.default;
  return (
    <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.wrap}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status || '—'}
    </span>
  );
};

export default function ReferredPatients() {
  const navigate = useNavigate();

  // data & ui state
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | accepted | completed | declined

  // load data
  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [rec, snt] = await Promise.all([
        mongodbService.listReceivedReferrals(),
        mongodbService.listSentReferrals(),
      ]);
      setReceived(rec?.data || []);
      setSent(snt?.data || []);
    } catch (e) {
      setError(e?.message || 'Failed to load referrals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, status) => {
    await mongodbService.updateReferralStatus(id, status);
    await load();
  };

  // derived values
  const norm = (v) => (v || '').toString().toLowerCase();
  const searchMatch = (r) => {
    const q = norm(search);
    if (!q) return true;
    const fields = [
      r?.patient?.name,
      r?.patient?.email,
      r?.referredBy?.name,
      r?.referredTo?.name,
      r?.reason,
      r?.status,
    ];
    return fields.some((f) => norm(f).includes(q));
  };
  const statusMatch = (r) => statusFilter === 'all' || norm(r?.status) === statusFilter;

  const filteredReceived = useMemo(
    () => received.filter((r) => searchMatch(r) && statusMatch(r)),
    [received, search, statusFilter]
  );
  const filteredSent = useMemo(
    () => sent.filter((r) => searchMatch(r) && statusMatch(r)),
    [sent, search, statusFilter]
  );

  const stats = useMemo(() => {
    const totalReceived = received.length;
    const totalSent = sent.length;
    const pending = received.filter((r) => norm(r.status) === 'pending').length;
    return { totalReceived, totalSent, pending };
  }, [received, sent]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Top header with subtle gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute -top-12 -right-24 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-16 -left-24 w-72 h-72 bg-purple-100 rounded-full blur-3xl opacity-60" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-sm">
                  <FaUsers />
                </span>
                Referred Patients
              </h1>
              <p className="mt-2 text-slate-600 max-w-2xl">
                Manage referrals with a clear, modern interface. Track received and sent referrals, act on pending items, and open chats.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/doctor-dashboard')}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Back to Dashboard
              </button>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <FaSync className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Received</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-2xl font-bold text-slate-900">{stats.totalReceived}</div>
                <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                  <FaInbox /> Received
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Pending Actions</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
                <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">
                  <FaHourglassHalf /> Pending
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Sent</div>
              <div className="mt-1 flex items-end justify-between">
                <div className="text-2xl font-bold text-slate-900">{stats.totalSent}</div>
                <span className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-violet-50 text-violet-700">
                  <FaPaperPlane /> Sent
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content card */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-10">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-4 md:px-6 pt-4">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveTab('received')}
                className={`${
                  activeTab === 'received' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                } px-4 py-2 rounded-lg transition`}
              >
                Received
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`${
                  activeTab === 'sent' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600'
                } px-4 py-2 rounded-lg transition`}
              >
                Sent
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm w-full md:w-80">
                <FaSearch className="text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by patient, doctor, reason..."
                  className="w-full outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent"
                />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm">
                <FaFilter className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm text-slate-700 bg-transparent outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div className="px-4 md:px-6 pb-6">
            {error && (
              <div className="mt-4 mb-2 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            {activeTab === 'received' && (
              <section className="mt-4">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-600">
                        <th className="py-3.5 px-3 font-semibold">Patient</th>
                        <th className="py-3.5 px-3 font-semibold">From</th>
                        <th className="py-3.5 px-3 font-semibold">Reason</th>
                        <th className="py-3.5 px-3 font-semibold">Status</th>
                        <th className="py-3.5 px-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-500">
                            <span className="inline-flex items-center gap-2 text-sm"><FaSync className="animate-spin" /> Loading referrals…</span>
                          </td>
                        </tr>
                      )}

                      {!loading && filteredReceived.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900">{r?.patient?.name || 'Patient'}</div>
                            <div className="text-xs text-slate-500">{r?.patient?.email || ''}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{r?.referredBy?.name || '—'}</td>
                          <td className="py-3 px-3 text-slate-700 truncate max-w-[320px]" title={r?.reason}>{r?.reason}</td>
                          <td className="py-3 px-3"><StatusPill status={r?.status} /></td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {r.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => act(r.id, 'accepted')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-green-300 text-green-700 hover:bg-green-50"
                                  >
                                    <FaCheck /> Accept
                                  </button>
                                  <button
                                    onClick={() => act(r.id, 'declined')}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50"
                                  >
                                    <FaTimes /> Decline
                                  </button>
                                </>
                              )}
                              {r.status === 'accepted' && (
                                <button
                                  onClick={() => act(r.id, 'completed')}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                  <FaCheck /> Mark Completed
                                </button>
                              )}
                              <button
                                onClick={() => navigate('/doctor-patient-chat')}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                              >
                                <FaEye /> Open Chat
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {!loading && filteredReceived.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-14 text-center">
                            <div className="inline-flex flex-col items-center gap-2 text-slate-500">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <FaInbox />
                              </div>
                              <div className="font-medium">No received referrals</div>
                              <div className="text-xs">Try adjusting filters or refreshing.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'sent' && (
              <section className="mt-4">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-slate-600">
                        <th className="py-3.5 px-3 font-semibold">Patient</th>
                        <th className="py-3.5 px-3 font-semibold">To</th>
                        <th className="py-3.5 px-3 font-semibold">Reason</th>
                        <th className="py-3.5 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading && (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-slate-500">
                            <span className="inline-flex items-center gap-2 text-sm"><FaSync className="animate-spin" /> Loading referrals…</span>
                          </td>
                        </tr>
                      )}

                      {!loading && filteredSent.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-900">{r?.patient?.name || 'Patient'}</div>
                            <div className="text-xs text-slate-500">{r?.patient?.email || ''}</div>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{r?.referredTo?.name || '—'}</td>
                          <td className="py-3 px-3 text-slate-700 truncate max-w-[320px]" title={r?.reason}>{r?.reason}</td>
                          <td className="py-3 px-3"><StatusPill status={r?.status} /></td>
                        </tr>
                      ))}

                      {!loading && filteredSent.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-14 text-center">
                            <div className="inline-flex flex-col items-center gap-2 text-slate-500">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <FaPaperPlane />
                              </div>
                              <div className="font-medium">No sent referrals</div>
                              <div className="text-xs">Try adjusting filters or refreshing.</div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* bottom helper */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Need help? Contact your administrator or return to{' '}
          <button onClick={() => navigate('/doctor-dashboard')} className="text-blue-700 hover:underline">Doctor Dashboard</button>.
        </div>
      </div>
    </div>
  );
}