const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Validation functions
const validateRegistrationData = (data) => {
  const errors = {};
  const { username, email, password, full_name, github_username, linkedin_url } = data;

  // Username validation
  if (!username) {
    errors.username = 'Username is required';
  } else if (username.length < 3 || username.length > 50) {
    errors.username = 'Username must be between 3-50 characters';
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.username = 'Username can only contain letters, numbers, and underscores';
  }

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  // Full name validation
  if (!full_name) {
    errors.full_name = 'Full name is required';
  } else if (full_name.length < 2) {
    errors.full_name = 'Full name must be at least 2 characters';
  }

  // Optional fields validation
  if (github_username && !/^[a-zA-Z0-9-_]+$/.test(github_username)) {
    errors.github_username = 'GitHub username can only contain letters, numbers, hyphens, and underscores';
  }

  if (linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/.test(linkedin_url)) {
    errors.linkedin_url = 'Please enter a valid LinkedIn profile URL';
  }

  return errors;
};

// Register user - IMPROVED based on your existing structure
const register = async (req, res) => {
  try {
    const { password, ...safeRequestData } = req.body;
    console.log('Registration request received for user:', safeRequestData.username || safeRequestData.email);
    
    // Validate input data
    const validationErrors = validateRegistrationData(req.body);
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    const { username, email, full_name, bio, github_username, linkedin_url } = req.body;

    // Check if user already exists - use your existing method
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, username, email')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      console.log('User already exists:', username);
      
      // Provide specific error message
      if (existingUser.username === username && existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'An account with this username and email already exists'
        });
      } else if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken'
        });
      } else if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully for user:', username);

    // Create user in database - use your existing structure
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password_hash,
        full_name: full_name.trim(),
        bio: bio ? bio.trim() : null,
        github_username: github_username ? github_username.trim() : null,
        linkedin_url: linkedin_url ? linkedin_url.trim() : null,
        years_experience: 0 // Default value, will be set during onboarding
      }])
      .select('id, username, email, full_name, bio, github_username, linkedin_url, years_experience, created_at')
      .single();

    if (error) {
      console.error('Database error during registration:', error);
      
      // Handle specific database errors
      if (error.code === '23505') { // Unique constraint violation
        if (error.message.includes('username')) {
          return res.status(400).json({
            success: false,
            message: 'This username is already taken'
          });
        } else if (error.message.includes('email')) {
          return res.status(400).json({
            success: false,
            message: 'An account with this email already exists'
          });
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: error.message
      });
    }

    console.log('User created successfully:', user.username);

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          ...user,
          needsOnboarding: true // Flag to indicate user needs onboarding
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Login user - IMPROVED to match your table structure
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Input validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    console.log('Login attempt for user:', identifier);
    
    // Find user by username or email - match your existing method
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier.trim()},email.eq.${identifier.toLowerCase().trim()}`)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.log('Login failed: User not found or inactive for identifier:', identifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for user:', identifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User authenticated successfully:', user.username);

    // Get user's programming languages - match your existing table name
    const { data: userLanguages } = await supabase
      .from('user_programming_languages')
      .select(`
        id,
        proficiency_level,
        years_experience,
        programming_languages (id, name, description)
      `)
      .eq('user_id', user.id);

    // Get user's topics
    const { data: userTopics } = await supabase
      .from('user_topics')
      .select(`
        id,
        interest_level,
        experience_level,
        topics (id, name, description, category)
      `)
      .eq('user_id', user.id);

    // Check if user has completed onboarding by checking if they have any programming languages
    const needsOnboarding = !userLanguages || userLanguages.length === 0;

    // Generate JWT token
    const token = generateToken(user.id);

    // Remove password_hash from response
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          ...userWithoutPassword,
          needsOnboarding,
          programming_languages: userLanguages || [],
          topics: userTopics || []
        },
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user profile - updated to match your existing structure
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to match your JWT structure
    
    // Get user basic info - match your existing method
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, full_name, bio, github_username, linkedin_url, years_experience, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's programming languages - match your table name
    const { data: languages } = await supabase
      .from('user_programming_languages')
      .select(`
        id,
        proficiency_level,
        years_experience,
        programming_languages (id, name, description)
      `)
      .eq('user_id', userId);

    // Get user's topics
    const { data: topics } = await supabase
      .from('user_topics')
      .select(`
        id,
        interest_level,
        experience_level,
        topics (id, name, description, category)
      `)
      .eq('user_id', userId);

    const needsOnboarding = !languages || languages.length === 0;

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          needsOnboarding,
          programming_languages: languages || [],
          topics: topics || []
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user profile - match your existing structure
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed to match your JWT structure
    const { full_name, bio, github_username, linkedin_url, years_experience } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name,
        bio,
        github_username,
        linkedin_url,
        years_experience,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, username, email, full_name, bio, github_username, linkedin_url, years_experience, created_at, updated_at')
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Change password - match your existing structure  
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId; // Changed to match your JWT structure
    const { currentPassword, newPassword } = req.body;

    // Get user's current password hash
    const { data: user, error: getUserError } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (getUserError || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};