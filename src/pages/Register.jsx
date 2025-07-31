import "../style.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/brain-ai.png";
import { FaUserAlt, FaEnvelope, FaLock, FaCalendarAlt, FaPhone, FaEye, FaEyeSlash, FaBrain, FaShieldAlt, FaChartLine, FaClock, FaStar, FaUsers, FaAward, FaCheckCircle } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      alert(`Successfully registered!`);
      navigate('/dashboard');
      setIsLoading(false);
    }, 2000);
  };

  const formFields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name", icon: <FaUserAlt /> },
    { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com", icon: <FaEnvelope /> },
    { label: "Password", name: "password", type: "password", placeholder: "Create a strong password", icon: <FaLock /> },
    { label: "Date of Birth", name: "dob", type: "date", placeholder: "", icon: <FaCalendarAlt /> },
    { label: "Phone Number", name: "phone", type: "tel", placeholder: "+1 (555) 123-4567", icon: <FaPhone /> },
  ];

  return (
    <div className="min-h-screen bg-white dashboard-professional">
      {/* Professional Header - Match Home.jsx */}
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
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </Link>
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

      {/* Main Content */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Side - Professional Info Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-white relative">
          <div className="flex flex-col justify-center px-16 py-20 relative z-10">
            {/* Professional Hero Section */}
            <div className="mb-16">
              <div className="w-24 h-24 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                <FaBrain className="text-white text-3xl" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center leading-tight">
                Join NeuroCare's
                <span className="block text-blue-600">Advanced Platform</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed text-center mb-12">
                Experience cutting-edge AI diagnostics trusted by healthcare professionals worldwide
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex justify-center gap-8 mb-16">
              {[
                { icon: FaStar, text: "4.9/5 Rating", number: "4.9★", color: "text-yellow-600" },
                { icon: FaUsers, text: "Trusted Users", number: "50K+", color: "text-green-600" },
                { icon: FaAward, text: "FDA Certified", number: "FDA", color: "text-blue-600" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{item.number}</div>
                  <div className="text-sm text-gray-600">{item.text}</div>
                </div>
              ))}
            </div>

            {/* Professional Features */}
            <div className="space-y-6">
              {[
                { 
                  icon: FaShieldAlt, 
                  title: "HIPAA Compliant Security", 
                  desc: "Bank-level encryption with complete data protection"
                },
                { 
                  icon: FaBrain, 
                  title: "AI-Powered Diagnostics", 
                  desc: "95%+ accuracy with instant analysis and reporting"
                },
                { 
                  icon: FaClock, 
                  title: "24/7 Expert Support", 
                  desc: "Round-the-clock medical assistance and consultation"
                },
                { 
                  icon: FaChartLine, 
                  title: "Comprehensive Analytics", 
                  desc: "Detailed insights and personalized recommendations"
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="text-blue-600 text-lg" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Professional Registration Form */}
        <div className="flex-1 flex items-center justify-center px-8 py-16 lg:px-16">
          <div className="w-full max-w-lg">
            {/* Form Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Account
              </h2>
              <p className="text-gray-600 text-lg">
                Join thousands of healthcare professionals using our platform
              </p>
            </div>

            {/* Professional Form */}
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
              <form onSubmit={handleSubmit} className="space-y-6">
                {formFields.map((field, index) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {field.icon}
                      </div>
                      <input
                        type={field.name === 'password' && showPassword ? 'text' : field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={form[field.name] || ''}
                        onChange={handleChange}
                        className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300"
                        required
                      />
                      {field.name === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Terms & Conditions */}
                <div className="flex items-start gap-3 pt-4">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5" 
                    required 
                  />
                  <label htmlFor="terms" className="text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                      Terms of Service
                    </Link>
                    {" "}and{" "}
                    <Link to="#" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Professional Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl mt-8"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              {/* Sign In Link */}
              <div className="text-center mt-8 pt-8 border-t border-gray-200">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="text-blue-600 hover:text-blue-700 font-semibold underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
