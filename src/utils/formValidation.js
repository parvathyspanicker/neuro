/**
 * Comprehensive Client-Side Form Validation
 * For Registration Form with Full Name, Email, Password, Date of Birth, Phone Number, and Terms & Conditions
 */

class FormValidator {
  constructor() {
    this.errors = {};
    this.isValid = false;
  }

  /**
   * Validate Full Name
   * Rules: Only alphabets and spaces, 2-50 characters
   */
  validateFullName(name) {
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
      
      // Check length
      if (trimmedName.length < 2) {
        errors.push('Name must be at least 2 characters long');
      } else if (trimmedName.length > 50) {
        errors.push('Name must not exceed 50 characters');
      }
      
      // Check for multiple consecutive spaces
      if (/\s{2,}/.test(trimmedName)) {
        errors.push('Name cannot contain multiple consecutive spaces');
      }
      
      // Check if name starts or ends with space
      if (trimmedName.startsWith(' ') || trimmedName.endsWith(' ')) {
        errors.push('Name cannot start or end with spaces');
      }
    }
    
    return errors;
  }

  /**
   * Validate Email
   * Rules: Valid email format
   */
  validateEmail(email) {
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
    }
    
    return errors;
  }

  /**
   * Validate Password
   * Rules: At least 8 characters, must include 1 uppercase, 1 lowercase, 1 number, 1 special character
   */
  validatePassword(password) {
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
        errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)');
      }
      
      // Check for common weak patterns
      if (/(.)\1{2,}/.test(password)) {
        errors.push('Password cannot contain more than 2 consecutive identical characters');
      }
      
      // Check for common weak passwords
      const weakPasswords = ['password', '12345678', 'qwerty123', 'admin123', 'letmein'];
      if (weakPasswords.includes(password.toLowerCase())) {
        errors.push('This password is too common. Please choose a stronger password');
      }
    }
    
    return errors;
  }

  /**
   * Validate Date of Birth
   * Rules: Valid dd-mm-yyyy format, no future date, user must be at least 18 years old
   */
  validateDateOfBirth(dob) {
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
    }
    
    return errors;
  }

  /**
   * Validate Phone Number
   * Rules: 10 digits (India: starts with 6-9) or international format with +xx
   */
  validatePhoneNumber(phone) {
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
      }
    }
    
    return errors;
  }

  /**
   * Validate Terms and Conditions
   * Rules: Must be checked before submission
   */
  validateTerms(termsChecked) {
    const errors = [];
    
    if (!termsChecked) {
      errors.push('You must accept the Terms and Conditions to continue');
    }
    
    return errors;
  }

  /**
   * Validate entire form
   */
  validateForm(formData) {
    this.errors = {};
    
    // Validate each field
    this.errors.fullName = this.validateFullName(formData.fullName);
    this.errors.email = this.validateEmail(formData.email);
    this.errors.password = this.validatePassword(formData.password);
    this.errors.dateOfBirth = this.validateDateOfBirth(formData.dateOfBirth);
    this.errors.phoneNumber = this.validatePhoneNumber(formData.phoneNumber);
    this.errors.terms = this.validateTerms(formData.terms);
    
    // Check if form is valid
    this.isValid = Object.values(this.errors).every(fieldErrors => fieldErrors.length === 0);
    
    return {
      isValid: this.isValid,
      errors: this.errors
    };
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldName) {
    return this.errors[fieldName] && this.errors[fieldName].length > 0 
      ? this.errors[fieldName][0] 
      : '';
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(fieldName) {
    return this.errors[fieldName] && this.errors[fieldName].length > 0;
  }
}

/**
 * DOM Manipulation and UI Updates
 */
class FormValidationUI {
  constructor(formId) {
    this.form = document.getElementById(formId);
    this.validator = new FormValidator();
    this.init();
  }

  init() {
    if (!this.form) {
      console.error('Form not found with ID:', formId);
      return;
    }

    // Add event listeners
    this.addEventListeners();
    
    // Initialize form state
    this.initializeForm();
  }

