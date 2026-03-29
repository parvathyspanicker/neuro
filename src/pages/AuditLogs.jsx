import React, { useEffect, useMemo, useState } from 'react';
import { mongodbService } from '../lib/mongodb';
import { FaSearch, FaSyncAlt, FaExclamationTriangle, FaClock, FaUser, FaFileAlt, FaComments, FaEdit, FaEye } from 'react-icons/fa';

// Simple Audit Logs page for doctors
// - Fetches logs from /doctor/audit-logs (via mongodbService.doctorAuditLogs)
// - Provides search and basic filters
// - Gracefully handles API not available

const badgeClass = (type) => {
  const base = 'px-2 py-0.5 rounded-full text-xs font-semibold';
  switch ((type || '').toLowerCase()) {
    case 'view':
      return `${base} bg-blue-100 text-blue-700`;
    case 'edit':
      return `${base} bg-amber-100 text-amber-700`;
    case 'prescription':
      return `${base} bg-green-100 text-green-700`;
    case 'chat':
      return `${base} bg-purple-100 text-purple-700`;
    case 'login':
      return `${base} bg-gray-100 text-gray-700`;
    default:
      return `${base} bg-slate-100 text-slate-700`;
  }
};

const iconFor = (type) => {
  switch ((type || '').toLowerCase()) {
    case 'view':
      return <FaEye className="text-blue-600" />;
    case 'edit':
      return <FaEdit className="text-amber-600" />;
    case 'prescription':
      return <FaFileAlt className="text-green-600" />;
    case 'chat':
      return <FaComments className="text-purple-600" />;
    default:
      return <FaUser className="text-slate-600" />;
  }
};

export default function AuditLogs() {
  const [query, setQuery] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      // page 1, limit 50 for now
      const res = await mongodbService.doctorAuditLogs?.(1, 50);
      if (res?.error) throw new Error(res.error.message);
      setLogs(Array.isArray(res?.data) ? res.data : (res?.data?.logs || []));
    } catch (e) {
      setError(e?.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = useMemo(() => {
    if (!query) return logs;
    const q = query.toLowerCase();
    return logs.filter((l) =>
      [l?.action, l?.entityType, l?.entityId, l?.user?.name, l?.ip]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [logs, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaClock /> Audit Logs
          </h1>
          <button
            onClick={loadLogs}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-slate-700 border border-gray-200 hover:bg-gray-50 shadow-sm"
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>

        <div className="mb-4 relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions, patient, IP..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/60 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left p-3">When</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Target</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">IP</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={6}>Loading...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="p-4 text-center text-slate-500" colSpan={6}>No logs found.</td>
                  </tr>
                ) : (
                  filtered.map((l, i) => (
                    <tr key={l.id || i} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="p-3 text-slate-600">{new Date(l?.timestamp || l?.ts || Date.now()).toLocaleString()}</td>
                      <td className="p-3 flex items-center gap-2">
                        {iconFor(l?.action)}
                        <span className={badgeClass(l?.action)}>{(l?.action || 'action').toUpperCase()}</span>
                      </td>
                      <td className="p-3 text-slate-700">{l?.entityType || 'N/A'}{l?.entityId ? ` • ${l.entityId}` : ''}</td>
                      <td className="p-3 text-slate-700">{l?.user?.name || l?.userName || 'Unknown'}</td>
                      <td className="p-3 text-slate-700">{l?.ip || '-'}</td>
                      <td className="p-3 text-slate-700">{l?.status || 'OK'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          For compliance, all access and changes are recorded. Contact admin if you notice any anomalies.
        </p>
      </div>
    </div>
  );
}