import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { mongodbService } from '../lib/mongodb';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaFileAlt, FaSearch, FaFilter, FaDownload, FaEye, FaChartBar, FaChartLine, 
  FaChartPie, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaBrain, FaUsers,
  FaUserMd, FaCrown, FaExclamationTriangle, FaCheckCircle, FaTimes, FaPlus,
  FaFilePdf, FaFileExcel, FaFileCsv, FaPrint, FaShare, FaCog, FaImage,
  FaStethoscope, FaPills, FaHeartbeat, FaUtensils, FaDumbbell, FaComments,
  FaWhatsapp, FaEnvelope, FaClock, FaMapMarkerAlt, FaPhone, FaArrowRight,
  FaThermometerHalf, FaWeight, FaRuler, FaUser, FaHistory, FaCalendarCheck, FaList,
  FaSignOutAlt, FaChevronDown, FaUpload, FaBars, FaHome, FaComment, FaVideo, FaHeadset
} from 'react-icons/fa';

// Backend API methods for Patient Reports
class PatientReportsAPI {
  constructor() {
    this.baseURL = import.meta.env.VITE_MONGODB_API_URL || 'http://localhost:3002/api';
    this.token = localStorage.getItem('mongodb_token');
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async parseJsonSafe(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error('API did not return JSON. Check API URL and server. First bytes: ' + text.slice(0, 60));
    }
    return response.json();
  }

  // Fetch all MRI reports for the current patient
  async fetchPatientReports() {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patient reports');
      }

