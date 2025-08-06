// backend/controllers/challengeController.js
const supabase = require('../config/supabase');

// Create new coding challenge
const createChallenge = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      project_id,
      title,
      description,
      difficulty_level,
      time_limit_minutes,
      test_cases,
      starter_code,
      expected_solution,
      programming_language_id
    } = req.body;

    // Validate required fields
    if (!title || !description || !programming_language_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and programming language are required'
      });
    }

    // Parse test_cases if it's a string
    let parsedTestCases;
    try {
      parsedTestCases = typeof test_cases === 'string' ? JSON.parse(test_cases) : test_cases;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test cases format. Must be valid JSON.'
      });
    }

    // Create the challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .insert({
        project_id: project_id || null,
        title,
        description,
        difficulty_level: difficulty_level || 'easy',
        time_limit_minutes: time_limit_minutes || 30,
        test_cases: parsedTestCases,
        starter_code: starter_code || '',
        expected_solution: expected_solution || '',
        programming_language_id: parseInt(programming_language_id),
        created_by: userId,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (challengeError) {
      console.error('Error creating challenge:', challengeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create challenge',
        error: challengeError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: { challenge }
    });

  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all challenges with filters
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      difficulty_level,
      programming_language_id,
      created_by,
      project_id,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name),
        projects (id, title)
      `)
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }

    if (programming_language_id) {
      query = query.eq('programming_language_id', programming_language_id);
    }

    if (created_by) {
      query = query.eq('created_by', created_by);
    }

    if (project_id) {
      if (project_id === 'null') {
        query = query.is('project_id', null);
      } else {
        query = query.eq('project_id', project_id);
      }
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: challenges, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch challenges',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        challenges,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: challenges.length
        }
      }
    });

  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get challenge by ID
const getChallengeById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: challenge, error } = await supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name, description),
        users:created_by (id, username, full_name, avatar_url),
        projects (id, title, description)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    res.json({
      success: true,
      data: { challenge }
    });

  } catch (error) {
    console.error('Get challenge by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update challenge (only by creator or admin)
const updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if challenge exists and user is the creator
    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (existingChallenge.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own challenges'
      });
    }

    // Parse test_cases if provided
    if (updateData.test_cases) {
      try {
        updateData.test_cases = typeof updateData.test_cases === 'string' 
          ? JSON.parse(updateData.test_cases) 
          : updateData.test_cases;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid test cases format'
        });
      }
    }

    // Update the challenge
    const { data: challenge, error: updateError } = await supabase
      .from('coding_challenges')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name)
      `)
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update challenge',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Challenge updated successfully',
      data: { challenge }
    });

  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete challenge (only by creator or admin)
const deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if challenge exists and user is the creator
    const { data: existingChallenge, error: findError } = await supabase
      .from('coding_challenges')
      .select('id, created_by, title')
      .eq('id', id)
      .single();

    if (findError || !existingChallenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (existingChallenge.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own challenges'
      });
    }

    // Soft delete - set is_active to false
    const { error: deleteError } = await supabase
      .from('coding_challenges')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (deleteError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete challenge',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: `Challenge "${existingChallenge.title}" has been deleted successfully`
    });

  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get challenges for a specific programming language (for project joining)
const getChallengesByLanguage = async (req, res) => {
  try {
    const { languageId } = req.params;
    const { difficulty_level, project_id } = req.query;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name)
      `)
      .eq('programming_language_id', languageId)
      .eq('is_active', true);

    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }

    // For project joining, prefer general challenges (project_id is null)
    if (project_id) {
      query = query.or(`project_id.is.null,project_id.eq.${project_id}`);
    } else {
      query = query.is('project_id', null);
    }

    const { data: challenges, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch challenges',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: { challenges }
    });

  } catch (error) {
    console.error('Get challenges by language error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage
};