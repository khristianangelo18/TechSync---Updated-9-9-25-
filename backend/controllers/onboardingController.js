const supabase = require('../config/supabase');

// Get all active programming languages
const getProgrammingLanguages = async (req, res) => {
  try {
    const { data: languages, error } = await supabase
      .from('programming_languages')
      .select('id, name, description')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch programming languages',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: languages
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
    const { data: topics, error } = await supabase
      .from('topics')
      .select('id, name, description, category')
      .eq('is_active', true)
      .order('category, name');

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch topics',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: topics
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

    // First, delete existing user languages (in case of re-onboarding)
    await supabase
      .from('user_programming_languages')
      .delete()
      .eq('user_id', userId);

    // Insert new languages
    const languageData = languages.map(lang => ({
      user_id: userId,
      language_id: lang.language_id,
      proficiency_level: lang.proficiency_level,
      years_experience: lang.years_experience || 0
    }));

    const { error } = await supabase
      .from('user_programming_languages')
      .insert(languageData);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save programming languages',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Programming languages saved successfully'
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

    // First, delete existing user topics (in case of re-onboarding)
    await supabase
      .from('user_topics')
      .delete()
      .eq('user_id', userId);

    // Insert new topics
    const topicData = topics.map(topic => ({
      user_id: userId,
      topic_id: topic.topic_id,
      interest_level: topic.interest_level,
      experience_level: topic.experience_level
    }));

    const { error } = await supabase
      .from('user_topics')
      .insert(topicData);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save topics',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Topics saved successfully'
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

// Update user's years of experience
const updateUserExperience = async (req, res) => {
  try {
    const { years_experience } = req.body;
    const userId = req.user.id;

    const { error } = await supabase
      .from('users')
      .update({ years_experience })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update years of experience',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Years of experience updated successfully'
    });

  } catch (error) {
    console.error('Update user experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Complete onboarding process
const completeOnboarding = async (req, res) => {
  try {
    const { languages, topics, years_experience } = req.body;
    const userId = req.user.id;

    // Start a transaction-like operation
    const updates = [];

    // Update user's years of experience
    updates.push(
      supabase
        .from('users')
        .update({ years_experience })
        .eq('id', userId)
    );

    // Delete existing data
    updates.push(
      supabase
        .from('user_programming_languages')
        .delete()
        .eq('user_id', userId)
    );

    updates.push(
      supabase
        .from('user_topics')
        .delete()
        .eq('user_id', userId)
    );

    // Wait for deletions to complete
    await Promise.all(updates);

    // Insert new programming languages
    if (languages && languages.length > 0) {
      const languageData = languages.map(lang => ({
        user_id: userId,
        language_id: lang.language_id,
        proficiency_level: lang.proficiency_level,
        years_experience: lang.years_experience || 0
      }));

      const { error: langError } = await supabase
        .from('user_programming_languages')
        .insert(languageData);

      if (langError) {
        throw langError;
      }
    }

    // Insert new topics
    if (topics && topics.length > 0) {
      const topicData = topics.map(topic => ({
        user_id: userId,
        topic_id: topic.topic_id,
        interest_level: topic.interest_level,
        experience_level: topic.experience_level
      }));

      const { error: topicError } = await supabase
        .from('user_topics')
        .insert(topicData);

      if (topicError) {
        throw topicError;
      }
    }

    // Get updated user profile with languages and topics
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username, email, full_name, bio, github_username, linkedin_url, years_experience, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (userError) {
      throw userError;
    }

    // Get user's programming languages
    const { data: userLanguages } = await supabase
      .from('user_programming_languages')
      .select(`
        id,
        proficiency_level,
        years_experience,
        programming_languages (id, name, description)
      `)
      .eq('user_id', userId);

    // Get user's topics
    const { data: userTopics } = await supabase
      .from('user_topics')
      .select(`
        id,
        interest_level,
        experience_level,
        topics (id, name, description, category)
      `)
      .eq('user_id', userId);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        user: {
          ...user,
          needsOnboarding: false,
          programming_languages: userLanguages || [],
          topics: userTopics || []
        }
      }
    });

  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
};

module.exports = {
  getProgrammingLanguages,
  getTopics,
  saveUserLanguages,
  saveUserTopics,
  updateUserExperience,
  completeOnboarding
};