const supabase = require('../config/supabase');

// Create a new project
const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      detailed_description,
      required_experience_level,
      maximum_members,
      estimated_duration_weeks,
      difficulty_level,
      github_repo_url,
      deadline,
      programming_languages, // Array of language names
      topics // Array of topic names
    } = req.body;

    console.log('Creating project for user:', userId);
    console.log('Project data:', { title, description, required_experience_level });

    // Create the main project record
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{
        owner_id: userId,
        title,
        description,
        detailed_description,
        required_experience_level,
        maximum_members: parseInt(maximum_members) || null,
        estimated_duration_weeks: parseInt(estimated_duration_weeks) || null,
        difficulty_level,
        github_repo_url: github_repo_url || null,
        deadline: deadline || null,
        status: 'recruiting',
        current_members: 1
      }])
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: projectError.message
      });
    }

    console.log('Project created successfully:', project.id);

    // Add the creator as the first project member
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{
        project_id: project.id,
        user_id: userId,
        role: 'owner',
        status: 'active'
      }]);

    if (memberError) {
      console.error('Error adding project member:', memberError);
      // Don't return error here as project is already created
    }

    // Handle programming languages
    if (programming_languages && programming_languages.length > 0) {
      for (let i = 0; i < programming_languages.length; i++) {
        const langName = programming_languages[i];
        
        // Find or create the programming language
        let { data: language } = await supabase
          .from('programming_languages')
          .select('id')
          .eq('name', langName)
          .single();

        if (!language) {
          // Create new language if it doesn't exist
          const { data: newLanguage, error: langError } = await supabase
            .from('programming_languages')
            .insert([{
              name: langName,
              is_predefined: false,
              created_by: userId
            }])
            .select('id')
            .single();

          if (langError) {
            console.error('Error creating language:', langError);
            continue;
          }
          language = newLanguage;
        }

        // Link language to project
        await supabase
          .from('project_languages')
          .insert([{
            project_id: project.id,
            language_id: language.id,
            required_level: required_experience_level,
            is_primary: i === 0 // First language is primary
          }]);
      }
    }

    // Handle topics
    if (topics && topics.length > 0) {
      for (let i = 0; i < topics.length; i++) {
        const topicName = topics[i];
        
        // Find or create the topic
        let { data: topic } = await supabase
          .from('topics')
          .select('id')
          .eq('name', topicName)
          .single();

        if (!topic) {
          // Create new topic if it doesn't exist
          const { data: newTopic, error: topicError } = await supabase
            .from('topics')
            .insert([{
              name: topicName,
              is_predefined: false,
              created_by: userId
            }])
            .select('id')
            .single();

          if (topicError) {
            console.error('Error creating topic:', topicError);
            continue;
          }
          topic = newTopic;
        }

        // Link topic to project
        await supabase
          .from('project_topics')
          .insert([{
            project_id: project.id,
            topic_id: topic.id,
            is_primary: i === 0 // First topic is primary
          }]);
      }
    }

    // Create default chat room for the project
    const { error: roomError } = await supabase
      .from('chat_rooms')
      .insert([{
        project_id: project.id,
        name: 'General',
        description: 'General discussion for the project',
        created_by: userId,
        room_type: 'general'
      }]);

    if (roomError) {
      console.error('Error creating chat room:', roomError);
      // Don't return error as project is created successfully
    }

    // Log user activity
    await supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        project_id: project.id,
        activity_type: 'project_created',
        activity_data: {
          project_title: title,
          project_id: project.id
        }
      }]);

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: {
          ...project,
          programming_languages: programming_languages || [],
          topics: topics || []
        }
      }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all projects (with pagination and filters)
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'recruiting',
      difficulty_level,
      required_experience_level,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('projects')
      .select(`
        *,
        users:owner_id (
          id,
          username,
          full_name,
          avatar_url
        ),
        project_languages (
          programming_languages (
            id,
            name
          ),
          required_level,
          is_primary
        ),
        project_topics (
          topics (
            id,
            name,
            category
          ),
          is_primary
        )
      `)
      .eq('status', status)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (difficulty_level) {
      query = query.eq('difficulty_level', difficulty_level);
    }

    if (required_experience_level) {
      query = query.eq('required_experience_level', required_experience_level);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: projects, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch projects',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: projects.length
        }
      }
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        users:owner_id (
          id,
          username,
          full_name,
          avatar_url,
          years_experience
        ),
        project_languages (
          programming_languages (
            id,
            name,
            description
          ),
          required_level,
          is_primary
        ),
        project_topics (
          topics (
            id,
            name,
            category,
            description
          ),
          is_primary
        ),
        project_members (
          users (
            id,
            username,
            full_name,
            avatar_url
          ),
          role,
          status,
          joined_at,
          contribution_score
        )
      `)
      .eq('id', id)
      .single();

    if (error || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's projects
const getUserProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role = 'all' } = req.query; // 'owner', 'member', or 'all'

    let query = supabase
      .from('project_members')
      .select(`
        project_id,
        role,
        status,
        joined_at,
        projects (
          *,
          users:owner_id (
            id,
            username,
            full_name
          ),
          project_languages (
            programming_languages (name),
            is_primary
          ),
          project_topics (
            topics (name),
            is_primary
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (role !== 'all') {
      query = query.eq('role', role);
    }

    const { data: memberProjects, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user projects',
        error: error.message
      });
    }

    const projects = memberProjects.map(mp => ({
      ...mp.projects,
      user_role: mp.role,
      joined_at: mp.joined_at
    }));

    res.json({
      success: true,
      data: { projects }
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  getUserProjects
};