      return { data: data.reports || [], error: null };
    } catch (error) {
      console.error('Error fetching patient reports:', error);
      return { data: [], error: { message: error.message } };
    }
  }

  // Fetch a specific MRI report by ID
  async fetchReportById(reportId) {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports/${reportId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch report');
      }

      return { data: data.report, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Download report as PDF
  async downloadReport(reportId) {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports/${reportId}/download`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to download report');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mri-report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { data: true, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Share report via email
  async shareReportViaEmail(reportId, email, message = '') {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports/${reportId}/share/email`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ email, message })
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to share report via email');
      }

      return { data: data.success, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Share report via WhatsApp
  async shareReportViaWhatsApp(reportId, phoneNumber, message = '') {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports/${reportId}/share/whatsapp`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ phoneNumber, message })
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to share report via WhatsApp');
      }

      return { data: data.success, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Get patient statistics
  async fetchPatientStats() {
    try {
      const response = await fetch(`${this.baseURL}/patient/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch patient stats');
      }

      return { data: data.stats, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Upload new MRI scan
  async uploadMRIScan(file, scanData) {
    try {
      const formData = new FormData();
      formData.append('mriFile', file);
      formData.append('scanData', JSON.stringify(scanData));

      const response = await fetch(`${this.baseURL}/patient/upload-mri`, {
        method: 'POST',
        headers: {
          ...(this.token && { Authorization: `Bearer ${this.token}` })
        },
        body: formData
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload MRI scan');
      }

      return { data: data.report, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }

  // Update report status (for doctors)
  async updateReportStatus(reportId, status, doctorComments) {
    try {
      const response = await fetch(`${this.baseURL}/patient/reports/${reportId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, doctorComments })
      });

      const data = await this.parseJsonSafe(response);
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update report status');
      }

      return { data: data.report, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  }
}

// Create API instance
const patientReportsAPI = new PatientReportsAPI();

// Sample data fallback functions
const getSampleReports = () => [
  {
    id: 1,
    scanDate: '2024-12-15',
    scanType: 'Brain MRI',
    status: 'Analyzed',
    predictedResult: 'Normal',
    confidence: 94.2,
    heatmapImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop',
    doctorComments: {
      notes: 'No abnormalities detected. Brain structure appears normal with good symmetry.',
      prescription: 'Continue current medication. Follow up in 6 months.',
      suggestedTests: ['Blood work', 'Neurological examination']
    },
    nextAppointment: '2025-06-15',
    lifestyleSuggestions: {
      exercise: '30 minutes of moderate exercise daily',
      diet: 'Increase omega-3 fatty acids, reduce processed foods',
      posture: 'Maintain proper posture during work hours'
    }
  },
  {
    id: 2,
    scanDate: '2024-11-20',
    scanType: 'Brain MRI',
    status: 'Analyzed',
    predictedResult: 'Mild Cognitive Impairment',
    confidence: 87.5,
    heatmapImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop',
    doctorComments: {
      notes: 'Slight hippocampal volume reduction observed. Recommend cognitive assessment.',
      prescription: 'Donepezil 5mg daily, Vitamin E supplements',
      suggestedTests: ['MMSE', 'MoCA', 'Neuropsychological testing']
    },
    nextAppointment: '2025-02-20',
    lifestyleSuggestions: {
      exercise: 'Aerobic exercise 3x per week, brain training exercises',
      diet: 'Mediterranean diet, blueberries, green tea',
      posture: 'Regular breaks from screen time, neck stretches'
    }
  },
  {
    id: 3,
    scanDate: '2024-10-10',
    scanType: 'Brain MRI',
    status: 'Pending Diagnosis',
    predictedResult: 'Tumor (Benign)',
    confidence: 76.8,
    heatmapImage: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&h=200&fit=crop',
    doctorComments: {
      notes: 'Small mass detected in left frontal lobe. Requires further evaluation.',
      prescription: 'Steroids to reduce inflammation, pain management',
      suggestedTests: ['Contrast MRI', 'Biopsy', 'PET scan']
    },
    nextAppointment: '2024-12-20',
    lifestyleSuggestions: {
      exercise: 'Light walking, avoid heavy lifting',
      diet: 'Anti-inflammatory foods, plenty of water',
      posture: 'Gentle neck movements, avoid sudden head movements'
    }
  }
];

const getFallbackStats = () => ({
  totalScans: 3,
  analyzedReports: 2,
  pendingReports: 1,
  nextAppointment: '2024-12-20'
});

export default function Reports() {
  const navigate = useNavigate();
  const { user, signOut, authChecked } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'list'
  const [stats, setStats] = useState(null);
  const [mriReports, setMriReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const baseUrl = useMemo(() => (import.meta.env.VITE_MONGODB_API_URL?.replace('/api','') || 'http://localhost:3001'), []);

  // User membership status
  const userMembership = {
    isPremium: false,
    plan: 'Basic',
    expiryDate: '2024-12-31',
    features: ['AI Analysis', 'Doctor Chat', 'Video Consultations', 'Priority Support']
  };

  const sidebarItems = [
    { id: 'home', label: 'Dashboard', icon: FaHome },
    { id: 'upload', label: 'Upload MRI', icon: FaUpload },
    { id: 'reports', label: 'My Reports', icon: FaFileAlt },
    { id: 'brain-chat', label: 'Brain Health Chat', icon: FaComment },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'doctor-chat', label: 'Chat with Doctor', icon: FaComments },
    { id: 'video-call', label: 'Video Consultation', icon: FaVideo, premium: true },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'support', label: 'Help & Support', icon: FaHeadset }
  ];

  const handleSidebarClick = (itemId) => {
    if (itemId === 'upload') {
      navigate('/mri-analysis');
    } else if (itemId === 'support') {
      navigate('/help-support');
    } else if (itemId === 'reports') {
      navigate('/reports');
    } else if (itemId === 'profile') {
      navigate('/profile');
    } else if (itemId === 'doctor-chat') {
      navigate('/doctor-chat');
    } else if (itemId === 'appointments') {
      navigate('/appointments');
    } else if (itemId === 'home') {
      navigate('/dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    let socket;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        const token = localStorage.getItem('mongodb_token');
        
        if (!token) {
          // No token, use sample data immediately
          console.log('No authentication token found, using sample data');
          setMriReports(getSampleReports());
          setStats(getFallbackStats());
          setError('Please log in to access your real reports. Showing sample data.');
        } else {
          // User is logged in, try to fetch real data
          const [reportsResult, statsResult] = await Promise.all([
            patientReportsAPI.fetchPatientReports(),
            patientReportsAPI.fetchPatientStats()
          ]);

          if (reportsResult.error) {
            console.warn('Failed to fetch reports:', reportsResult.error.message);
            setMriReports(getSampleReports());
            setError('Unable to load reports from server. Showing sample data.');
          } else {
            setMriReports(reportsResult.data);
          }

          if (statsResult.error) {
            console.warn('Failed to fetch stats:', statsResult.error.message);
            setStats(getFallbackStats());
          } else {
            setStats(statsResult.data);
          }

          // Setup real-time updates only if logged in
        socket = io(baseUrl, { auth: { token: mongodbService.token } });
          socket.on('report_update', async () => {
            const { data } = await patientReportsAPI.fetchPatientReports();
            if (data) setMriReports(data);
          });
        socket.on('stats_update', async () => {
            const { data } = await patientReportsAPI.fetchPatientStats();
          if (data) setStats(data);
        });
      }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load reports. Using sample data.');
        setMriReports(getSampleReports());
        setStats(getFallbackStats());
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => { if (socket) socket.disconnect(); };
  }, [baseUrl]);


  const filteredReports = mriReports.filter(report => {
    const matchesSearch = report.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.predictedResult.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || report.predictedResult === filterType;
    const matchesDate = filterDate === 'all' || report.scanDate.includes(filterDate);
    return matchesSearch && matchesType && matchesDate;
  });

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setShowDetails(true);
  };

  const handleDownload = async (reportId) => {
    try {
      setDownloading(true);
      
      // Check if user is logged in (has token)
      const token = localStorage.getItem('mongodb_token');
      if (!token) {
        // No token, use fallback immediately
        throw new Error('No authentication token');
      }
      
      const result = await patientReportsAPI.downloadReport(reportId);
      
      if (result.error) {
        throw new Error(result.error.message);
      } else {
        alert('Report downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: Create a simple text file download
      const report = mriReports.find(r => r.id === reportId);
      if (report) {
        const content = `MRI Report
Scan Date: ${report.scanDate}
Scan Type: ${report.scanType}
Status: ${report.status}
Predicted Result: ${report.predictedResult}
Confidence: ${report.confidence}%

Doctor's Notes:
${report.doctorComments?.notes || 'N/A'}

Prescription:
${report.doctorComments?.prescription || 'N/A'}

Suggested Tests:
${report.doctorComments?.suggestedTests?.join(', ') || 'N/A'}

Lifestyle Recommendations:
Exercise: ${report.lifestyleSuggestions?.exercise || 'N/A'}
Diet: ${report.lifestyleSuggestions?.diet || 'N/A'}
Posture: ${report.lifestyleSuggestions?.posture || 'N/A'}

${report.nextAppointment ? `Next Appointment: ${report.nextAppointment}` : ''}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mri-report-${reportId}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Report downloaded as text file!');
      } else {
        alert('Report not found for download.');
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = (reportId) => {
    setSelectedReport(mriReports.find(r => r.id === reportId));
    setShowShareModal(true);
  };

  const handleShareViaEmail = async () => {
    if (!selectedReport) return;
    
    try {
      setSharing(true);
      const email = prompt('Enter email address:');
      if (!email) return;
      
      const message = prompt('Enter message (optional):') || '';
      const result = await patientReportsAPI.shareReportViaEmail(selectedReport.id, email, message);
      
      if (result.error) {
        alert(`Sharing failed: ${result.error.message}`);
      } else {
        alert('Report shared via email successfully!');
        setShowShareModal(false);
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: Create email link
      const subject = `MRI Report - ${selectedReport.scanDate}`;
      const body = `Please find attached the MRI report from ${selectedReport.scanDate}.\n\nScan Type: ${selectedReport.scanType}\nStatus: ${selectedReport.status}\nPredicted Result: ${selectedReport.predictedResult}\nConfidence: ${selectedReport.confidence}%\n\nDoctor Notes: ${selectedReport.doctorComments?.notes || 'N/A'}\nPrescription: ${selectedReport.doctorComments?.prescription || 'N/A'}`;
      const emailLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(emailLink);
      alert('Email client opened with report details!');
      setShowShareModal(false);
    } finally {
      setSharing(false);
    }
  };

  const handleShareViaWhatsApp = async () => {
    if (!selectedReport) return;
    
    try {
      setSharing(true);
      const phoneNumber = prompt('Enter phone number (with country code, e.g., +1234567890):');
      if (!phoneNumber) return;
      
      const message = prompt('Enter message (optional):') || '';
      const result = await patientReportsAPI.shareReportViaWhatsApp(selectedReport.id, phoneNumber, message);
      
      if (result.error) {
        alert(`Sharing failed: ${result.error.message}`);
      } else {
        alert('Report shared via WhatsApp successfully!');
        setShowShareModal(false);
      }
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: Create WhatsApp link
      const reportText = `MRI Report - ${selectedReport.scanDate}\nScan Type: ${selectedReport.scanType}\nStatus: ${selectedReport.status}\nPredicted Result: ${selectedReport.predictedResult}\nConfidence: ${selectedReport.confidence}%`;
      const whatsappText = encodeURIComponent(reportText);
      const whatsappLink = `https://wa.me/?text=${whatsappText}`;
      window.open(whatsappLink, '_blank');
      alert('WhatsApp opened with report details!');
      setShowShareModal(false);
    } finally {
      setSharing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Analyzed': return 'bg-green-100 text-green-800';
      case 'Pending Diagnosis': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Analyzed': return <FaCheckCircle className="text-green-500" />;
      case 'Pending Diagnosis': return <FaClock className="text-yellow-500" />;
      case 'Failed': return <FaTimes className="text-red-500" />;
      default: return <FaCog className="text-gray-500" />;
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Normal': return 'bg-green-100 text-green-800';
      case 'Mild Cognitive Impairment': return 'bg-yellow-100 text-yellow-800';
      case 'Tumor (Benign)': return 'bg-orange-100 text-orange-800';
      case 'Alzheimer\'s Disease (Early Stage)': return 'bg-red-100 text-red-800';
      case 'Huntington\'s Disease': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    if (!selectedReport) return;
    
    const printContent = `
      <html>
        <head>
          <title>MRI Report - ${selectedReport.scanDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; }
            .value { margin-left: 10px; }
            .image { max-width: 100%; height: auto; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>MRI Scan Report</h1>
            <h2>${selectedReport.scanType}</h2>
            <p>Scan Date: ${formatDate(selectedReport.scanDate)}</p>
          </div>
          
          <div class="section">
            <div class="label">Status:</div>
            <div class="value">${selectedReport.status}</div>
          </div>
          
          <div class="section">
            <div class="label">Predicted Result:</div>
            <div class="value">${selectedReport.predictedResult}</div>
          </div>
          
          <div class="section">
            <div class="label">Confidence:</div>
            <div class="value">${selectedReport.confidence}%</div>
          </div>
          
          <div class="section">
            <div class="label">Doctor's Notes:</div>
            <div class="value">${selectedReport.doctorComments?.notes || 'N/A'}</div>
          </div>
          
          <div class="section">
            <div class="label">Prescription:</div>
            <div class="value">${selectedReport.doctorComments?.prescription || 'N/A'}</div>
          </div>
          
          <div class="section">
            <div class="label">Suggested Tests:</div>
            <div class="value">${selectedReport.doctorComments?.suggestedTests?.join(', ') || 'N/A'}</div>
          </div>
          
          <div class="section">
            <div class="label">Exercise Recommendations:</div>
            <div class="value">${selectedReport.lifestyleSuggestions?.exercise || 'N/A'}</div>
          </div>
          
          <div class="section">
            <div class="label">Diet Recommendations:</div>
            <div class="value">${selectedReport.lifestyleSuggestions?.diet || 'N/A'}</div>
          </div>
          
          <div class="section">
            <div class="label">Lifestyle Recommendations:</div>
            <div class="value">${selectedReport.lifestyleSuggestions?.posture || 'N/A'}</div>
          </div>
          
          ${selectedReport.nextAppointment ? `
          <div class="section">
            <div class="label">Next Appointment:</div>
            <div class="value">${formatDate(selectedReport.nextAppointment)}</div>
          </div>
          ` : ''}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError(null);

      // Check if user is logged in
      const token = localStorage.getItem('mongodb_token');
      
      if (!token) {
        // No token, refresh sample data
        setMriReports(getSampleReports());
        setStats(getFallbackStats());
        setError('Please log in to access your real reports. Showing sample data.');
      } else {
        // User is logged in, fetch fresh data from backend
        const [reportsResult, statsResult] = await Promise.all([
          patientReportsAPI.fetchPatientReports(),
          patientReportsAPI.fetchPatientStats()
        ]);

        if (reportsResult.error) {
          setError(reportsResult.error.message);
          setMriReports(getSampleReports());
        } else {
          setMriReports(reportsResult.data);
        }

        if (statsResult.error) {
          console.warn('Failed to fetch stats:', statsResult.error.message);
          setStats(getFallbackStats());
        } else {
          setStats(statsResult.data);
        }
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <FaBrain className="text-white text-lg" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">NeuroCare</h1>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/mri-analysis')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Upload MRI
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="text-blue-600 font-medium text-sm"
            >
              My Reports
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Appointments
            </button>
            <button
              onClick={() => navigate('/doctor-chat')}
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
            >
              Chat with Doctor
            </button>
            <button
              className="text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
            >
              Video Call
              {!userMembership.isPremium && <FaCrown className="text-yellow-500 text-xs" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 rounded-lg"
            >
              <FaBars />
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                  alt="User"
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                />
                <span className="text-sm">
                  {user?.user_metadata?.full_name || user?.email || 'John Doe'}
                </span>
                <FaChevronDown className="text-xs" />
              </button>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaUser className="text-xs" />
                      Profile
                    </button>
                    <button
                      onClick={() => navigate('/subscription')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaCrown className="text-xs" />
                      Subscription
                    </button>
                    <button
                      onClick={() => navigate('/help-support')}
                      className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaHeadset className="text-xs" />
                      Support
                    </button>
                    {user && user.role === 'admin' && (
                      <button
                        onClick={() => navigate('/admin-dashboard')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-purple-600 hover:bg-gray-50 rounded-lg text-sm"
                      >
                        <FaUserMd className="text-xs" />
                        Admin Dashboard
                      </button>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <FaSignOutAlt className="text-xs" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-2 px-6">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSidebarClick(item.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left rounded-lg transition-colors ${
                    item.id === 'reports'
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <item.icon className="text-sm" />
                  <span className="font-medium">{item.label}</span>
                  {item.premium && !userMembership.isPremium && (
                    <FaCrown className="text-yellow-500 text-xs ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Reports</h1>
              <p className="text-gray-600">Your MRI scan reports and medical history</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {refreshing ? <FaCog className="animate-spin" /> : <FaArrowRight />}
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Patient Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total MRI Scans</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : (stats?.totalScans || mriReports.length)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaBrain className="text-blue-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Analyzed Reports</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? '...' : (stats?.analyzedReports || mriReports.filter(r => r.status === 'Analyzed').length)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Diagnosis</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loading ? '...' : (stats?.pendingReports || mriReports.filter(r => r.status === 'Pending Diagnosis').length)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Next Appointment</p>
                <p className="text-lg font-bold text-purple-600">
                  {loading ? '...' : (stats?.nextAppointment ? new Date(stats.nextAppointment).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD')}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaCalendarCheck className="text-purple-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by scan type, result, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Results</option>
                <option value="Normal">Normal</option>
                <option value="Mild Cognitive Impairment">Mild Cognitive Impairment</option>
                <option value="Tumor (Benign)">Tumor (Benign)</option>
                <option value="Alzheimer's Disease (Early Stage)">Alzheimer's Disease</option>
                <option value="Huntington's Disease">Huntington's Disease</option>
              </select>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Dates</option>
                <option value="2024-12">December 2024</option>
                <option value="2024-11">November 2024</option>
                <option value="2024-10">October 2024</option>
                <option value="2024-09">September 2024</option>
                <option value="2024-08">August 2024</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setViewMode(viewMode === 'timeline' ? 'list' : 'timeline')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {viewMode === 'timeline' ? <FaHistory /> : <FaList />}
                {viewMode === 'timeline' ? 'List View' : 'Timeline View'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-600 mr-2" />
                <span className="text-yellow-800">{error}</span>
              </div>
              {error.includes('log in') && (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <FaCog className="text-blue-600 text-2xl animate-spin" />
            </div>
            <p className="text-gray-600">Loading your MRI reports...</p>
          </div>
        )}

        {/* MRI Reports */}
        {!loading && (
          viewMode === 'list' ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Details</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Result</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                            <FaBrain className="text-blue-600 text-xl" />
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{report.scanType}</div>
                            <div className="text-sm text-gray-500">{formatDate(report.scanDate)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(report.predictedResult)}`}>
                          {report.predictedResult}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        {report.status}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.confidence}%</div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleViewDetails(report)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>
                          <button 
                            onClick={() => handleDownload(report.id)}
                            disabled={downloading}
                            className="bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            {downloading ? <FaCog className="text-xs animate-spin" /> : <FaDownload className="text-xs" />}
                            PDF
                          </button>
                          <button 
                            onClick={() => handleShare(report.id)}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                          <FaShare className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="space-y-6">
            {filteredReports.map((report, index) => (
              <div key={report.id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start gap-6">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <FaBrain className="text-blue-600 text-xl" />
                    </div>
                    {index < filteredReports.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-4"></div>
                    )}
          </div>

                  {/* Report content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{report.scanType}</h3>
                        <p className="text-sm text-gray-500">{formatDate(report.scanDate)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(report.status)}`}>
                          {getStatusIcon(report.status)}
                          {report.status}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getResultColor(report.predictedResult)}`}>
                          {report.predictedResult}
                        </span>
                      </div>
                    </div>
                    
                    {/* Heatmap image */}
                    <div className="mb-4">
                      <img 
                        src={report.heatmapImage} 
                        alt="MRI Heatmap" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                    
                    {/* Doctor comments preview */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <FaUserMd className="text-blue-600" />
                        Doctor's Notes
                      </h4>
                      <p className="text-sm text-gray-700 mb-2">{report.doctorComments.notes}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaPills className="text-green-600" />
                          Prescription: {report.doctorComments.prescription}
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleViewDetails(report)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <FaEye />
                        View Full Report
              </button>
                      <button 
                        onClick={() => handleDownload(report.id)}
                        disabled={downloading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {downloading ? <FaCog className="animate-spin" /> : <FaDownload />}
                        Download PDF
                      </button>
                      <button 
                        onClick={() => handleShare(report.id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                      >
                        <FaShare />
                        Share
              </button>
            </div>
          </div>
        </div>
              </div>
            ))}
          </div>
        )
        )}

        {/* Report Details Modal */}
        {showDetails && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">MRI Scan Report Details</h3>
                  <button 
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Report Header */}
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <FaBrain className="text-blue-600 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900">{selectedReport.scanType}</h4>
                    <p className="text-gray-600">Scan Date: {formatDate(selectedReport.scanDate)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedReport.status)}`}>
                        {getStatusIcon(selectedReport.status)}
                        {selectedReport.status}
                      </span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getResultColor(selectedReport.predictedResult)}`}>
                        {selectedReport.predictedResult}
                      </span>
                      <span className="text-sm text-gray-500">Confidence: {selectedReport.confidence}%</span>
                    </div>
                  </div>
                </div>

                {/* MRI Heatmap */}
                  <div>
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FaImage className="text-blue-600" />
                    MRI Heatmap Analysis
                  </h5>
                  <img 
                    src={selectedReport.heatmapImage} 
                    alt="MRI Heatmap" 
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>

                {/* Doctor Comments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaUserMd className="text-blue-600" />
                      Doctor's Comments
                    </h5>
                    <p className="text-sm text-gray-700 mb-3">{selectedReport.doctorComments.notes}</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <FaPills className="text-green-600 mt-1" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Prescription:</span>
                          <p className="text-sm text-gray-700">{selectedReport.doctorComments.prescription}</p>
                      </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaStethoscope className="text-blue-600 mt-1" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Suggested Tests:</span>
                          <ul className="text-sm text-gray-700 list-disc list-inside">
                            {selectedReport.doctorComments.suggestedTests.map((test, index) => (
                              <li key={index}>{test}</li>
                            ))}
                          </ul>
                      </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FaHeartbeat className="text-green-600" />
                      Treatment & Recommendations
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <FaDumbbell className="text-blue-600 mt-1" />
                  <div>
                          <span className="text-sm font-medium text-gray-900">Exercise:</span>
                          <p className="text-sm text-gray-700">{selectedReport.lifestyleSuggestions.exercise}</p>
                        </div>
                    </div>
                      <div className="flex items-start gap-2">
                        <FaUtensils className="text-orange-600 mt-1" />
                        <div>
                          <span className="text-sm font-medium text-gray-900">Diet:</span>
                          <p className="text-sm text-gray-700">{selectedReport.lifestyleSuggestions.diet}</p>
                  </div>
                </div>
                      <div className="flex items-start gap-2">
                        <FaUser className="text-purple-600 mt-1" />
                <div>
                          <span className="text-sm font-medium text-gray-900">Posture & Lifestyle:</span>
                          <p className="text-sm text-gray-700">{selectedReport.lifestyleSuggestions.posture}</p>
                      </div>
                      </div>
                      {selectedReport.nextAppointment && (
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                          <FaCalendarCheck className="text-green-600" />
                          <span className="text-sm font-medium text-gray-900">Next Appointment:</span>
                          <span className="text-sm text-gray-700">{formatDate(selectedReport.nextAppointment)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleDownload(selectedReport.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaDownload />
                    Download PDF Report
                    </button>
                  <button 
                    onClick={() => handleShare(selectedReport.id)}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaShare />
                    Share Report
                  </button>
                  <button 
                    onClick={handlePrint}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaPrint />
                    Print Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Share Report</h3>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Share your MRI report from {formatDate(selectedReport.scanDate)} via:
                </p>
                
                <div className="space-y-3">
                  <button 
                    onClick={handleShareViaEmail}
                    disabled={sharing}
                    className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sharing ? <FaCog className="text-blue-600 text-xl animate-spin" /> : <FaEnvelope className="text-blue-600 text-xl" />}
                    <span className="font-medium text-gray-900">Email</span>
                  </button>
                  
                  <button 
                    onClick={handleShareViaWhatsApp}
                    disabled={sharing}
                    className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {sharing ? <FaCog className="text-green-600 text-xl animate-spin" /> : <FaWhatsapp className="text-green-600 text-xl" />}
                    <span className="font-medium text-gray-900">WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}