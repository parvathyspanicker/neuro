import React, { useState } from "react";
import { Link } from "react-router-dom";
import heroImg from '../assets/brain-ai.png';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login attempt:", formData);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Navbar - Same as Home */}
      <header className="flex justify-between items-center px-12 py-4 w-full">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-indigo-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          <Link 
            to="/" 
            className="hover:text-indigo-600 transition flex items-center gap-2"
            onClick={(e) => {
              console.log("Home link clicked");
              // Don't prevent default - let React Router handle it
            }}
          >
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span>Home</span>
          </Link>
          <Link to="/#feature" className="hover:text-indigo-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>Features</span>
          </Link>
          <Link to="/#how" className="hover:text-indigo-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span>How it Works</span>
          </Link>
          <Link to="/#contact" className="hover:text-indigo-600 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Contact</span>
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <span className="text-indigo-600 font-semibold flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5z"/>
            </svg>
            <span>Login</span>
          </span>
          <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-semibold shadow hover:bg-indigo-700 transition flex items-center gap-2">
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span>Get App</span>
          </Link>
        </div>
      </header>

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-3">
        <div className="absolute top-20 left-20 w-40 h-40 bg-indigo-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-100 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex pt-8">
        {/* Right Side - Compact Login Form */}
        <div className="w-full flex items-center justify-center p-6">
          <div className="w-full max-w-4xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Left Side - Compact Branding */}
            <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-indigo-600 to-blue-700 relative">
              <div className="flex flex-col justify-center px-6 py-8 text-white">
                {/* Compact Logo */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <img src={heroImg} alt="NeuroCare" className="w-7 h-7 filter brightness-0 invert" />
                    </div>
                    <div className="ml-3">
                      <h1 className="text-2xl font-bold neuro-font">NeuroCare</h1>
                      <p className="text-blue-200 text-sm medical-font">AI Diagnostics</p>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold leading-tight mb-4 neuro-title">
                    Smart Neurological
                    <span className="block text-blue-200 text-2xl font-normal medical-font">Care Platform</span>
                  </h2>
                  <p className="text-blue-100 text-base medical-font mb-8">
                    AI-powered brain health diagnostics with precision and speed
                  </p>
                </div>

                {/* Compact Features */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg neuro-font mb-1">99.7% Accuracy</h3>
                      <p className="text-blue-200 text-sm medical-font">FDA-approved algorithms</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg neuro-font mb-1">Real-time Analysis</h3>
                      <p className="text-blue-200 text-sm medical-font">Instant brain monitoring</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg neuro-font mb-1">HIPAA Secure</h3>
                      <p className="text-blue-200 text-sm medical-font">End-to-end encryption</p>
                    </div>
                  </div>
                </div>

                {/* Compact Stats */}
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold neuro-font mb-1">50K+</div>
                    <div className="text-blue-200 text-xs medical-font">Patients</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold neuro-font mb-1">1.2K+</div>
                    <div className="text-blue-200 text-xs medical-font">Doctors</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-2xl font-bold neuro-font mb-1">24/7</div>
                    <div className="text-blue-200 text-xs medical-font">Support</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-3/5 p-8">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-3">
                  <img src={heroImg} alt="NeuroCare" className="w-7 h-7 filter brightness-0 invert" />
                </div>
                <h1 className="text-xl font-bold text-indigo-900 neuro-font">NeuroCare</h1>
              </div>

              {/* Compact Login Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
                
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1 neuro-font">Welcome Back</h2>
                  <p className="text-gray-600 text-sm medical-font">Access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 medical-font">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="doctor@neurocare.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1 medical-font">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Enter password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-500"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          ) : (
                            <>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot */}
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="w-3 h-3 text-indigo-600 rounded" />
                      <span className="ml-2 text-gray-700 medical-font">Remember me</span>
                    </label>
                    <a href="#" className="text-indigo-600 hover:text-indigo-500 font-medium medical-font">
                      Forgot?
                    </a>
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] neuro-font text-sm"
                  >
                    Access Dashboard
                  </button>
                </form>

                {/* Divider */}
                <div className="my-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500 medical-font">Or continue with</span>
                    </div>
                  </div>
                </div>

                {/* SSO Options */}
                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm medical-font">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </button>
                  
                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm medical-font">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
                    </svg>
                  </button>

                  <button className="flex-1 flex items-center justify-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-all text-sm medical-font">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#000000" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                  </button>
                </div>

                {/* Sign Up Link */}
                <p className="mt-4 text-center text-gray-600 text-sm medical-font">
                  New to NeuroCare?{" "}
                  <Link to="/register" className="text-indigo-600 hover:text-indigo-500 font-semibold neuro-font">
                    Create account
                  </Link>
                </p>
              </div>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 medical-font">
                  🔒 HIPAA-compliant • Encrypted • SOC 2 certified
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
