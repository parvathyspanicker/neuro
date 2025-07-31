import "../style.css";
import heroImg from '../assets/brain-ai.png';
import { Link } from 'react-router-dom';
import Howitwork from '../components/Howitwork';
import Features from '../components/Feature';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 overflow-x-hidden flex flex-col">
      {/* Navbar - Same structure, professional styling */}
      <header className="flex justify-between items-center px-12 py-4 w-full bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <Link to="/dashboard" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            Dashboard
          </Link>
          <a href="#" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </a>
          <Link to="/about" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
            </svg>
            <span>About</span>
          </Link>
          <a href="#feature" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>Features</span>
          </a>
          <a href="#how" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span>How it Works</span>
          </a>
          <a href="#contact" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Contact</span>
          </a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-blue-600 font-semibold hover:underline flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5z"/>
            </svg>
            <span>Login</span>
          </Link>
          <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
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
          
          {/* Simple floating elements */}
          <div className="absolute z-20 w-full h-full pointer-events-none">
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center justify-center absolute left-[-30px] top-20 border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">1,200+ Patients</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-3 flex items-center justify-center absolute right-[-40px] top-32 border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-green-600">4.9★</span>
                <span className="text-xs text-gray-600">Rating</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-3 absolute right-[-20px] bottom-20 border border-gray-200">
              <div className="text-center">
                <div className="text-sm font-semibold text-blue-600">95%</div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>
          </div>
          
          {/* Professional Doctor Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 relative z-10 border border-gray-200">
            {/* Doctor Image */}
            <div className="relative mx-auto mb-4 w-20 h-20">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Doctor" className="w-20 h-20 rounded-full border-2 border-gray-200" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-xs text-gray-500 mb-1">Board Certified Neurologist</div>
              <div className="text-lg font-semibold text-gray-900 mb-1">Dr. Eapen Thomas</div>
              <div className="text-sm text-gray-600">15 Years Experience</div>
            </div>
            
            {/* Simple stats */}
            <div className="flex justify-center gap-6 mb-4 text-center">
              <div>
                <div className="text-sm font-semibold text-blue-600">1.2K+</div>
                <div className="text-xs text-gray-500">Patients</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-green-600">4.9★</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">95%</div>
                <div className="text-xs text-gray-500">Success</div>
              </div>
            </div>
            
            {/* Professional action buttons */}
            <div className="flex justify-center gap-3 mb-4">
              <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
              <button className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition-colors">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            </div>
            
            {/* Simple chart */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">Patient Recovery</span>
                <span className="text-xs text-green-600">+12%</span>
              </div>
              <svg width="100%" height="30" viewBox="0 0 240 30" fill="none">
                <path d="M0 25L40 20L80 22L120 10L160 15L200 8L240 12" stroke="#3b82f6" strokeWidth="2" fill="none"/>
                <circle cx="240" cy="12" r="3" fill="#3b82f6"/>
              </svg>
            </div>
          </div>
          
          {/* Simple patient avatar */}
          <div className="absolute right-[-50px] bottom-[-50px] z-20">
            <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="Patient" className="w-16 h-16 rounded-full border-2 border-white shadow-md" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
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











