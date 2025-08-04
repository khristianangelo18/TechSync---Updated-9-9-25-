const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register user - SIMPLIFIED (removed years_experience)
const register = async (req, res) => {
  try {
    const { password, ...safeRequestData } = req.body;
    console.log('Registration request received for user:', safeRequestData.username || safeRequestData.email);
    
    const { username, email, full_name, bio, github_username, linkedin_url } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`username.eq.${username},email.eq.${email}`)
      .single();

    if (existingUser) {
      console.log('User already exists:', username);
      return res.status(400).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully for user:', username);

    // Create user in database - REMOVED years_experience, set default to 0
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        username,
        email,
        password_hash,
        full_name,
        bio: bio || null,
        github_username: github_username || null,
        linkedin_url: linkedin_url || null,
        years_experience: 0 // Default value, will be set during onboarding
      }])
      .select('id, username, email, full_name, bio, github_username, linkedin_url, years_experience, created_at')
      .single();

    if (error) {
      console.error('Database error during registration:', error);
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

// Login user
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log('Login attempt for user:', identifier);
    
    // Find user by username or email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq.${identifier},email.eq.${identifier}`)
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

    // Get user's programming languages
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

// Get user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user basic info
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

    // Get user's programming languages
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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
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

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
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