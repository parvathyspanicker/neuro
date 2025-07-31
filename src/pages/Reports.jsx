import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaFileAlt, FaArrowLeft, FaDownload, FaEye, FaCalendarAlt, 
  FaSearch, FaFilter, FaBrain, FaCheckCircle, FaExclamationTriangle,
  FaShare, FaPrint, FaChartLine
} from 'react-icons/fa';

export default function Reports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const reports = [
    {
      id: 1,
      title: 'Brain MRI Analysis - Routine Checkup',
      date: '2024-01-15',
      status: 'normal',
      confidence: 96,
      findings: 'No abnormalities detected',
      doctor: 'Dr. Sarah Johnson',
      type: 'MRI'
    },
    {
      id: 2,
      title: 'Follow-up Brain Scan',
      date: '2024-01-08',
      status: 'attention',
      confidence: 89,
      findings: 'Minor age-related changes observed',
      doctor: 'Dr. Michael Chen',
      type: 'MRI'
    },
    {
      id: 3,
      title: 'Comprehensive Brain Analysis',
      date: '2023-12-20',
      status: 'normal',
      confidence: 94,
      findings: 'Healthy brain structure',
      doctor: 'Dr. Sarah Johnson',
      type: 'MRI'
    }
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50';
      case 'attention': return 'text-yellow-600 bg-yellow-50';
      case 'urgent': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <FaCheckCircle />;
      case 'attention': return <FaExclamationTriangle />;
      case 'urgent': return <FaExclamationTriangle />;
      default: return <FaFileAlt />;
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{fontFamily: 'Times New Roman, serif'}}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FaFileAlt className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                <p className="text-gray-600">View and manage your medical reports</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Reports', value: reports.length, icon: FaFileAlt, color: 'blue' },
            { label: 'Normal Results', value: reports.filter(r => r.status === 'normal').length, icon: FaCheckCircle, color: 'green' },
            { label: 'Needs Attention', value: reports.filter(r => r.status === 'attention').length, icon: FaExclamationTriangle, color: 'yellow' },
            { label: 'Avg. Confidence', value: `${Math.round(reports.reduce((acc, r) => acc + r.confidence, 0) / reports.length)}%`, icon: FaChartLine, color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}-600 text-xl`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports by title or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="all">All Status</option>
                <option value="normal">Normal</option>
                <option value="attention">Needs Attention</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FaBrain className="text-blue-600 text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{report.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt />
                        <span>{new Date(report.date).toLocaleDateString()}</span>
                      </div>
                      <span>•</span>
                      <span>Dr. {report.doctor}</span>
                      <span>•</span>
                      <span>Confidence: {report.confidence}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}>
                    {getStatusIcon(report.status)}
                    <span className="capitalize">{report.status}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                      <FaEye />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200">
                      <FaDownload />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                      <FaShare />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200">
                      <FaPrint />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-700">{report.findings}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}