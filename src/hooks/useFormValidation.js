/**
 * React Hook for Form Validation
 * Integrates with existing React forms
 */

import { useState, useCallback } from 'react';

// Validation functions
const validateFullName = (name) => {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('Full name is required');
  } else {
    const trimmedName = name.trim();
    
    // Check for numbers immediately
    if (/\d/.test(trimmedName)) {
      errors.push('Name cannot contain numbers');
    }
    
    // Check for special characters (except spaces)
    if (/[^a-zA-Z\s]/.test(trimmedName)) {
      errors.push('Name can only contain letters and spaces');
    }
    
    if (trimmedName.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (trimmedName.length > 50) {
      errors.push('Name must not exceed 50 characters');
    }
    
    if (/\s{2,}/.test(trimmedName)) {
      errors.push('Name cannot contain multiple consecutive spaces');
    }
    
    // Check if name starts or ends with space
    if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
      errors.push('Name cannot start or end with spaces');
    }
  }
  
  return errors;
};

const validateEmail = (email) => {
  const errors = [];
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please enter a valid email address');
    }
    
    // Additional checks for common issues
    if (email.includes('..')) {
      errors.push('Email cannot contain consecutive dots');
    }
    
    if (email.startsWith('.') || email.endsWith('.')) {
      errors.push('Email cannot start or end with a dot');
    }
    
    // Check for spaces
    if (email.includes(' ')) {
      errors.push('Email cannot contain spaces');
    }
    
    // Check for common typos
    if (email.includes('@@')) {
      errors.push('Email cannot contain consecutive @ symbols');
    }
  }
  
  return errors;
};

const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password === '') {
    errors.push('Password is required');
  } else {
    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    // Check for uppercase letter
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    // Check for lowercase letter
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    // Check for number
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    // Check for special character
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain more than 2 consecutive identical characters');
    }
    
    // Check for spaces
    if (password.includes(' ')) {
      errors.push('Password cannot contain spaces');
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push('This password is too common. Please choose a stronger password');
    }
    
    // Check if password is too long
    if (password.length > 128) {
      errors.push('Password is too long (maximum 128 characters)');
    }
  }
  
  return errors;
};

const validateDateOfBirth = (dob) => {
  const errors = [];
  
  if (!dob || dob.trim() === '') {
    errors.push('Date of birth is required');
  } else {
    // Check format dd-mm-yyyy
    const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
    const match = dob.trim().match(dateRegex);
    
    if (!match) {
      errors.push('Date must be in dd-mm-yyyy format');
      return errors;
    }
    
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);
    
    // Validate day
    if (day < 1 || day > 31) {
      errors.push('Day must be between 01 and 31');
    }
    
    // Validate month
    if (month < 1 || month > 12) {
      errors.push('Month must be between 01 and 12');
    }
    
    // Validate year
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      errors.push(`Year must be between 1900 and ${currentYear}`);
    }
    
    // Check if date is valid
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      errors.push('Please enter a valid date');
    }
    
    // Check if date is not in the future
    const today = new Date();
    if (date > today) {
      errors.push('Date of birth cannot be in the future');
    }
    
    // Check if user is at least 18 years old
    const age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    const dayDiff = today.getDate() - day;
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      actualAge = age - 1;
    }
    
    if (actualAge < 18) {
      errors.push('You must be at least 18 years old to register');
    }
    
    // Check if user is too old (reasonable limit)
    if (actualAge > 120) {
      errors.push('Please enter a valid date of birth');
    }
  }
  
  return errors;
};

