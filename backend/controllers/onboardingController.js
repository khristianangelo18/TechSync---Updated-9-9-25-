// backend/controllers/onboardingController.js - COMPLETE
const supabase = require('../config/supabase');

// Get all active programming languages
const getProgrammingLanguages = async (req, res) => {
  try {
    console.log('Getting programming languages...');
    
    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching programming languages:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programming languages',
        error: error.message
      });
    }

    console.log(`Found ${languages?.length || 0} programming languages`);

    res.json({
      success: true,
      data: languages || []
    });

  } catch (error) {
    console.error('Get programming languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all active topics
const getTopics = async (req, res) => {
  try {
    console.log('Getting topics...');
    
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, name, description, category')
      .eq('is_active', true)
      .order('category, name');

    if (error) {
      console.error('Error fetching topics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch topics',
        error: error.message
      });
    }

    console.log(`Found ${topics?.length || 0} topics`);

    res.json({
      success: true,
      data: topics || []
    });

  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Save user's programming languages during onboarding
const saveUserLanguages = async (req, res) => {
  try {
    const { languages } = req.body; // Array of { language_id, proficiency_level, years_experience }
    const userId = req.user.id;

    console.log('Saving user languages for user:', userId);
    console.log('Languages data:', languages);

    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Languages array is required'
      });
    }

    // First, delete existing user languages (in case of re-onboarding)
    const { error: deleteError } = await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing languages:', deleteError);
    }

    // Insert new languages
    const languageData = languages.map(lang => ({
      user_id: userId,
      language_id: lang.language_id, // FIXED: using correct column name
      proficiency_level: lang.proficiency_level || 'beginner',
      years_experience: lang.years_experience || 0,
      created_at: new Date().toISOString()
    }));

    console.log('Inserting language data:', languageData);

    const { data: savedLanguages, error: insertError } = await supabase
      .from('user_programming_languages')
      .insert(languageData)
      .select(`
        *,
        programming_languages (id, name)
      `);

    if (insertError) {
      console.error('Error saving languages:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save programming languages',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Programming languages saved successfully',
      data: savedLanguages
    });

  } catch (error) {
    console.error('Save user languages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Save user's topics during onboarding
const saveUserTopics = async (req, res) => {
  try {
    const { topics } = req.body; // Array of { topic_id, interest_level, experience_level }
    const userId = req.user.id;

    console.log('Saving user topics for user:', userId);
    console.log('Topics data:', topics);

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Topics array is required'
      });
    }

    // First, delete existing user topics (in case of re-onboarding)
    const { error: deleteError } = await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting existing topics:', deleteError);
    }

    // Insert new topics
    const topicData = topics.map(topic => ({
      user_id: userId,
      topic_id: topic.topic_id,
      interest_level: topic.interest_level || 'medium',
      experience_level: topic.experience_level || 'beginner',
      created_at: new Date().toISOString()
    }));

    console.log('Inserting topic data:', topicData);

    const { data: savedTopics, error: insertError } = await supabase
      .from('user_topics')
      .insert(topicData)
      .select(`
        *,
        topics (id, name, category)
      `);

    if (insertError) {
      console.error('Error saving topics:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save topics',
        error: insertError.message
      });
    }

    res.json({
      success: true,
      message: 'Topics saved successfully',
      data: savedTopics
    });

  } catch (error) {
    console.error('Save user topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete onboarding - mark user as onboarded
const completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Completing onboarding for user:', userId);

    // Update user profile to mark onboarding as complete
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({
        updated_at: new Date().toISOString()
        // You might want to add an 'is_onboarded' field to track this
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error completing onboarding:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to complete onboarding',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's current onboarding data
const getUserOnboardingData = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('Getting onboarding data for user:', userId);

    // Get user's programming languages
    const { data: languages, error: langError } = await supabase
      .from('user_programming_languages')
      .select(`
        *,
        programming_languages (id, name)
      `)
      .eq('user_id', userId);

    if (langError) {
      console.error('Error fetching user languages:', langError);
    }

    // Get user's topics
    const { data: topics, error: topicError } = await supabase
      .from('user_topics')
      .select(`
        *,
        topics (id, name, category)
      `)
      .eq('user_id', userId);

    if (topicError) {
      console.error('Error fetching user topics:', topicError);
    }

    res.json({
      success: true,
      data: {
        languages: languages || [],
        topics: topics || []
      }
    });

  } catch (error) {
    console.error('Get user onboarding data error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProgrammingLanguages,
  getTopics,
  saveUserLanguages,
  saveUserTopics,
  completeOnboarding,
  getUserOnboardingData
};