  addEventListeners() {
    // Real-time validation on input
    const inputs = this.form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      
      // For name field, validate immediately on input change
      if (input.name === 'fullName') {
        input.addEventListener('input', () => this.validateField(input));
      } else {
        input.addEventListener('input', () => this.clearFieldError(input));
      }
    });

    // Date input validation
    const dateInput = this.form.querySelector('input[name="dateOfBirth"]');
    if (dateInput) {
      dateInput.addEventListener('blur', () => this.validateField(dateInput));
      dateInput.addEventListener('input', () => this.clearFieldError(dateInput));
    }

    // Terms checkbox validation
    const termsCheckbox = this.form.querySelector('input[name="terms"]');
    if (termsCheckbox) {
      termsCheckbox.addEventListener('change', () => this.validateField(termsCheckbox));
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  initializeForm() {
    // Add error message containers
    this.addErrorContainers();
    
    // Add CSS classes for styling
    this.addStyles();
  }

  addErrorContainers() {
    const fields = ['fullName', 'email', 'password', 'dateOfBirth', 'phoneNumber', 'terms'];
    
    fields.forEach(fieldName => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      if (input) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-error';
        errorContainer.id = `${fieldName}-error`;
        errorContainer.style.display = 'none';
        
        // Insert after the input's parent container
        const parent = input.closest('.form-group') || input.parentElement;
        parent.appendChild(errorContainer);
      }
    });
  }

  addStyles() {
    // Add CSS styles if not already present
    if (!document.getElementById('form-validation-styles')) {
      const style = document.createElement('style');
      style.id = 'form-validation-styles';
      style.textContent = `
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group input.error {
          border: 2px solid #dc3545 !important;
          box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
        }
        
        .form-group input.valid {
          border: 2px solid #28a745 !important;
          box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25) !important;
        }
        
        .field-error {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .field-error::before {
          content: "⚠️";
          font-size: 0.75rem;
        }
        
        .form-group input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `;
      document.head.appendChild(style);
    }
  }

  validateField(input) {
    const fieldName = input.name;
    const value = input.type === 'checkbox' ? input.checked : input.value;
    
    // Create form data object for validation
    const formData = { [fieldName]: value };
    
    // Validate specific field
    let errors = [];
    switch (fieldName) {
      case 'fullName':
        errors = this.validator.validateFullName(value);
        break;
      case 'email':
        errors = this.validator.validateEmail(value);
        break;
      case 'password':
        errors = this.validator.validatePassword(value);
        break;
      case 'dateOfBirth':
        errors = this.validator.validateDateOfBirth(value);
        break;
      case 'phoneNumber':
        errors = this.validator.validatePhoneNumber(value);
        break;
      case 'terms':
        errors = this.validator.validateTerms(value);
        break;
    }
    
    this.updateFieldUI(input, errors);
  }

  clearFieldError(input) {
    // Clear error styling when user starts typing
    input.classList.remove('error');
    const errorContainer = document.getElementById(`${input.name}-error`);
    if (errorContainer) {
      errorContainer.style.display = 'none';
    }
  }

  updateFieldUI(input, errors) {
    const errorContainer = document.getElementById(`${input.name}-error`);
    
    if (errors.length > 0) {
      // Show error
      input.classList.add('error');
      input.classList.remove('valid');
      
      if (errorContainer) {
        errorContainer.textContent = errors[0];
        errorContainer.style.display = 'flex';
      }
    } else if (input.value.trim() !== '') {
      // Show valid state
      input.classList.remove('error');
      input.classList.add('valid');
      
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
    } else {
      // Clear all states
      input.classList.remove('error', 'valid');
      
      if (errorContainer) {
        errorContainer.style.display = 'none';
      }
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(this.form);
    const data = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      password: formData.get('password'),
      dateOfBirth: formData.get('dateOfBirth'),
      phoneNumber: formData.get('phoneNumber'),
      terms: formData.get('terms') === 'on'
    };
    
    // Validate entire form
    const validation = this.validator.validateForm(data);
    
    if (!validation.isValid) {
      // Update UI for all fields
      Object.keys(validation.errors).forEach(fieldName => {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        if (input) {
          this.updateFieldUI(input, validation.errors[fieldName]);
        }
      });
      
      // Focus on first error field
      const firstErrorField = Object.keys(validation.errors).find(fieldName => 
        validation.errors[fieldName].length > 0
      );
      if (firstErrorField) {
        const input = this.form.querySelector(`[name="${firstErrorField}"]`);
        if (input) {
          input.focus();
        }
      }
      
      return false;
    }
    
    // Form is valid, proceed with submission
    this.submitForm(data);
    return true;
  }

  submitForm(data) {
    // Disable submit button
    const submitBtn = this.form.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }
    
    // Here you would typically send the data to your server
    console.log('Form submitted successfully:', data);
    
    // Simulate API call
    setTimeout(() => {
      alert('Registration successful!');
      this.form.reset();
      this.clearAllErrors();
      
      // Re-enable submit button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    }, 1000);
  }

  clearAllErrors() {
    const inputs = this.form.querySelectorAll('input');
    inputs.forEach(input => {
      input.classList.remove('error', 'valid');
    });
    
    const errorContainers = this.form.querySelectorAll('.field-error');
    errorContainers.forEach(container => {
      container.style.display = 'none';
    });
  }
}

/**
 * Example HTML Form Structure
 */
const exampleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registration Form</title>
</head>
<body>
    <form id="registrationForm" class="registration-form">
        <div class="form-group">
            <label for="fullName">Full Name *</label>
            <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required>
        </div>
        
        <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" placeholder="Enter your email" required>
        </div>
        
        <div class="form-group">
            <label for="password">Password *</label>
            <input type="password" id="password" name="password" placeholder="Enter your password" required>
        </div>
        
        <div class="form-group">
            <label for="dateOfBirth">Date of Birth *</label>
            <input type="text" id="dateOfBirth" name="dateOfBirth" placeholder="dd-mm-yyyy" required>
        </div>
        
        <div class="form-group">
            <label for="phoneNumber">Phone Number *</label>
            <input type="tel" id="phoneNumber" name="phoneNumber" placeholder="Enter your phone number" required>
        </div>
        
        <div class="form-group">
            <label>
                <input type="checkbox" name="terms" required>
                I agree to the Terms and Conditions *
            </label>
        </div>
        
        <button type="submit" class="submit-btn">Submit</button>
    </form>

    <script>
        // Initialize form validation
        const formValidator = new FormValidationUI('registrationForm');
    </script>
</body>
</html>
`;

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { FormValidator, FormValidationUI };
}

// Make available globally
if (typeof window !== 'undefined') {
  window.FormValidator = FormValidator;
  window.FormValidationUI = FormValidationUI;
}