const validatePhoneNumber = (phone) => {
  const errors = [];
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  } else {
    const cleanedPhone = phone.replace(/\s/g, ''); // Remove spaces
    
    // Check for Indian format (10 digits starting with 6-9)
    const indianRegex = /^[6-9]\d{9}$/;
    
    // Check for international format (+xx followed by digits)
    const internationalRegex = /^\+\d{1,3}\d{4,14}$/;
    
    if (!indianRegex.test(cleanedPhone) && !internationalRegex.test(cleanedPhone)) {
      errors.push('Phone number must be either 10 digits starting with 6-9 (India) or international format with country code (+xx)');
    }
    
    // Additional validation for Indian numbers
    if (indianRegex.test(cleanedPhone)) {
      // Check for common invalid patterns
      if (/^(\d)\1{9}$/.test(cleanedPhone)) {
        errors.push('Phone number cannot have all identical digits');
      }
      
      // Check for sequential numbers
      if (/^(0123456789|9876543210)$/.test(cleanedPhone)) {
        errors.push('Please enter a valid phone number');
      }
    }
    
    // Additional validation for international numbers
    if (internationalRegex.test(cleanedPhone)) {
      const countryCode = cleanedPhone.substring(1, 4); // Extract country code
      const phoneNumber = cleanedPhone.substring(4);
      
      // Check if country code is reasonable (1-3 digits)
      if (countryCode.length < 1 || countryCode.length > 3) {
        errors.push('Invalid country code format');
      }
      
      // Check if phone number part is reasonable length
      if (phoneNumber.length < 4 || phoneNumber.length > 14) {
        errors.push('Phone number length is invalid');
      }
      
      // Check for valid country codes (basic check)
      const validCountryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98'];
      const countryCodeNum = parseInt(countryCode);
      if (countryCodeNum < 1 || countryCodeNum > 999) {
        errors.push('Invalid country code');
      }
    }
    
    // Check for special characters that shouldn't be in phone numbers
    if (/[^0-9+\s\-\(\)]/.test(phone)) {
      errors.push('Phone number contains invalid characters');
    }
  }
  
  return errors;
};

const validateTerms = (termsChecked) => {
  const errors = [];
  
  if (!termsChecked) {
    errors.push('You must accept the Terms and Conditions to continue');
  }
  
  return errors;
};

// Custom hook for form validation
export const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback((fieldName, value) => {
    let fieldErrors = [];
    
    switch (fieldName) {
      case 'fullName':
        fieldErrors = validateFullName(value);
        break;
      case 'email':
        fieldErrors = validateEmail(value);
        break;
      case 'password':
        fieldErrors = validatePassword(value);
        break;
      case 'dateOfBirth':
        fieldErrors = validateDateOfBirth(value);
        break;
      case 'phoneNumber':
        fieldErrors = validatePhoneNumber(value);
        break;
      case 'terms':
        fieldErrors = validateTerms(value);
        break;
      default:
        break;
    }
    
    return fieldErrors;
  }, []);

  const validateForm = useCallback((formData) => {
    const newErrors = {};
    
    Object.keys(formData).forEach(fieldName => {
      newErrors[fieldName] = validateField(fieldName, formData[fieldName]);
    });
    
    setErrors(newErrors);
    
    const isValid = Object.values(newErrors).every(fieldErrors => fieldErrors.length === 0);
    return { isValid, errors: newErrors };
  }, [validateField]);

  const handleFieldBlur = useCallback((fieldName, value) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const fieldErrors = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: fieldErrors }));
  }, [validateField]);

  const handleFieldChange = useCallback((fieldName) => {
    // Clear error when user starts typing
    if (errors[fieldName] && errors[fieldName].length > 0) {
      setErrors(prev => ({ ...prev, [fieldName]: [] }));
    }
  }, [errors]);

  const getFieldError = useCallback((fieldName) => {
    return errors[fieldName] && errors[fieldName].length > 0 ? errors[fieldName][0] : '';
  }, [errors]);

  const hasFieldError = useCallback((fieldName) => {
    return errors[fieldName] && errors[fieldName].length > 0;
  }, [errors]);

  const isFieldTouched = useCallback((fieldName) => {
    return touched[fieldName] || false;
  }, [touched]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleFieldBlur,
    handleFieldChange,
    getFieldError,
    hasFieldError,
    isFieldTouched,
    clearErrors
  };
};

// Validation rules for display
export const validationRules = {
  fullName: {
    title: 'Full Name',
    rules: [
      'Only alphabets and spaces allowed',
      '2-50 characters long',
      'No consecutive spaces'
    ]
  },
  email: {
    title: 'Email Address',
    rules: [
      'Valid email format required',
      'No consecutive dots',
      'Cannot start or end with dots'
    ]
  },
  password: {
    title: 'Password',
    rules: [
      'At least 8 characters long',
      'At least 1 uppercase letter',
      'At least 1 lowercase letter',
      'At least 1 number',
      'At least 1 special character',
      'No more than 2 consecutive identical characters'
    ]
  },
  dateOfBirth: {
    title: 'Date of Birth',
    rules: [
      'Format: dd-mm-yyyy',
      'Must be at least 18 years old',
      'Cannot be in the future',
      'Valid date required'
    ]
  },
  phoneNumber: {
    title: 'Phone Number',
    rules: [
      'Indian format: 10 digits starting with 6-9',
      'International format: +xx followed by digits',
      'No identical digits for Indian numbers'
    ]
  },
  terms: {
    title: 'Terms & Conditions',
    rules: [
      'Must be accepted to continue'
    ]
  }
};

export default useFormValidation;
