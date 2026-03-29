import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  FaBrain, FaDownload, FaPrint, FaShare, FaCheckCircle,
  FaExclamationTriangle, FaClock, FaUserMd, FaPills,
  FaHeartbeat, FaDumbbell, FaUtensils, FaUser, FaCalendarCheck,
  FaChartLine, FaShieldAlt, FaFileAlt, FaMicroscope, FaNotesMedical,
  FaHospital, FaClipboardList, FaTimes, FaWhatsapp, FaEnvelope, FaCog,
  FaChevronDown, FaSignOutAlt, FaCrown, FaHeadset, FaBars,
  FaArrowLeft, FaStethoscope
} from 'react-icons/fa';

export default function FullReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef(null);

  useEffect(() => {
    const r = location.state?.report;
    if (r) setReport(r);
    setLoading(false);
  }, [location.state]);

  const handleLogout = async () => { try { await signOut(); navigate('/'); } catch (e) { console.error(e); } };
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  const handleDownload = async () => {
    if (!report || !reportRef.current || downloading) return;
    setDownloading(true);
    try {
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f8fafc',
        logging: false,
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add more pages if content overflows
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`NeuroCare_Report_${rid}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      // Fallback to text download
      const blob = new Blob([genText()], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `NeuroCare_Report_${rid}.txt`;
      document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); document.body.removeChild(a);
    } finally {
      setDownloading(false);
    }
  };

  // ── normalize fields ──
  const g = (a, b) => report?.[a] || report?.[b];
  const scanType = g('scanType', 'scan_type') || 'Brain MRI';
  const scanDate = g('scanDate', 'scan_date');
  const predicted = g('predictedResult', 'predicted_result') || 'N/A';
  const confidence = report?.confidence || 0;
  const stage = report?.stage || 'N/A';
  const severity = report?.severity || 'N/A';
  const diseaseDesc = report?.disease_info?.description || '';
  const regions = report?.brain_regions_affected || [];
  const findings = report?.findings || [];
  const treatments = report?.treatment_options || [];
  const recs = report?.recommendations || [];
  const notes = report?.doctorComments?.notes || report?.doctor_comments?.notes || 'AI analysis completed. Consult your neurologist for full evaluation.';
  const rx = report?.doctorComments?.prescription || report?.doctor_comments?.prescription || 'Consult your doctor for treatment options.';
  const tests = report?.doctorComments?.suggestedTests || report?.doctor_comments?.suggested_tests || ['Follow-up MRI in 6 months'];
  const exRec = report?.lifestyleSuggestions?.exercise || report?.lifestyle_suggestions?.exercise || '30 min moderate exercise daily';
  const diRec = report?.lifestyleSuggestions?.diet || report?.lifestyle_suggestions?.diet || 'Balanced diet rich in omega-3';
  const poRec = report?.lifestyleSuggestions?.posture || report?.lifestyle_suggestions?.posture || 'Proper posture, regular breaks';
  const nextAppt = g('nextAppointment', 'next_appointment');
  const rawHeatmap = g('heatmapImage', 'heatmap_image') || g('imagePath', 'image_path') || null;
  // Build full URL if it's a relative path
  const API_URL = import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002';
  const heatmap = rawHeatmap
    ? (rawHeatmap.startsWith('http') ? rawHeatmap : `${API_URL}${rawHeatmap.startsWith('/') ? '' : '/uploads/mri/'}${rawHeatmap.includes('/') ? rawHeatmap : rawHeatmap}`)
    : null;
  const rid = report?._id || report?.id || report?.analysis_id || 'N/A';
  const pName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.user_metadata?.full_name || user?.name || 'Patient');

  const genText = () => `NEUROCARE REPORT | ${rid}\nPatient: ${pName}\nScan: ${scanType} | ${fmt(scanDate)}\nDiagnosis: ${predicted} (${confidence}%)\nStage: ${stage} | Severity: ${severity}\n\nNotes: ${notes}\nRx: ${rx}\nTests: ${tests.join(', ')}\n\nTreatment: ${treatments.join('; ') || 'Consult neurologist'}\nRecommendations: ${recs.join('; ') || 'None'}\n\nLifestyle:\n  Exercise: ${exRec}\n  Diet: ${diRec}\n  Posture: ${poRec}\n\nNext Appointment: ${nextAppt ? fmt(nextAppt) : 'TBD'}\n\nDISCLAIMER: AI-generated, informational only. Consult a neurologist.`;

  // ── severity style ──
  const sevStyle = severity?.toLowerCase() === 'mild' ? 'text-emerald-600 bg-emerald-50' : severity?.toLowerCase() === 'severe' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><FaCog className="text-slate-400 text-3xl animate-spin" /></div>;

  if (!report) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5"><FaFileAlt className="text-slate-300 text-2xl" /></div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">No Report Found</h2>
        <p className="text-slate-500 text-sm mb-6">Select a report from your reports page to view.</p>
        <button onClick={() => navigate('/reports')} className="text-sm font-medium text-blue-600 hover:text-blue-700">← Back to Reports</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ━━━ Navbar ━━━ */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3.5 print:hidden sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center"><FaBrain className="text-white text-sm" /></div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">NeuroCare</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Upload MRI', path: '/mri-analysis' },
              { label: 'Reports', path: '/reports', active: true },
              { label: 'Appointments', path: '/appointments' },
              { label: 'Doctor Chat', path: '/doctor-chat' },
            ].map(n => (
              <button key={n.path} onClick={() => navigate(n.path)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${n.active ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                {n.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {pName.charAt(0).toUpperCase()}
              </div>
              <FaChevronDown className="text-[10px]" />
            </button>
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-50 py-1.5">
                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaUser className="text-xs text-slate-400" /> Profile</button>
                <button onClick={() => navigate('/subscription')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaCrown className="text-xs text-slate-400" /> Subscription</button>
                <button onClick={() => navigate('/help-support')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><FaHeadset className="text-xs text-slate-400" /> Support</button>
                <hr className="my-1.5 border-slate-100" />
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><FaSignOutAlt className="text-xs" /> Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ━━━ Breadcrumb + Actions ━━━ */}
      <div className="bg-white border-b border-slate-100 print:hidden">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/reports')} className="text-slate-400 hover:text-blue-600 transition flex items-center gap-1.5">
              <FaArrowLeft className="text-[10px]" /> Reports
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium">Full Report</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} disabled={downloading} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium transition ${downloading ? 'text-blue-600 bg-blue-50 border-blue-200 cursor-wait' : 'text-slate-600 hover:bg-slate-50'}`}>
              {downloading ? <FaCog className="text-[10px] animate-spin" /> : <FaDownload className="text-[10px]" />} {downloading ? 'Generating PDF...' : 'Download PDF'}
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition">
              <FaPrint className="text-[10px]" /> Print
            </button>
            <button onClick={() => setShowShareModal(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition">
              <FaShare className="text-[10px]" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* ━━━ Report Content ━━━ */}
      <div ref={reportRef} className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400"></div>
          <div className="px-8 py-7">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-slate-900">{scanType}</h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <FaCheckCircle className="text-[9px]" /> {report?.status || 'Analyzed'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">Report ID: <span className="font-mono">{rid}</span> · {fmt(scanDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Patient</p>
                  <p className="text-sm font-semibold text-slate-800">{pName}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {pName.charAt(0)}
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mb-0.5">Diagnosis</p>
                <p className="text-sm font-bold text-blue-700 leading-tight">{predicted}</p>
              </div>
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">Confidence</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-800">{confidence}%</p>
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${confidence}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl px-4 py-3 border border-amber-100">
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-semibold mb-0.5">Stage</p>
                <p className="text-sm font-bold text-amber-700">{stage}</p>
              </div>
              <div className={`rounded-xl px-4 py-3 border ${sevStyle.includes('emerald') ? 'border-emerald-100' : sevStyle.includes('red') ? 'border-red-100' : 'border-amber-100'} ${sevStyle}`}>
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-semibold mb-0.5">Severity</p>
                <p className="text-sm font-bold">{severity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT — 8 cols */}
          <div className="lg:col-span-8 space-y-6">

            {/* MRI + Diagnosis */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionTitle icon={FaMicroscope} color="text-rose-500">Diagnosis Details</SectionTitle>
              {heatmap && (
                <div className="mb-5">
                  <img src={heatmap} alt="MRI Heatmap" className="w-full h-52 object-cover rounded-xl" />
                  <p className="text-[11px] text-slate-400 mt-2 text-center">MRI Scan Image · Uploaded for analysis</p>
                </div>
              )}
              {diseaseDesc && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{diseaseDesc}</p>
                </div>
              )}
              {regions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Brain Regions Affected</p>
                  <div className="flex flex-wrap gap-2">
                    {regions.map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-medium rounded-full border border-violet-100">
                        <FaBrain className="text-[9px]" /> {r}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Findings */}
            {findings.length > 0 && (
              <section className="bg-white rounded-2xl border border-slate-200 p-6">
                <SectionTitle icon={FaChartLine} color="text-teal-500">Detailed Findings</SectionTitle>
                <div className="space-y-3">
                  {findings.map((f, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-teal-600 text-xs font-bold">{i + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">{f.type || `Finding ${i + 1}`}</h4>
                          {f.confidence && <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full flex-shrink-0">{f.confidence}%</span>}
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">{f.description || 'No description.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Doctor's Notes + Treatment */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6">
              <SectionTitle icon={FaUserMd} color="text-blue-500">Clinical Notes & Treatment</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <InfoBlock icon={FaClipboardList} label="Doctor's Notes" color="blue">{notes}</InfoBlock>
                  <InfoBlock icon={FaPills} label="Prescription" color="emerald">{rx}</InfoBlock>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FaNotesMedical className="text-violet-500 text-[10px]" /> Suggested Tests
                    </p>
                    <div className="space-y-1.5">
                      {tests.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                          <FaCheckCircle className="text-[9px] text-violet-400 flex-shrink-0" /> {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {treatments.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FaStethoscope className="text-cyan-500 text-[10px]" /> Treatment Options
                      </p>
                      <div className="space-y-2">
                        {treatments.map((t, i) => (
                          <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 bg-cyan-50 rounded-xl border border-cyan-100">
                            <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                            <span className="text-sm text-slate-700">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {recs.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FaShieldAlt className="text-amber-500 text-[10px]" /> AI Recommendations
                      </p>
                      <div className="space-y-1.5">
                        {recs.map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-slate-600">
                            <FaCheckCircle className="text-[9px] text-amber-400 mt-1 flex-shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT — 4 cols */}
          <div className="lg:col-span-4 space-y-6">

            {/* Patient */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">Patient</p>
                <p className="text-white font-semibold">{pName}</p>
              </div>
              <div className="px-5 py-4 space-y-2.5 text-sm">
                <Row label="Email">{user?.email || 'N/A'}</Row>
                <Row label="Patient ID"><span className="font-mono text-xs">{user?.id || user?._id || 'N/A'}</span></Row>
                <Row label="Department">Neurology</Row>
              </div>
            </section>

            {/* Scan Info */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Scan Information</p>
              <div className="space-y-2.5 text-sm">
                <Row label="Scanner">3T MRI</Row>
                <Row label="Sequences">T1, T2, FLAIR</Row>
                <Row label="Analysis ID"><span className="font-mono text-xs">{report?.analysis_id || 'N/A'}</span></Row>
                <Row label="Generated">{fmt(report?.created_at || new Date())}</Row>
              </div>
            </section>

            {/* Lifestyle */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FaHeartbeat className="text-rose-400 text-[10px]" /> Wellness Guidance
              </p>
              <div className="space-y-3">
                <LifestyleCard icon={FaDumbbell} title="Exercise" color="blue">{exRec}</LifestyleCard>
                <LifestyleCard icon={FaUtensils} title="Diet" color="emerald">{diRec}</LifestyleCard>
                <LifestyleCard icon={FaUser} title="Posture" color="violet">{poRec}</LifestyleCard>
              </div>
            </section>

            {/* Follow-up */}
            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FaCalendarCheck className="text-cyan-400 text-[10px]" /> Follow-Up
              </p>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-100 text-center mb-4">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Next Appointment</p>
                <p className="text-lg font-bold text-cyan-700">{nextAppt ? fmt(nextAppt) : 'To be scheduled'}</p>
              </div>
              <div className="space-y-2">
                {['Bring this report to your next visit', 'Follow prescribed medication', 'Complete suggested tests', 'Track symptoms daily', 'Emergency: call if sudden severe symptoms'].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <FaCheckCircle className="text-[8px] text-emerald-400 mt-1 flex-shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </section>

            {/* Disclaimer */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2.5">
                <FaExclamationTriangle className="text-amber-400 mt-0.5 flex-shrink-0 text-sm" />
                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1">Medical Disclaimer</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">AI-generated report for informational purposes only. Always consult a qualified neurologist. NeuroCare AI v2.0 · HIPAA Compliant.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="w-5 h-5 bg-blue-600 rounded-md flex items-center justify-center"><FaBrain className="text-white text-[9px]" /></div>
            <span className="text-sm font-semibold text-slate-700">NeuroCare</span>
          </div>
          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} NeuroCare · AI-Powered Neurological Analysis</p>
        </div>
      </div>

      {/* ━━━ Share Modal ━━━ */}
      {showShareModal && (() => {
        const shareText = `🧠 *NEUROCARE — MRI Analysis Report*\n\n👤 *Patient:* ${pName}\n📅 *Date:* ${fmt(scanDate)}\n🏥 *Scan Type:* ${scanType}\n📋 *Report ID:* ${rid}\n\n━━━━━━━━━━━━━━━━━\n🔬 *DIAGNOSIS*\n━━━━━━━━━━━━━━━━━\n• *Result:* ${predicted}\n• *Confidence:* ${confidence}%\n• *Stage:* ${stage}\n• *Severity:* ${severity}${diseaseDesc ? `\n• *Details:* ${diseaseDesc}` : ''}${regions.length > 0 ? `\n• *Brain Regions:* ${regions.join(', ')}` : ''}\n\n━━━━━━━━━━━━━━━━━\n🩺 *CLINICAL NOTES*\n━━━━━━━━━━━━━━━━━\n📝 *Notes:* ${notes}\n💊 *Prescription:* ${rx}\n🧪 *Suggested Tests:* ${tests.join(', ')}${treatments.length > 0 ? `\n\n━━━━━━━━━━━━━━━━━\n💉 *TREATMENT OPTIONS*\n━━━━━━━━━━━━━━━━━\n${treatments.map((t, i) => `${i + 1}. ${t}`).join('\n')}` : ''}${recs.length > 0 ? `\n\n━━━━━━━━━━━━━━━━━\n✅ *RECOMMENDATIONS*\n━━━━━━━━━━━━━━━━━\n${recs.map(r => `• ${r}`).join('\n')}` : ''}\n\n━━━━━━━━━━━━━━━━━\n🏃 *LIFESTYLE GUIDANCE*\n━━━━━━━━━━━━━━━━━\n🏋️ *Exercise:* ${exRec}\n🥗 *Diet:* ${diRec}\n🪑 *Posture:* ${poRec}\n\n━━━━━━━━━━━━━━━━━\n📅 *Next Appointment:* ${nextAppt ? fmt(nextAppt) : 'To be scheduled'}\n\n⚠️ _This is an AI-generated report for informational purposes only. Please consult a qualified neurologist for diagnosis and treatment._\n\n— Generated by NeuroCare AI`;

        const emailSubject = `NeuroCare MRI Report — ${pName} — ${fmt(scanDate)}`;
        const emailBody = shareText.replace(/\*/g, '').replace(/━/g, '—');

        return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Share Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">Send the full report via WhatsApp or Email</p>
              </div>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-slate-600 p-1"><FaTimes /></button>
            </div>

            {/* Preview */}
            <div className="mx-6 mb-4 bg-slate-50 rounded-xl border border-slate-100 p-4 max-h-48 overflow-y-auto">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center"><FaBrain className="text-white text-[8px]" /></div>
                <span className="text-xs font-semibold text-slate-700">Report Preview</span>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1 leading-relaxed">
                <p><strong>Patient:</strong> {pName} · <strong>Date:</strong> {fmt(scanDate)}</p>
                <p><strong>Diagnosis:</strong> {predicted} ({confidence}%) · <strong>Severity:</strong> {severity}</p>
                <p><strong>Notes:</strong> {notes.substring(0, 100)}{notes.length > 100 ? '...' : ''}</p>
                <p><strong>Rx:</strong> {rx.substring(0, 80)}{rx.length > 80 ? '...' : ''}</p>
                {treatments.length > 0 && <p><strong>Treatment:</strong> {treatments.slice(0, 2).join('; ')}{treatments.length > 2 ? ` +${treatments.length - 2} more` : ''}</p>}
              </div>
            </div>

            {/* Buttons */}
            <div className="px-6 pb-6 space-y-2.5">
              <button onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank'); setShowShareModal(false); }}
                className="w-full flex items-center gap-3 p-3.5 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-100 hover:border-emerald-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center"><FaWhatsapp className="text-white text-lg" /></div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 text-sm block">Share via WhatsApp</span>
                  <span className="text-[11px] text-slate-400">Full report with formatting</span>
                </div>
              </button>
              <button onClick={() => { window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`); setShowShareModal(false); }}
                className="w-full flex items-center gap-3 p-3.5 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-100 hover:border-blue-200">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"><FaEnvelope className="text-white text-sm" /></div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 text-sm block">Send via Email</span>
                  <span className="text-[11px] text-slate-400">Opens your default email client</span>
                </div>
              </button>
              <button onClick={() => { navigator.clipboard.writeText(emailBody); setShowShareModal(false); }}
                className="w-full flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition border border-slate-100 hover:border-slate-200">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center"><FaClipboardList className="text-slate-600 text-sm" /></div>
                <div className="text-left">
                  <span className="font-semibold text-slate-800 text-sm block">Copy to Clipboard</span>
                  <span className="text-[11px] text-slate-400">Paste anywhere you want</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      <style>{`@media print{.print\\:hidden{display:none!important}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}`}</style>
    </div>
  );
}

/* ── Tiny helper components ── */

function SectionTitle({ icon: Icon, color, children }) {
  return (
    <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800 mb-4">
      <Icon className={`text-sm ${color}`} /> {children}
    </h3>
  );
}

function InfoBlock({ icon: Icon, label, color, children }) {
  const colors = { blue: 'text-blue-500', emerald: 'text-emerald-500', violet: 'text-violet-500' };
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className={`text-[10px] ${colors[color] || 'text-slate-400'}`} /> {label}
      </p>
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-sm text-slate-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

function LifestyleCard({ icon: Icon, title, color, children }) {
  const bg = { blue: 'bg-blue-50 border-blue-100', emerald: 'bg-emerald-50 border-emerald-100', violet: 'bg-violet-50 border-violet-100' };
  const ic = { blue: 'text-blue-500', emerald: 'text-emerald-500', violet: 'text-violet-500' };
  return (
    <div className={`rounded-xl p-3 border ${bg[color] || 'bg-slate-50 border-slate-100'}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${ic[color] || 'text-slate-500'}`}>
        <Icon className="text-[10px]" /> {title}
      </p>
      <p className="text-xs text-slate-600 leading-relaxed">{children}</p>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="text-slate-700 font-medium text-xs text-right max-w-[60%] truncate">{children}</span>
    </div>
  );
}
