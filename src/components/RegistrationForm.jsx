import React, { useState } from 'react';
import { useFormValidation, validationRules } from '../hooks/useFormValidation';
import { FaExclamationTriangle, FaCheckCircle, FaEye, FaEyeSlash, FaCalendarAlt } from 'react-icons/fa';
import CalendarPicker from './CalendarPicker';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phoneNumber: '',
    terms: false
  });
  const [showCalendar, setShowCalendar] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    errors,
    validateForm,
    handleFieldBlur,
    handleFieldChange,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    clearErrors
  } = useFormValidation();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === 'checkbox' ? checked : value;
    
    // Format DOB input as user types
    if (name === 'dateOfBirth') {
      // Remove all non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Format as dd-mm-yyyy
      if (digitsOnly.length <= 2) {
        fieldValue = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        fieldValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
      } else {
        fieldValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 4)}-${digitsOnly.slice(4, 8)}`;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));
    
    // Validate immediately on input change for all fields
    handleFieldBlur(name, fieldValue);
  };

  const handleCalendarSelect = (dateString) => {
    setFormData(prev => ({ ...prev, dateOfBirth: dateString }));
    handleFieldBlur('dateOfBirth', dateString);
    setShowCalendar(false);
  };

  const handleCalendarToggle = () => {
    setShowCalendar(!showCalendar);
  };

  const handleInputBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    handleFieldBlur(name, fieldValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateForm(formData);
    
    if (!validation.isValid) {
      // Focus on first error field
      const firstErrorField = Object.keys(validation.errors).find(fieldName => 
        validation.errors[fieldName].length > 0
      );
      if (firstErrorField) {
        const input = document.querySelector(`[name="${firstErrorField}"]`);
        if (input) {
          input.focus();
        }
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Registration successful!');
      setFormData({
        fullName: '',
        email: '',
        password: '',
        dateOfBirth: '',
        phoneNumber: '',
        terms: false
      });
      clearErrors();
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 text-base bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all";
    
    if (hasFieldError(fieldName) && isFieldTouched(fieldName)) {
      return `${baseClass} border-red-300 focus:ring-red-500 focus:border-red-500`;
    } else if (!hasFieldError(fieldName) && formData[fieldName] && formData[fieldName] !== '') {
      return `${baseClass} border-green-300 focus:ring-green-500 focus:border-green-500`;
    }
    
    return `${baseClass} border-gray-200`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">User Registration</h1>
            <p className="text-gray-600">Create your account with us</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getFieldClassName('fullName')}
                  placeholder="Enter your full name"
                  required
                />
                {hasFieldError('fullName') && isFieldTouched('fullName') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaExclamationTriangle className="text-red-500" />
                  </div>
                )}
                {!hasFieldError('fullName') && formData.fullName && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
              {hasFieldError('fullName') && isFieldTouched('fullName') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('fullName')}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getFieldClassName('email')}
                  placeholder="Enter your email"
                  required
                />
                {hasFieldError('email') && isFieldTouched('email') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaExclamationTriangle className="text-red-500" />
                  </div>
                )}
                {!hasFieldError('email') && formData.email && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
              {hasFieldError('email') && isFieldTouched('email') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getFieldClassName('password')}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-12 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
                {hasFieldError('password') && isFieldTouched('password') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaExclamationTriangle className="text-red-500" />
                  </div>
                )}
                {!hasFieldError('password') && formData.password && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
              {hasFieldError('password') && isFieldTouched('password') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('password')}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <strong>Requirements:</strong> 8+ chars, uppercase, lowercase, number, special character
              </div>
            </div>

            {/* Date of Birth */}
            <div className="relative">
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onClick={handleCalendarToggle}
                  readOnly
                  className={`${getFieldClassName('dateOfBirth')} cursor-pointer`}
                  placeholder="dd-mm-yyyy"
                  required
                />
                <button
                  type="button"
                  onClick={handleCalendarToggle}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <FaCalendarAlt />
                </button>
              </div>
              {hasFieldError('dateOfBirth') && isFieldTouched('dateOfBirth') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('dateOfBirth')}
                </p>
              )}
              {showCalendar && (
                <CalendarPicker
                  value={formData.dateOfBirth || ''}
                  onChange={handleCalendarSelect}
                  onClose={() => setShowCalendar(false)}
                  isOpen={showCalendar}
                />
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className={getFieldClassName('phoneNumber')}
                  placeholder="Enter your phone number"
                  required
                />
                {hasFieldError('phoneNumber') && isFieldTouched('phoneNumber') && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaExclamationTriangle className="text-red-500" />
                  </div>
                )}
                {!hasFieldError('phoneNumber') && formData.phoneNumber && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaCheckCircle className="text-green-500" />
                  </div>
                )}
              </div>
              {hasFieldError('phoneNumber') && isFieldTouched('phoneNumber') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('phoneNumber')}
                </p>
              )}
              <div className="mt-2 text-xs text-gray-500">
                <strong>Examples:</strong> 9876543210 (India) or +1234567890 (International)
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                  required
                />
                <span className="text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                    Privacy Policy
                  </a>
                  {" "}*
                </span>
              </label>
              {hasFieldError('terms') && isFieldTouched('terms') && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <FaExclamationTriangle className="text-xs" />
                  {getFieldError('terms')}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
