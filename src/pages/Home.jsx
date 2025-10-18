import "../style.css";
import heroImg from '../assets/brain-ai.png';
import { Link, useNavigate } from 'react-router-dom';
import Howitwork from '../components/Howitwork';
import Features from '../components/Feature';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import {
  FaHome, FaUserMd, FaUsers, FaUpload, FaFileAlt, FaComments, FaCog,
  FaBell, FaSearch, FaUser, FaSignOutAlt, FaChevronDown, FaCheck, FaTimes,
  FaEye, FaFilter, FaChevronLeft, FaChevronRight, FaBrain, FaCalendarAlt,
  FaCrown, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaMoon, FaSun,
  FaSignInAlt, FaUserPlus, FaInfoCircle, FaEnvelope, FaStar, FaGlobe
} from 'react-icons/fa';

export default function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // No automatic navigation needed - Google sign-in redirects directly to dashboard
  useEffect(() => {
    console.log('Home component - User state:', { user, loading });
    // Google sign-in users are redirected directly to dashboard via redirectTo option
    // Email/password login handles its own navigation in Login.jsx
  }, [user, loading]);
  
  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden flex flex-col">
      {/* Navbar - Same structure, professional styling */}
      <header className="flex justify-between items-center px-12 py-4 w-full bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <a href="#" className="text-blue-600 flex items-center gap-2">
            <FaHome className="text-lg" />
            <span>Home</span>
          </a>
          <Link to="/about" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaInfoCircle className="text-lg" />
            <span>About</span>
          </Link>
          <a href="#feature" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaStar className="text-lg" />
            <span>Features</span>
          </a>
          <a href="#how" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaGlobe className="text-lg" />
            <span>How it Works</span>
          </a>
          <a href="#contact" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaEnvelope className="text-lg" />
            <span>Contact</span>
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaSignInAlt className="text-lg" />
            <span>Login</span>
          </Link>
          <Link to="/register" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaUserPlus className="text-lg" />
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* Hero Section - Keep exact same layout */}
      <section className="flex flex-col md:flex-row items-center justify-between w-full px-4 md:px-12 lg:px-24 pt-10 pb-0 gap-8 md:gap-12 relative min-h-[600px]">
        {/* Left: Text & Email */}
        <div className="flex-1 z-10 min-w-0 flex flex-col justify-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-blue-900 leading-tight mb-6">Revolutionize<br/>Neurological Care</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-xl">Detect brain disorders early with AI-powered MRI analysis. Trust <span className="font-semibold text-blue-600">NeuroCare</span> to transform your health journey.</p>
          <form className="flex items-center bg-white rounded-full shadow-md p-2 w-full max-w-md mb-8 border border-gray-200">
            <input type="email" placeholder="Enter your email" className="flex-1 px-4 py-2 rounded-full outline-none bg-transparent" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-blue-700 transition">Get Started</button>
          </form>
          {/* Stats */}
          <div className="flex gap-12 mt-8">
            <div>
              <div className="text-3xl font-bold text-blue-900">4.9<span className="align-super text-base">*</span></div>
              <div className="text-sm text-gray-500 mt-1">Avg. specialist<br/>rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">FDA</div>
              <div className="text-sm text-gray-500 mt-1">AI certified<br/>for MRI analysis</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-900">10K+</div>
              <div className="text-sm text-gray-500 mt-1">Scans analyzed<br/>last year</div>
            </div>
          </div>
        </div>
        {/* Right: Doctor Card & Floating Elements - Professional Healthcare */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-w-0">
          {/* Subtle medical background */}
          <svg className="absolute -z-10 right-0 bottom-0 w-[420px] h-[420px] hidden md:block" viewBox="0 0 420 420" fill="none">
            <path d="M0,320 Q210,100 420,220 L420,420 L0,420 Z" fill="#f8fafc" />
            <path d="M0,370 Q210,220 420,320 L420,420 L0,420 Z" fill="#e2e8f0" />
          </svg>
          
          {/* Brain-focused floating elements */}
          <div className="absolute z-20 w-full h-full pointer-events-none">
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center justify-center absolute left-[-30px] top-20 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">10K+ Scans</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center justify-center absolute right-[-40px] top-32 border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600">99.2%</span>
                <span className="text-xs text-gray-600">Accuracy</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-3 absolute right-[-20px] bottom-20 border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-purple-600">AI</div>
                <div className="text-xs text-gray-500">Powered</div>
              </div>
            </div>
          </div>
          
          {/* AI Brain Analysis Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 relative z-10 border border-gray-200">
            {/* Brain Image */}
            <div className="relative mx-auto mb-4 w-20 h-20">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg"
                  srcSet="https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg 1x, https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg 2x"
                  sizes="80px"
                  alt="Brain MRI" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24" className="text-white absolute" style={{display: 'none'}}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-xs text-gray-500 mb-1">AI-Powered Analysis</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Brain MRI Scanner</div>
              <div className="text-sm text-gray-600">Real-time Detection</div>
            </div>
            
            {/* Brain Analysis Stats */}
            <div className="flex justify-center gap-6 mb-4 text-center">
              <div>
                <div className="text-sm font-semibold text-blue-600">99.2%</div>
                <div className="text-xs text-gray-500">Accuracy</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-600">2.3s</div>
                <div className="text-xs text-gray-500">Scan Time</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-purple-600">AI</div>
                <div className="text-xs text-gray-500">Powered</div>
              </div>
            </div>
            
            {/* Brain Analysis Features */}
            <div className="flex justify-center gap-3 mb-4">
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors" title="Tumor Detection">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors" title="Stroke Analysis">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </button>
              <button className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors" title="Brain Mapping">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553-2.276A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
              </button>
            </div>
            
            {/* Brain Activity Chart */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Brain Activity</span>
                <span className="text-xs text-green-600">Normal</span>
              </div>
              <svg width="100%" height="30" viewBox="0 0 240 30" fill="none">
                <path d="M0 15L20 8L40 12L60 5L80 10L100 15L120 8L140 12L160 5L180 10L200 15L220 8L240 12" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                <path d="M0 15L20 8L40 12L60 5L80 10L100 15L120 8L140 12L160 5L180 10L200 15L220 8L240 12" stroke="#8b5cf6" strokeWidth="1" fill="none" opacity="0.5"/>
                <circle cx="240" cy="12" r="3" fill="#3b82f6"/>
              </svg>
            </div>
          </div>
          
          {/* Brain scan result */}
          <div className="absolute right-[-50px] bottom-[-50px] z-20">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg border-2 border-white shadow-md overflow-hidden">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg"
                srcSet="https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg 1x, https://upload.wikimedia.org/wikipedia/commons/1/10/MRI_of_human_head_in_Coronal_section.jpg 2x"
                sizes="64px"
                alt="Brain Scan" 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="text-white absolute inset-0 m-auto" style={{display: 'none'}}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24" className="text-white">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Info Bar */}
      <div className="flex justify-between items-center px-12 py-4 border-t border-gray-200 text-blue-900 text-base font-semibold w-full bg-white" style={{marginTop: '-12px'}}>
        <span>Better brain health</span>
        <span>AI for early diagnosis</span>
        <span>Care for your family</span>
      </div>

      {/* How it Works Section */}
      <Howitwork />
      {/* Features Section */}
      <Features />
    </div>
  );
} 













