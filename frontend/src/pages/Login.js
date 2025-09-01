import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Home } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // This can be username or email
    password: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: ''
  });
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Password error state
  const [passwordError, setPasswordError] = useState('');

  const { login, register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

  // Check URL parameters to determine if we should show signup form
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'signup') {
      setIsRegistering(true);
      window.scrollTo(0, 0);;
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when switching between login/register
  useEffect(() => {
    clearError();
    setValidationErrors({});
    setPasswordError('');
  }, [isRegistering, clearError]);

  // Check for password errors from auth context
  useEffect(() => {
    if (error && !isRegistering) {
      // Check if the error is specifically about incorrect password/credentials
      if (error.toLowerCase().includes('password') ||
          error.toLowerCase().includes('incorrect') ||
          error.toLowerCase().includes('invalid credentials') ||
          error.toLowerCase().includes('authentication failed') ||
          error.toLowerCase().includes('unauthorized') ||
          error.toLowerCase().includes('login failed')) {
        setPasswordError('Incorrect username or password. Please try again.');
        clearError(); // Clear the general error since we're showing password-specific error
      }
    }
  }, [error, isRegistering, clearError]);

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.length < 3 || username.length > 50) {
      return 'Username must be between 3-50 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return null;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return null;
  };

  const validateFullName = (fullName) => {
    if (!fullName) return 'Full name is required';
    if (fullName.length < 2) return 'Full name must be at least 2 characters';
    return null;
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return null; // Optional field
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
    if (!linkedinRegex.test(url)) {
      return 'Please enter a valid LinkedIn profile URL';
    }
    return null;
  };

  const validateGitHubUsername = (username) => {
    if (!username) return null; // Optional field
    if (!/^[a-zA-Z0-9-_]+$/.test(username)) {
      return 'GitHub username can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  };

  // Real-time validation for registration form using useCallback to prevent dependency issues
  const validateRegistrationForm = useCallback((data) => {
    const errors = {};
    
    const usernameError = validateUsername(data.username);
    if (usernameError) errors.username = usernameError;

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(data.password, data.confirmPassword);
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    const fullNameError = validateFullName(data.full_name);
    if (fullNameError) errors.full_name = fullNameError;

    // Optional fields validation - only validate if user entered something
    if (data.github_username && data.github_username.trim()) {
      const githubError = validateGitHubUsername(data.github_username);
      if (githubError) errors.github_username = githubError;
    }

    if (data.linkedin_url && data.linkedin_url.trim()) {
      const linkedinError = validateLinkedInUrl(data.linkedin_url);
      if (linkedinError) errors.linkedin_url = linkedinError;
    }

    return errors;
  }, []); // Empty dependency array since validation functions don't change

  // Update validation when registration data changes
  useEffect(() => {
    if (isRegistering) {
      // Only validate fields that have been touched/filled
      const touchedFields = {};
      Object.keys(registerData).forEach(key => {
        if (registerData[key] && registerData[key].trim()) {
          touchedFields[key] = registerData[key];
        }
      });

      const errors = validateRegistrationForm(touchedFields);
      
      // Only show errors for fields that have content or have been touched
      const filteredErrors = {};
      Object.keys(errors).forEach(key => {
        if (registerData[key] && registerData[key].trim()) {
          filteredErrors[key] = errors[key];
        }
      });
      
      setValidationErrors(filteredErrors);
      
      // Form is valid if all required fields are filled and have no errors
      const requiredFieldsFilled = registerData.username.trim() && 
                                  registerData.email.trim() && 
                                  registerData.password.trim() && 
                                  registerData.confirmPassword.trim() && 
                                  registerData.full_name.trim();
      
      // Check that there are no validation errors for any field (including optional ones that have content)
      const hasNoErrors = Object.keys(filteredErrors).length === 0;
      
      setIsFormValid(requiredFieldsFilled && hasNoErrors);
      
      // Debug logging
      console.log('Form validation check:', {
        requiredFieldsFilled,
        hasNoErrors,
        errors: filteredErrors,
        isFormValid: requiredFieldsFilled && hasNoErrors,
        registerData
      });
    }
  }, [registerData, isRegistering, validateRegistrationForm]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous password error
    setPasswordError('');
    
    // Basic login validation
    if (!formData.identifier || !formData.password) {
      setValidationErrors({
        form: 'Please fill in all required fields'
      });
      return;
    }
    
    const result = await login(formData);
    if (result && result.success) {
      // Check if user needs onboarding
      if (result.data?.user?.needsOnboarding) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission attempted:', { registerData, isFormValid, validationErrors });
    
    // Validate form before submission
    const errors = validateRegistrationForm(registerData);
    if (Object.keys(errors).length > 0) {
      console.log('Form validation failed:', errors);
      setValidationErrors(errors);
      return;
    }

    // Check required fields
    if (!registerData.username.trim() || !registerData.email.trim() || 
        !registerData.password.trim() || !registerData.confirmPassword.trim() || !registerData.full_name.trim()) {
      console.log('Required fields missing');
      setValidationErrors({
        form: 'Please fill in all required fields'
      });
      return;
    }

    // Clear validation errors
    setValidationErrors({});
    
    console.log('Attempting registration with:', {
      ...registerData,
      password: '[HIDDEN]' // Don't log the actual password
    });
    
    try {
      const result = await register(registerData);
      console.log('Registration result:', result);
      
      if (result && result.success) {
        console.log('Registration successful, navigating to onboarding');
        // New users always need onboarding
        navigate('/onboarding');
      } else {
        console.log('Registration failed:', result);
        console.log('Backend validation errors:', result?.errors);
        
        // If backend returns specific field errors, show them
        if (result?.errors && Array.isArray(result.errors)) {
          const fieldErrors = {};
          result.errors.forEach(err => {
            if (err.path) {
              fieldErrors[err.path] = err.msg;
            }
          });
          setValidationErrors(fieldErrors);
        } else {
          // Show general error message
          setValidationErrors({
            form: result?.message || 'Registration failed. Please try again.'
          });
        }
      }
    } catch (err) {
      console.error('Registration error caught:', err);
      console.error('Error response:', err?.response?.data);
      
      // Stay on registration form and show error
      setValidationErrors({
        form: err?.response?.data?.message || 'Registration failed. Please try again.'
      });
    }
  };

  const handleLoginChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear form-level errors and password errors when user starts typing
    if (validationErrors.form) {
      setValidationErrors({});
    }
    if (passwordError && e.target.name === 'password') {
      setPasswordError('');
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    },
    backgroundLayer: {
      position: 'absolute',
      inset: 0,
      zIndex: 1
    },
    figmaBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    backgroundPattern: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      opacity: 0.1
    },
    container: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '380px',
      width: '100%',
      background: 'rgba(26, 28, 32, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: isRegistering ? '1.5rem 1.75rem' : '2.5rem 2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: isRegistering ? '1rem' : '1.5rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      padding: '0.5rem',
      borderRadius: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
      borderRadius: '10px',
      transform: 'rotate(45deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'transform 0.3s ease'
    },
    logoInner: {
      width: '20px',
      height: '20px',
      background: 'white',
      borderRadius: '3px',
      transform: 'rotate(-45deg)'
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      letterSpacing: '-0.025em',
      color: 'white'
    },
    title: {
      textAlign: 'center',
      marginBottom: isRegistering ? '1rem' : '2rem',
      fontSize: '1.5rem',
      fontWeight: '600',
      color: 'white',
      letterSpacing: '-0.025em'
    },
    formGroup: {
      marginBottom: isRegistering ? '0.75rem' : '1.25rem'
    },
    label: {
      display: 'block',
      marginBottom: '0.4rem',
      color: '#e5e7eb',
      fontSize: '13px',
      fontWeight: '500',
      letterSpacing: '0.025em'
    },
    input: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(55, 65, 81, 0.5)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    inputFocused: {
      outline: 'none',
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      background: 'rgba(55, 65, 81, 0.7)'
    },
    inputError: {
      width: '100%',
      padding: '0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(185, 28, 28, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1.5rem',
      background: 'linear-gradient(to right, #1f2937, #111827)',
      color: 'white',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      borderRadius: '10px',
      marginBottom: '1rem',
      transition: 'all 0.3s ease',
      letterSpacing: '0.025em'
    },
    buttonHover: {
      background: 'linear-gradient(to right, #374151, #1f2937)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
    },
    buttonDisabled: {
      background: 'rgba(107, 114, 128, 0.5)',
      cursor: 'not-allowed',
      opacity: 0.6
    },
    error: {
      color: '#ef4444',
      textAlign: 'center',
      marginBottom: '1.25rem',
      padding: '0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '10px',
      fontSize: '13px',
      backdropFilter: 'blur(8px)'
    },
    passwordError: {
      color: '#ef4444',
      textAlign: 'left',
      marginTop: '0.5rem',
      padding: '0.5rem 0.75rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '8px',
      fontSize: '12px',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    fieldError: {
      color: '#f87171',
      fontSize: '11px',
      marginTop: '0.4rem',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    switchText: {
      textAlign: 'center',
      marginTop: isRegistering ? '1.5rem' : '2rem',
      color: '#9ca3af',
      fontSize: '14px'
    },
    link: {
      color: '#60a5fa',
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: '500',
      transition: 'color 0.3s ease'
    },
    linkHover: {
      color: '#93c5fd'
    },
    helpText: {
      fontSize: '11px',
      color: '#9ca3af',
      marginTop: '0.4rem',
      lineHeight: '1.3'
    },
    successText: {
      fontSize: '11px',
      color: '#34d399',
      marginTop: '0.4rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '1.5rem 0',
      color: '#6b7280'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      background: 'rgba(255, 255, 255, 0.1)'
    },
    dividerText: {
      padding: '0 1rem',
      fontSize: '14px'
    },
    passwordContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%',
      padding: '0.875rem 2.5rem 0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(55, 65, 81, 0.5)',
      border: '1px solid rgba(75, 85, 99, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(8px)'
    },
    passwordInputError: {
      width: '100%',
      padding: '0.875rem 2.5rem 0.875rem 1rem',
      fontSize: '15px',
      background: 'rgba(185, 28, 28, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.5)',
      borderRadius: '10px',
      color: 'white',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease'
    },
    eyeToggle: {
      position: 'absolute',
      right: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      color: '#9ca3af',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      transition: 'color 0.3s ease',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  const hoverStyles = `
    .login-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: rgba(55, 65, 81, 0.7) !important;
    }
    
    .password-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      background: rgba(55, 65, 81, 0.7) !important;
    }
    
    .login-button:hover:not(:disabled) {
      background: linear-gradient(to right, #374151, #1f2937) !important;
      transform: translateY(-2px) !important;
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
    }
    
    .switch-link:hover {
      color: #93c5fd !important;
    }
    
    .eye-toggle:hover {
      color: #d1d5db !important;
    }
    
    .logo-section:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      transform: translateY(-2px) !important;
    }
    
    .logo-section:hover .logo-icon {
      transform: rotate(45deg) scale(1.1) !important;
    }
    
    .back-to-home-button:hover {
      background: rgba(15, 17, 22, 1) !important;
      border-color: rgba(59, 130, 246, 0.6) !important;
      color: #ffffff !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
    }
    
    input::placeholder {
      color: #9ca3af;
    }
  `;

  if (!isRegistering) {
    // LOGIN FORM
    return (
      <>
        <style>
          {`
            ${hoverStyles}
            
            /* Force no scroll for login page only */
            body {
              overflow: hidden !important;
            }
          `}
        </style>
        <div style={{
          width: '100vw',
          height: '100svh',
          maxHeight: '100vh',
          backgroundColor: '#0F1116',
          color: 'white',
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0.5rem'
        }}>
        
        {/* Back to Home Button - Outside Container */}
        <div style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 50
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 1.5rem',
              background: 'rgba(15, 17, 22, 0.95)',
              backdropFilter: 'blur(24px)',
              color: '#e5e7eb',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '16px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              letterSpacing: '0.025em'
            }}
            className="back-to-home-button"
          >
            <Home size={18} strokeWidth={2.5} />
            Home
          </button>
        </div>
        
        {/* Background Layer with Code Symbols */}
        <div style={styles.backgroundLayer}>
          <div style={styles.figmaBackground}>
            <div style={{...styles.codeSymbol, left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
            <div style={{...styles.codeSymbol, left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
          </div>
        </div>

        {/* Background Pattern */}
        <svg 
          style={styles.backgroundPattern}
          viewBox="0 0 1440 1024"
          preserveAspectRatio="none"
        >
          <path
            d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
          <path
            d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        </svg>

        <div style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '380px',
          width: '100%',
          background: 'rgba(26, 28, 32, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          maxHeight: 'calc(100vh - 1rem)',
          overflowY: 'auto'
        }}>
          <div 
            style={styles.logoSection}
            className="logo-section"
            onClick={() => navigate('/')}
            title="Go back to TechSync homepage"
          >
            <div style={styles.logoIcon} className="logo-icon">
              <div style={styles.logoInner} />
            </div>
            <span style={styles.logoText}>TechSync</span>
          </div>
          
          <h2 style={{
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '1.5rem',
            fontWeight: '600',
            color: 'white',
            letterSpacing: '-0.025em'
          }}>Sign In with TechSync</h2>
          
          {error && <div style={styles.error}>{error}</div>}
          {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
          
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={styles.label}>Username or Email</label>
              <input
                type="text"
                name="identifier"
                placeholder="Enter your username or email"
                value={formData.identifier}
                onChange={handleLoginChange}
                style={styles.input}
                className="login-input"
                required
              />
              <div style={styles.helpText}>
                You can use either your username or email to login
              </div>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleLoginChange}
                  style={styles.passwordInput}
                  className="password-input"
                  required
                />
                <button
                  type="button"
                  style={styles.eyeToggle}
                  className="eye-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <Eye size={20} />
                  ) : (
                    <EyeOff size={20} />
                  )}
                </button>
              </div>
              {passwordError && (
                <div style={styles.passwordError}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  {passwordError}
                </div>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              className="login-button"
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          
          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            Don't have an account?{' '}
            <span 
              style={styles.link}
              className="switch-link"
              onClick={() => setIsRegistering(true)}
            >
              Create one here
            </span>
          </div>
        </div>
      </div>
      </>
    );
  }

  // REGISTRATION FORM
  return (
    <div style={styles.pageContainer}>
      <style>{hoverStyles}</style>
      
      {/* Back to Home Button - Outside Container */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 50
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(15, 17, 22, 0.95)',
            backdropFilter: 'blur(24px)',
            color: '#e5e7eb',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            letterSpacing: '0.025em'
          }}
          className="back-to-home-button"
        >
          <Home size={18} strokeWidth={2.5} />
          Home
        </button>
      </div>
      
      {/* Background Layer with Code Symbols */}
      <div style={styles.backgroundLayer}>
        <div style={styles.figmaBackground}>
          <div style={{...styles.codeSymbol, left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
        </div>
      </div>

      {/* Background Pattern */}
      <svg 
        style={styles.backgroundPattern}
        viewBox="0 0 1440 1024"
        preserveAspectRatio="none"
      >
        <path
          d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <path
          d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      </svg>

      <div style={styles.container}>
        <div 
          style={styles.logoSection}
          className="logo-section"
          onClick={() => navigate('/')}
          title="Go back to TechSync homepage"
        >
          <div style={styles.logoIcon} className="logo-icon">
            <div style={styles.logoInner} />
          </div>
          <span style={styles.logoText}>TechSync</span>
        </div>
        
        <h2 style={styles.title}>Sign Up with TechSync</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
        
        <form onSubmit={handleRegisterSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={registerData.username}
              onChange={handleRegisterChange}
              style={validationErrors.username ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.username && (
              <div style={styles.fieldError}>⚠️ {validationErrors.username}</div>
            )}
            {!validationErrors.username && registerData.username && (
              <div style={styles.successText}>✓ Username looks good</div>
            )}
            <div style={styles.helpText}>
              3-50 characters, letters, numbers, and underscores only
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter Full Name"
              value={registerData.full_name}
              onChange={handleRegisterChange}
              style={validationErrors.full_name ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.full_name && (
              <div style={styles.fieldError}>⚠️ {validationErrors.full_name}</div>
            )}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={registerData.email}
              onChange={handleRegisterChange}
              style={validationErrors.email ? styles.inputError : styles.input}
              className="login-input"
              required
            />
            {validationErrors.email && (
              <div style={styles.fieldError}>⚠️ {validationErrors.email}</div>
            )}
            {!validationErrors.email && registerData.email && (
              <div style={styles.successText}>✓ Email format is valid</div>
            )}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="password"
                placeholder="Enter password"
                value={registerData.password}
                onChange={handleRegisterChange}
                style={validationErrors.password ? styles.passwordInputError : styles.passwordInput}
                className="password-input"
                required
                minLength="8"
              />
              <button
                type="button"
                style={styles.eyeToggle}
                className="eye-toggle"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              >
                {showRegisterPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <div style={styles.fieldError}>⚠️ {validationErrors.password}</div>
            )}
            {!validationErrors.password && registerData.password && (
              <div style={styles.successText}>✓ Password meets requirements</div>
            )}
            <div style={styles.helpText}>
              At least 8 characters with uppercase, lowercase, and number
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Re-enter Password</label>
            <div style={styles.passwordContainer}>
              <input
                type={showRegisterPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={registerData.confirmPassword}
                onChange={handleRegisterChange}
                style={validationErrors.confirmPassword ? styles.passwordInputError : styles.passwordInput}
                className="password-input"
                required
              />
              <button
                type="button"
                style={styles.eyeToggle}
                className="eye-toggle"
                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
              >
                {showRegisterPassword ? (
                  <Eye size={20} />
                ) : (
                  <EyeOff size={20} />
                )}
              </button>
            </div>
            {validationErrors.confirmPassword && (
              <div style={styles.fieldError}>⚠️ {validationErrors.confirmPassword}</div>
            )}
            {!validationErrors.confirmPassword && registerData.confirmPassword && registerData.password === registerData.confirmPassword && (
              <div style={styles.successText}>✓ Passwords match</div>
            )}
            <div style={styles.helpText}>
              Please re-enter your password to confirm
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Short Bio (Optional)</label>
            <input
              type="text"
              name="bio"
              placeholder="Tell us a bit about yourself"
              value={registerData.bio}
              onChange={handleRegisterChange}
              style={styles.input}
              className="login-input"
            />
            <div style={styles.helpText}>
              Tell us a bit about yourself (optional)
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>GitHub Username (Optional)</label>
            <input
              type="text"
              name="github_username"
              placeholder="Your GitHub username"
              value={registerData.github_username}
              onChange={handleRegisterChange}
              style={validationErrors.github_username ? styles.inputError : styles.input}
              className="login-input"
            />
            {validationErrors.github_username && (
              <div style={styles.fieldError}>⚠️ {validationErrors.github_username}</div>
            )}
            {!validationErrors.github_username && registerData.github_username && registerData.github_username.trim() && (
              <div style={styles.successText}>✓ GitHub username looks good</div>
            )}
            <div style={styles.helpText}>
              Your GitHub username (optional)
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>LinkedIn URL (Optional)</label>
            <input
              type="url"
              name="linkedin_url"
              placeholder="https://linkedin.com/in/your-profile"
              value={registerData.linkedin_url}
              onChange={handleRegisterChange}
              style={validationErrors.linkedin_url ? styles.inputError : styles.input}
              className="login-input"
            />
            {validationErrors.linkedin_url && (
              <div style={styles.fieldError}>⚠️ {validationErrors.linkedin_url}</div>
            )}
            {!validationErrors.linkedin_url && registerData.linkedin_url && registerData.linkedin_url.trim() && (
              <div style={styles.successText}>✓ LinkedIn URL is valid</div>
            )}
            <div style={styles.helpText}>
              e.g., https://linkedin.com/in/your-profile (optional)
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={loading || !isFormValid}
            className="login-button"
            style={{
              ...styles.button,
              ...(loading || !isFormValid ? styles.buttonDisabled : {}),
              opacity: loading || !isFormValid ? 0.6 : 1
            }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          {/* Debug info - remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Debug: Form Valid = {isFormValid ? 'Yes' : 'No'} | 
              Errors = {Object.keys(validationErrors).length} | 
              Loading = {loading ? 'Yes' : 'No'} |
              IsRegistering = {isRegistering ? 'Yes' : 'No'}
            </div>
          )}
        </form>
        
        <div style={styles.switchText}>
          Already have an account?{' '}
          <span 
            style={styles.link}
            className="switch-link"
            onClick={() => setIsRegistering(false)}
          >
            Login here
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;