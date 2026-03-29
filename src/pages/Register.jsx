import "../style.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/brain-ai.png";
import { FaUserAlt, FaEnvelope, FaLock, FaCalendarAlt, FaPhone, FaEye, FaEyeSlash, FaBrain, FaShieldAlt, FaChartLine, FaClock, FaStar, FaUsers, FaAward, FaCheckCircle, FaHome, FaInfoCircle, FaGlobe, FaSignInAlt, FaUserPlus, FaExclamationTriangle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import CalendarPicker from "../components/CalendarPicker";

export default function Register() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [form, setForm] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userType, setUserType] = useState("patient");
  const [notice, setNotice] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showCalendar, setShowCalendar] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Format DOB input as user types
    if (name === 'dob') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as dd-mm-yyyy
      if (digitsOnly.length <= 2) {
        processedValue = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        processedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
      } else {
        processedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4, 8)}`;
      }
    }
    
    setForm({ ...form, [name]: processedValue });
    
    // Validate immediately on input change for all fields
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(processedValue);
        break;
      case 'email':
        error = validateEmail(processedValue);
        break;
      case 'password':
        error = validatePassword(processedValue);
        break;
      case 'phone':
        error = validatePhone(processedValue);
        break;
      case 'dob':
        error = validateDateOfBirth(processedValue);
        break;
      case 'licenseNumber':
        error = validateLicenseNumber(processedValue);
        break;
      case 'specialization':
        error = validateSpecialization(processedValue);
        break;
      case 'hospital':
        error = validateHospital(processedValue);
        break;
      case 'experience':
        error = validateExperience(processedValue);
        break;
      default:
        break;
    }
    
    setValidationErrors({ ...validationErrors, [name]: error });
  };

  const handleCalendarSelect = (dateString) => {
    setForm({ ...form, dob: dateString });
    const error = validateDateOfBirth(dateString);
    setValidationErrors({ ...validationErrors, dob: error });
    setShowCalendar(false);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  // Validation functions
  const validateName = (name) => {
    if (!name) return 'Full name is required';
    
    const trimmedName = name.trim();
    
    // Check for numbers immediately
    if (/\d/.test(trimmedName)) {
      return 'Name cannot contain numbers';
    }
    
    // Check for special characters (except spaces)
    if (/[^a-zA-Z\s]/.test(trimmedName)) {
      return 'Name can only contain letters and spaces';
    }
    
    if (trimmedName.length < 2) return 'Name must be at least 2 characters long';
    if (trimmedName.length > 50) return 'Name must not exceed 50 characters';
    
    if (/\s{2,}/.test(trimmedName)) {
      return 'Name cannot contain multiple consecutive spaces';
    }
    
    if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
      return 'Name cannot start or end with spaces';
    }
    
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.includes('..')) return 'Email cannot contain consecutive dots';
    if (email.startsWith('.') || email.endsWith('.')) return 'Email cannot start or end with a dot';
    if (email.includes(' ')) return 'Email cannot contain spaces';
    if (email.includes('@@')) return 'Email cannot contain consecutive @ symbols';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) return 'Password must contain at least one special character';
    if (/(.)\1{2,}/.test(password)) return 'Password cannot contain more than 2 consecutive identical characters';
    if (password.includes(' ')) return 'Password cannot contain spaces';
    if (password.length > 128) return 'Password is too long (maximum 128 characters)';
    
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) return 'This password is too common. Please choose a stronger password';
    return '';
  };

  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    const cleanedPhone = phone.replace(/\s/g, '');
    const indianRegex = /^[6-9]\d{9}$/;
    const internationalRegex = /^\+\d{1,3}\d{4,14}$/;
    
    if (!indianRegex.test(cleanedPhone) && !internationalRegex.test(cleanedPhone)) {
      return 'Phone number must be either 10 digits starting with 6-9 (India) or international format with country code (+xx)';
    }
    
    if (indianRegex.test(cleanedPhone)) {
      if (/^(\d)\1{9}$/.test(cleanedPhone)) return 'Phone number cannot have all identical digits';
      if (/^(0123456789|9876543210)$/.test(cleanedPhone)) return 'Please enter a valid phone number';
    }
    
    if (internationalRegex.test(cleanedPhone)) {
      const countryCode = cleanedPhone.substring(1, 4);
      const phoneNumber = cleanedPhone.substring(4);
      if (countryCode.length < 1 || countryCode.length > 3) return 'Invalid country code format';
      if (phoneNumber.length < 4 || phoneNumber.length > 14) return 'Phone number length is invalid';
    }
    
    if (/[^0-9+\s\-\(\)]/.test(phone)) return 'Phone number contains invalid characters';
    return '';
  };

  const validateDateOfBirth = (dob) => {
    if (!dob) return 'Date of birth is required';
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dob.trim().match(dateRegex);
    
    if (!match) return 'Date must be in dd-mm-yyyy format';
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    if (day < 1 || day > 31) return 'Day must be between 01 and 31';
    if (month < 1 || month > 12) return 'Month must be between 01 and 12';
    
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) return `Year must be between 1900 and ${currentYear}`;
    
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return 'Please enter a valid date';
    }
    
    const today = new Date();
    if (date > today) return 'Date of birth cannot be in the future';
    
    const age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge = age - 1;
    }
    
    if (actualAge < 18) return 'You must be at least 18 years old to register';
    if (actualAge > 120) return 'Please enter a valid date of birth';
    return '';
  };

  const validateLicenseNumber = (licenseNumber) => {
    if (!licenseNumber) return 'Medical license number is required';
    if (licenseNumber.length < 5) return 'License number must be at least 5 characters long';
    return '';
  };

  const validateSpecialization = (specialization) => {
    if (!specialization) return 'Specialization is required';
    if (specialization.length < 2) return 'Specialization must be at least 2 characters long';
    return '';
  };

  const validateHospital = (hospital) => {
    if (!hospital) return 'Hospital/Clinic name is required';
    if (hospital.length < 2) return 'Hospital/Clinic name must be at least 2 characters long';
    return '';
  };

  const validateExperience = (experience) => {
    if (!experience) return 'Years of experience is required';
    const exp = parseInt(experience);
    if (isNaN(exp) || exp < 0) return 'Please enter a valid number of years';
    if (exp > 50) return 'Please enter a realistic number of years';
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    // Common fields
    errors.name = validateName(form.name);
    errors.email = validateEmail(form.email);
    errors.password = validatePassword(form.password);
    errors.phone = validatePhone(form.phone);
    errors.dob = validateDateOfBirth(form.dob);
    
    // Doctor-specific fields
    if (userType === 'doctor') {
      errors.licenseNumber = validateLicenseNumber(form.licenseNumber);
      errors.specialization = validateSpecialization(form.specialization);
      errors.hospital = validateHospital(form.hospital);
      errors.experience = validateExperience(form.experience);
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate form
    const errors = validateForm();
    setValidationErrors(errors);
    
    // Check if there are any validation errors
    if (Object.values(errors).some(error => error !== '')) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Registration form data:', form);

      // Split full name into first and last name
      const nameParts = form.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'User'; // Default to 'User' if no last name provided

      const userData = {
        firstName,
        lastName,
        phone: form.phone,
        date_of_birth: form.dob,
        role: userType,
        ...(userType === 'doctor' && {
          license_number: form.licenseNumber,
          specialization: form.specialization,
          hospital: form.hospital,
          experience: form.experience
        })
      };

      console.log('Sending registration data:', {
        email: form.email,
        password: form.password,
        userData
      });

      const { data, error } = await signUp(form.email, form.password, userData);

      console.log('Registration response:', { data, error });

      if (error) {
        console.log('Registration error:', error);
        setError(error.message);
      } else {
        console.log('Registration successful:', data);
        
        if (userType === 'doctor') {
          // Show in-page notice instead of redirecting away
          setNotice('Registration successful! Your doctor account is pending admin approval. You will be able to login once an admin approves your request.');
        } else {
          alert("Registration successful! You can now sign in with your credentials.");
          navigate('/login');
        }
      }
    } catch (err) {
      console.log('Registration exception:', err);
      setError("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  const baseFormFields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "Enter your full name", icon: <FaUserAlt /> },
    { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com", icon: <FaEnvelope /> },
    { label: "Password", name: "password", type: "password", placeholder: "Create a strong password", icon: <FaLock /> },
    { label: "Date of Birth", name: "dob", type: "text", placeholder: "dd-mm-yyyy", icon: <FaCalendarAlt /> },
    { label: "Phone Number", name: "phone", type: "tel", placeholder: "+1 (555) 123-4567", icon: <FaPhone /> },
  ];

  const doctorFields = [
    { label: "Medical License Number", name: "licenseNumber", type: "text", placeholder: "Enter your license number", icon: <FaAward /> },
    { label: "Specialization", name: "specialization", type: "text", placeholder: "e.g., Neurology, Radiology", icon: <FaBrain /> },
    { label: "Hospital/Clinic", name: "hospital", type: "text", placeholder: "Your workplace", icon: <FaHome /> },
    { label: "Years of Experience", name: "experience", type: "number", placeholder: "e.g., 5", icon: <FaChartLine /> },
  ];

  const formFields = userType === 'doctor' ? [...baseFormFields, ...doctorFields] : baseFormFields;

  return (
    <div className="min-h-screen bg-white dashboard-professional">
      {/* Professional Header - Match Home.jsx */}
      <header className="flex justify-between items-center px-12 py-4 w-full bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img src={heroImg} alt="NeuroCare Logo" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-extrabold text-blue-700 tracking-wider">NeuroCare</span>
        </div>
        <nav className="flex items-center space-x-8 text-md font-medium text-gray-700">
          {user && user.role === 'patient' && (
            <Link to="/dashboard" className="hover:text-blue-600 transition flex items-center gap-2">
              <FaBrain className="text-lg" />
              Dashboard
            </Link>
          )}
          <Link to="/" className="hover:text-blue-600 transition flex items-center gap-2">
            <FaHome className="text-lg" />
            <span>Home</span>
          </Link>
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
          <Link to="/login" className="text-blue-600 font-semibold hover:underline flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all">
            <FaSignInAlt className="text-lg" />
            <span>Login</span>
          </Link>
          <span className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow flex items-center gap-2">
            <FaUserPlus className="text-lg" />
            <span>Register</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Side - Static Professional Info Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-white relative">
          <div className="flex flex-col justify-center px-16 py-20 relative z-10">
            {/* Static Professional Hero Section */}
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

            {/* Static Trust Indicators */}
            <div className="flex justify-center gap-8 mb-16">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">4.9★</div>
                <div className="text-sm text-gray-600">4.9/5 Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">50K+</div>
                <div className="text-sm text-gray-600">Trusted Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">FDA</div>
                <div className="text-sm text-gray-600">FDA Certified</div>
              </div>
            </div>

            {/* Static Professional Features */}
            <div className="space-y-6">
              <div className="group">
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaShieldAlt className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">HIPAA Compliant Security</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Bank-level encryption with complete data protection</p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBrain className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">AI-Powered Diagnostics</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">95%+ accuracy with instant analysis and reporting</p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaClock className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">24/7 Expert Support</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Round-the-clock medical assistance and consultation</p>
                  </div>
                </div>
              </div>

              <div className="group">
                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-blue-600 text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">Comprehensive Analytics</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Detailed insights and personalized recommendations</p>
                  </div>
                </div>
              </div>
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

            {/* User Type Selection */}
            <div className="mb-8">
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setUserType('patient')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${userType === 'patient'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Register as Patient
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('doctor')}
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${userType === 'doctor'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                    }`}
                >
                  Register as Doctor
                </button>
              </div>
            </div>

            {/* Professional Form */}
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-200">
              {notice && (
                <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800">
                  {notice}
                </div>
              )}
              {userType === 'doctor' && !notice && (
                <div className="mb-6 p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800">
                  Note: Doctor accounts require admin approval before you can log in. You will receive an alert here after registration.
                </div>
              )}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {formFields.map((field, index) => (
                  <div key={field.name} className="relative">
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
                        onClick={field.name === 'dob' ? handleCalendarToggle : undefined}
                        readOnly={field.name === 'dob'}
                        className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 hover:border-gray-300 ${
                          validationErrors[field.name] 
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-200'
                        } ${field.name === 'dob' ? 'cursor-pointer' : ''}`}
                        required
                      />
                      {field.name === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                      {field.name === 'dob' && (
                        <button
                          type="button"
                          onClick={handleCalendarToggle}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <FaCalendarAlt />
                        </button>
                      )}
                      {validationErrors[field.name] && field.name !== 'dob' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <FaExclamationTriangle className="text-red-500" />
                        </div>
                      )}
                      {!validationErrors[field.name] && form[field.name] && field.name !== 'dob' && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <FaCheckCircle className="text-green-500" />
                        </div>
                      )}
                    </div>
                    {validationErrors[field.name] && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <FaExclamationTriangle className="text-xs" />
                        {validationErrors[field.name]}
                      </p>
                    )}
                    {field.name === 'dob' && showCalendar && (
                      <CalendarPicker
                        value={form.dob || ''}
                        onChange={handleCalendarSelect}
                        onClose={() => setShowCalendar(false)}
                        isOpen={showCalendar}
                      />
                    )}
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
