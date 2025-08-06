import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';import React, { useState, useEffect, useCallback } from 'react';

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
    full_name: '',
    bio: '',
    github_username: '',
    linkedin_url: ''
  });
  
  // Form validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  const { login, register, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();

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
  }, [isRegistering, clearError]);

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
      const errors = validateRegistrationForm(registerData);
      setValidationErrors(errors);
      
      // Form is valid if all required fields are filled and have no errors
      const requiredFieldsFilled = registerData.username.trim() && 
                                  registerData.email.trim() && 
                                  registerData.password.trim() && 
                                  registerData.full_name.trim();
      
      // Check that there are no validation errors for any field (including optional ones that have content)
      const hasNoErrors = Object.keys(errors).length === 0;
      
      setIsFormValid(requiredFieldsFilled && hasNoErrors);
      
      // Debug logging
      console.log('Form validation check:', {
        requiredFieldsFilled,
        hasNoErrors,
        errors,
        isFormValid: requiredFieldsFilled && hasNoErrors,
        registerData
      });
    }
  }, [registerData, isRegistering, validateRegistrationForm]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Basic login validation
    if (!formData.identifier || !formData.password) {
      setValidationErrors({
        form: 'Please fill in all required fields'
      });
      return;
    }
    
    const result = await login(formData);
    if (result.success) {
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
        !registerData.password.trim() || !registerData.full_name.trim()) {
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
    // Clear form-level errors when user starts typing
    if (validationErrors.form) {
      setValidationErrors({});
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
    container: {
      maxWidth: '400px',
      margin: '50px auto',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'white'
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333'
    },
    formGroup: {
      marginBottom: '15px'
    },
    input: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxSizing: 'border-box'
    },
    inputError: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      border: '2px solid #dc3545',
      borderRadius: '4px',
      boxSizing: 'border-box',
      backgroundColor: '#fff5f5'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      fontSize: '16px',
      cursor: 'pointer',
      borderRadius: '4px',
      marginBottom: '10px'
    },
    buttonDisabled: {
      backgroundColor: '#6c757d',
      cursor: 'not-allowed'
    },
    error: {
      color: '#dc3545',
      textAlign: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      fontSize: '14px'
    },
    fieldError: {
      color: '#dc3545',
      fontSize: '12px',
      marginTop: '4px',
      fontWeight: '500'
    },
    switchText: {
      textAlign: 'center',
      marginTop: '15px'
    },
    link: {
      color: '#007bff',
      cursor: 'pointer',
      textDecoration: 'underline'
    },
    helpText: {
      fontSize: '12px',
      color: '#666',
      marginTop: '5px'
    },
    successText: {
      fontSize: '12px',
      color: '#28a745',
      marginTop: '4px'
    }
  };

  if (!isRegistering) {
    // LOGIN FORM
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>Login to Your Account</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
        
        <form onSubmit={handleLoginSubmit}>
          <div style={styles.formGroup}>
            <input
              type="text"
              name="identifier"
              placeholder="Username or Email"
              value={formData.identifier}
              onChange={handleLoginChange}
              style={styles.input}
              required
            />
            <div style={styles.helpText}>
              You can use either your username or email to login
            </div>
          </div>
          
          <div style={styles.formGroup}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleLoginChange}
              style={styles.input}
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div style={styles.switchText}>
          Don't have an account?{' '}
          <span 
            style={styles.link}
            onClick={() => setIsRegistering(true)}
          >
            Create one here
          </span>
        </div>
      </div>
    );
  }

  // REGISTRATION FORM - FIXED WITH PROPER VALIDATION
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Create New Account</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      {validationErrors.form && <div style={styles.error}>{validationErrors.form}</div>}
      
      <form onSubmit={handleRegisterSubmit}>
        <div style={styles.formGroup}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={registerData.username}
            onChange={handleRegisterChange}
            style={validationErrors.username ? styles.inputError : styles.input}
            required
          />
          {validationErrors.username && (
            <div style={styles.fieldError}>{validationErrors.username}</div>
          )}
          {!validationErrors.username && registerData.username && (
            <div style={styles.successText}>✓ Username looks good</div>
          )}
          <div style={styles.helpText}>
            3-50 characters, letters, numbers, and underscores only
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={registerData.email}
            onChange={handleRegisterChange}
            style={validationErrors.email ? styles.inputError : styles.input}
            required
          />
          {validationErrors.email && (
            <div style={styles.fieldError}>{validationErrors.email}</div>
          )}
          {!validationErrors.email && registerData.email && (
            <div style={styles.successText}>✓ Email format is valid</div>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={registerData.full_name}
            onChange={handleRegisterChange}
            style={validationErrors.full_name ? styles.inputError : styles.input}
            required
          />
          {validationErrors.full_name && (
            <div style={styles.fieldError}>{validationErrors.full_name}</div>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={registerData.password}
            onChange={handleRegisterChange}
            style={validationErrors.password ? styles.inputError : styles.input}
            required
            minLength="8"
          />
          {validationErrors.password && (
            <div style={styles.fieldError}>{validationErrors.password}</div>
          )}
          {!validationErrors.password && registerData.password && (
            <div style={styles.successText}>✓ Password meets requirements</div>
          )}
          <div style={styles.helpText}>
            At least 8 characters with uppercase, lowercase, and number
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="text"
            name="bio"
            placeholder="Short Bio (Optional)"
            value={registerData.bio}
            onChange={handleRegisterChange}
            style={styles.input}
          />
          <div style={styles.helpText}>
            Tell us a bit about yourself (optional)
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="text"
            name="github_username"
            placeholder="GitHub Username (Optional)"
            value={registerData.github_username}
            onChange={handleRegisterChange}
            style={validationErrors.github_username ? styles.inputError : styles.input}
          />
          {validationErrors.github_username && (
            <div style={styles.fieldError}>{validationErrors.github_username}</div>
          )}
          {!validationErrors.github_username && registerData.github_username && registerData.github_username.trim() && (
            <div style={styles.successText}>✓ GitHub username looks good</div>
          )}
          <div style={styles.helpText}>
            Your GitHub username (optional)
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <input
            type="url"
            name="linkedin_url"
            placeholder="LinkedIn URL (Optional)"
            value={registerData.linkedin_url}
            onChange={handleRegisterChange}
            style={validationErrors.linkedin_url ? styles.inputError : styles.input}
          />
          {validationErrors.linkedin_url && (
            <div style={styles.fieldError}>{validationErrors.linkedin_url}</div>
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
          style={{
            ...styles.button,
            ...(loading || !isFormValid ? styles.buttonDisabled : {}),
            opacity: loading || !isFormValid ? 0.6 : 1
          }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
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
          onClick={() => setIsRegistering(false)}
        >
          Login here
        </span>
      </div>
    </div>
  );
}

export default Login;