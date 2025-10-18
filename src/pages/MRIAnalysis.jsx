import React, { useState, useRef } from 'react';
import { 
  FaBrain, FaUpload, FaFileImage, FaCheckCircle, FaSpinner, 
  FaDownload, FaEye, FaShare, FaHistory, FaExclamationTriangle,
  FaShieldAlt, FaClock, FaRobot, FaUserMd, FaChartLine,
  FaTimes, FaPlay, FaPause, FaVolumeUp, FaExpand
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MRIAnalysis() {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const fileInputRef = useRef(null);

  const highlightStats = [
    {
      id: 1,
      label: 'Accuracy',
      value: '99.2%',
      gradient: 'from-green-400 to-emerald-500',
      icon: FaChartLine
    },
    {
      id: 2,
      label: 'Speed',
      value: '< 30s',
      gradient: 'from-blue-400 to-cyan-500',
      icon: FaClock
    },
    {
      id: 3,
      label: 'Cases',
      value: '10K+',
      gradient: 'from-purple-400 to-pink-500',
      icon: FaUserMd
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep(2);
    
    // Simulate analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setCurrentStep(3);
      setAnalysisResults({
        findings: [
          {
            type: 'Normal',
            confidence: 95,
            description: 'No abnormalities detected in the brain structure.'
          }
        ],
        recommendations: [
          'Continue regular monitoring',
          'Schedule follow-up in 6 months'
        ]
      });
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-10 blur-3xl animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white rounded-full opacity-60 animate-bounce"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300 rounded-full opacity-80 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full opacity-70 animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-20 w-1 h-1 bg-cyan-300 rounded-full opacity-90 animate-bounce" style={{animationDelay: '0.5s'}}></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 pt-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-2xl px-8 py-8 shadow-2xl">
            {/* Header glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent rounded-3xl"></div>
            
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-6">
                <Link
                  to="/dashboard"
                  className="group relative rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 p-4 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <FaBrain className="relative text-3xl text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                </Link>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
                      <FaRobot className="mr-2 text-blue-300" />
                      AI Powered
                    </span>
                    <span className="inline-flex items-center rounded-full border border-purple-400/30 bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-200 backdrop-blur-sm">
                      <FaChartLine className="mr-2 text-purple-300" />
                      Next Gen
                    </span>
                  </div>
                  <h1 className="text-4xl font-black text-white md:text-6xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    MRI Intelligence
                  </h1>
                  <p className="mt-3 text-lg text-gray-300 md:text-xl max-w-2xl">
                    Revolutionary AI-powered MRI analysis with <span className="text-cyan-300 font-semibold">99.2% accuracy</span> and <span className="text-purple-300 font-semibold">instant results</span>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {highlightStats.map((stat, index) => (
                  <div
                    key={stat.id}
                    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:shadow-3xl"
                    style={{animationDelay: `${index * 0.2}s`}}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="relative rounded-xl bg-gradient-to-br from-white/20 to-white/10 p-3 backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-xl blur-sm"></div>
                          <stat.icon className="relative text-2xl text-white" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                          {stat.label}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-3xl font-black text-white md:text-4xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                          {stat.value}
                        </p>
                        <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-60"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="relative z-10 border-b border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 px-4 py-8 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-6">
          {[{
            step: 1,
            title: 'Upload',
            description: 'Drag & drop advanced DICOM, JPEG, or PNG scans',
            icon: FaUpload
          }, {
            step: 2,
            title: 'Analyze',
            description: 'AI neural pipelines detect lesions in seconds',
            icon: FaRobot
          }, {
            step: 3,
            title: 'Report',
            description: 'Interactive findings with clinical insights',
            icon: FaChartLine
          }].map((step, index) => (
            <React.Fragment key={step.step}>
              <div className={`group relative flex items-center gap-4 rounded-2xl border px-6 py-4 transition-all duration-500 ${
                currentStep >= step.step 
                  ? 'border-blue-400/50 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-2xl scale-105' 
                  : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
              }`}>
                {/* Glow effect for active step */}
                {currentStep >= step.step && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-sm"></div>
                )}
                
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all duration-500 ${
                  currentStep >= step.step 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-white/10 text-gray-400'
                }`}>
                  {currentStep >= step.step ? (
                    <step.icon className="text-xl" />
                  ) : (
                    <span>{step.step}</span>
                  )}
                </div>
                <div className="relative">
                  <p className="font-bold text-lg">{step.title}</p>
                  <p className="text-sm opacity-80">{step.description}</p>
                </div>
              </div>
              {step.step < 3 && (
                <div className={`hidden h-px w-12 transition-all duration-500 sm:block ${
                  currentStep >= step.step 
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400' 
                    : 'bg-gradient-to-r from-white/20 to-transparent'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto relative z-10">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl p-12 shadow-2xl">
              {/* Animated background elements */}
              <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" />
              <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-3xl animate-pulse" />
              
              <div className="relative grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="flex flex-col justify-between gap-10">
                  <div className="space-y-8">
                    <div className="group relative inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl transition-all duration-500 hover:scale-110 hover:rotate-12">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <FaUpload className="relative text-4xl" />
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-4xl font-black text-white md:text-5xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                        Launch Your MRI Story
                      </h2>
                      <p className="text-lg text-gray-300 md:text-xl max-w-lg">
                        Upload solo studies or bulk archives, auto-cluster by patient, and preview cinematic slices before sharing.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="inline-flex items-center gap-3 rounded-full border border-blue-400/30 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
                        <FaFileImage className="text-blue-300" /> Multi-format Support
                      </span>
                      <span className="inline-flex items-center gap-3 rounded-full border border-green-400/30 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-green-200 backdrop-blur-sm">
                        <FaShieldAlt className="text-green-300" /> HIPAA Compliant
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      handleFileUpload(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative cursor-pointer rounded-3xl border-2 border-dashed border-white/30 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-16 text-center transition-all duration-500 hover:border-blue-400/50 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 hover:scale-105 hover:shadow-2xl"
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                    
                    <div className="relative space-y-6">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                        <FaUpload className="text-3xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-4">Drop MRI scans anywhere</h3>
                        <p className="mx-auto max-w-md text-lg text-gray-300">
                          Supports DICOM (.dcm), JPEG, and PNG formats up to 50MB. We auto-detect duplicates and sync patient metadata instantly.
                        </p>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-6 py-3 text-sm font-semibold text-white">
                        <span>Click to browse files</span>
                        <FaUpload className="text-xs" />
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".dcm,.dicom,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="relative">
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl p-8 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                      <FaCheckCircle className="text-white text-sm" />
                    </div>
                    Uploaded Files ({uploadedFiles.length})
                  </h3>
                  <div className="space-y-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={file.id} className="group relative flex items-center justify-between p-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl" style={{animationDelay: `${index * 0.1}s`}}>
                        <div className="flex items-center gap-6">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm flex items-center justify-center">
                            {file.preview ? (
                              <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
                            ) : (
                              <FaFileImage className="text-2xl text-white" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-white text-lg">{file.name}</p>
                            <p className="text-sm text-gray-300">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-green-400">
                            <FaCheckCircle className="text-lg" />
                            <span className="text-sm font-semibold">Ready</span>
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/20"
                          >
                            <FaTimes className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/20">
                    <button
                      onClick={startAnalysis}
                      disabled={uploadedFiles.length === 0}
                      className="group relative w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-6 rounded-2xl font-bold text-xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-3xl hover:scale-105"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <span className="relative flex items-center justify-center gap-3">
                        <FaRobot className="text-2xl" />
                        Start AI Analysis
                        <FaPlay className="text-lg" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="relative overflow-hidden rounded-3xl border border-green-400/30 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 backdrop-blur-2xl p-8 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-3xl"></div>
              <div className="relative flex items-center gap-6">
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl blur-sm"></div>
                  <FaShieldAlt className="relative text-2xl text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Your Privacy is Protected</h4>
                  <p className="text-lg text-green-200">All uploads are encrypted and HIPAA-compliant. Files are automatically deleted after analysis.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis */}
        {currentStep === 2 && isAnalyzing && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl p-12 shadow-2xl text-center">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse"></div>
              
              <div className="relative">
                <div className="relative w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-lg opacity-60"></div>
                  <FaSpinner className="relative text-5xl text-white animate-spin" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  AI Analysis in Progress
                </h2>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  Our advanced neural networks are analyzing your MRI scans with cutting-edge AI technology...
                </p>
                
                <div className="max-w-lg mx-auto">
                  <div className="relative bg-white/10 rounded-full h-4 mb-6 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full animate-pulse shadow-lg" style={{width: '70%'}}></div>
                  </div>
                  <p className="text-lg text-gray-300 font-semibold">Processing scan data with 99.2% accuracy...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && analysisComplete && analysisResults && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl p-12 shadow-2xl">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
              
              <div className="relative">
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full blur-lg"></div>
                    <FaCheckCircle className="relative text-3xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white via-green-100 to-emerald-100 bg-clip-text text-transparent">
                      Analysis Complete
                    </h2>
                    <p className="text-xl text-gray-300">Your MRI scan has been successfully analyzed with AI precision</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <FaChartLine className="text-white text-sm" />
                      </div>
                      Key Findings
                    </h3>
                    <div className="space-y-4">
                      {analysisResults.findings.map((finding, index) => (
                        <div key={index} className="relative p-6 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xl font-bold text-white">{finding.type}</span>
                            <span className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full text-sm font-semibold text-green-200">
                              {finding.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-lg text-gray-300">{finding.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <FaUserMd className="text-white text-sm" />
                      </div>
                      Recommendations
                    </h3>
                    <ul className="space-y-3">
                      {analysisResults.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center gap-4 text-lg text-gray-300 p-4 bg-gradient-to-r from-white/5 to-white/10 rounded-xl">
                          <FaCheckCircle className="text-green-400 text-xl" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-6 mt-12">
                  <button className="group flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 shadow-2xl flex items-center justify-center gap-3">
                    <FaDownload className="text-xl" />
                    Download Report
                  </button>
                  <button className="group flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 shadow-2xl flex items-center justify-center gap-3">
                    <FaShare className="text-xl" />
                    Share with Doctor
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentStep(1);
                      setUploadedFiles([]);
                      setAnalysisComplete(false);
                      setAnalysisResults(null);
                    }}
                    className="group px-8 bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-white py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:scale-105 shadow-2xl border border-white/20 backdrop-blur-xl"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}