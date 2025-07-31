import React, { useState, useRef } from 'react';
import { 
  FaBrain, FaUpload, FaFileImage, FaCheckCircle, FaSpinner, 
  FaDownload, FaEye, FaShare, FaHistory, FaExclamationTriangle,
  FaShieldAlt, FaClock, FaRobot, FaUserMd, FaChartLine,
  FaTimes, FaPlay, FaPause, FaVolumeUp, FaExpand
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function MRIAnalysis() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/dicom', 'application/dicom'];
      return validTypes.includes(file.type) || file.name.toLowerCase().endsWith('.dcm');
    });

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      status: 'uploaded',
      preview: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setCurrentStep(2);
    
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      setCurrentStep(3);
      setAnalysisResults({
        overallHealth: 94,
        findings: [
          { type: 'normal', text: 'No signs of tumor or lesions detected', confidence: 98 },
          { type: 'normal', text: 'Brain structure appears normal', confidence: 96 },
          { type: 'attention', text: 'Minor age-related changes observed', confidence: 85 }
        ],
        recommendations: [
          'Continue regular health monitoring',
          'Maintain healthy lifestyle habits',
          'Schedule follow-up in 12 months'
        ]
      });
    }, 5000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <FaBrain className="text-blue-600 text-lg" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MRI Analysis</h1>
              <p className="text-sm text-gray-600">Upload and analyze your brain scans with AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-800">HIPAA Secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 px-8 py-4">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Upload</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Analyze</span>
            </div>
            <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Results</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto">
        {/* Step 1: Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaUpload className="text-blue-600 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your MRI Scans</h2>
                <p className="text-gray-600">Drag and drop your files or click to browse</p>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FaFileImage className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Drop your MRI files here
                </h3>
                <p className="text-gray-500 mb-6">
                  Supports DICOM (.dcm), JPEG, PNG formats • Max 50MB per file
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".dcm,.jpg,.jpeg,.png,image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FaFileImage className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-green-600">
                          <FaCheckCircle className="text-sm" />
                          <span className="text-xs font-medium">Ready</span>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <FaTimes className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={startAnalysis}
                    disabled={uploadedFiles.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Start AI Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <FaShieldAlt className="text-green-600 text-lg" />
                <div>
                  <h4 className="font-semibold text-green-900">Your Privacy is Protected</h4>
                  <p className="text-sm text-green-700">All uploads are encrypted and HIPAA-compliant. Files are automatically deleted after analysis.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Analysis */}
        {currentStep === 2 && isAnalyzing && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaSpinner className="text-blue-600 text-3xl animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis in Progress</h2>
              <p className="text-gray-600 mb-8">Our advanced AI is analyzing your MRI scans...</p>
              
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-2 mb-4">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                </div>
                <p className="text-sm text-gray-500">Processing neural networks... 75% complete</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 text-center">
                <FaRobot className="text-2xl text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">AI Detection</h4>
                <p className="text-sm text-gray-600">Scanning for anomalies</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <FaChartLine className="text-2xl text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Pattern Analysis</h4>
                <p className="text-sm text-gray-600">Comparing with database</p>
              </div>
              <div className="bg-white rounded-xl p-6 text-center">
                <FaUserMd className="text-2xl text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-1">Expert Review</h4>
                <p className="text-sm text-gray-600">Validating results</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {currentStep === 3 && analysisComplete && analysisResults && (
          <div className="space-y-6">
            {/* Overall Health Score */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-white">{analysisResults.overallHealth}%</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Brain Health Score</h2>
                <p className="text-gray-600">Your MRI analysis is complete</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">No Critical Issues</h4>
                  <p className="text-sm text-gray-600">All major indicators normal</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <FaClock className="text-2xl text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Analysis Time</h4>
                  <p className="text-sm text-gray-600">Completed in 4.2 seconds</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <FaRobot className="text-2xl text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">AI Confidence</h4>
                  <p className="text-sm text-gray-600">96.8% accuracy</p>
                </div>
              </div>
            </div>

            {/* Detailed Findings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Findings</h3>
              <div className="space-y-4">
                {analysisResults.findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      finding.type === 'normal' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {finding.type === 'normal' ? (
                        <FaCheckCircle className="text-green-600 text-sm" />
                      ) : (
                        <FaExclamationTriangle className="text-yellow-600 text-sm" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{finding.text}</p>
                      <p className="text-sm text-gray-500">Confidence: {finding.confidence}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {analysisResults.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <FaDownload className="text-sm" />
                Download Report
              </button>
              <button className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <FaShare className="text-sm" />
                Share with Doctor
              </button>
              <button 
                onClick={() => {
                  setCurrentStep(1);
                  setUploadedFiles([]);
                  setAnalysisComplete(false);
                  setAnalysisResults(null);
                }}
                className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                New Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}