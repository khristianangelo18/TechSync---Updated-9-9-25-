// backend/controllers/projectController.js
const supabase = require('../config/supabase');

// Create new project
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
      programming_languages = [],
      topics = []
    } = req.body;

    // Create the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        detailed_description,
        required_experience_level,
        maximum_members: maximum_members || 10,
        estimated_duration_weeks,
        difficulty_level,
        github_repo_url,
        deadline,
        owner_id: userId,
        status: 'recruiting',
        current_members: 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: projectError.message
      });
    }

    // Add owner as a member
    const { error: memberError } = await supabase
      .from('project_members')
      .insert({
        project_id: project.id,
        user_id: userId,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString()
      });

    if (memberError) {
      console.error('Error adding owner as member:', memberError);
    }

    // Handle programming languages
    if (programming_languages && programming_languages.length > 0) {
      for (const langName of programming_languages) {
        // Get or create programming language
        let { data: language } = await supabase
          .from('programming_languages')
          .select('id')
          .eq('name', langName)
          .single();

        if (!language) {
          const { data: newLang, error: langError } = await supabase
            .from('programming_languages')
            .insert({ name: langName, is_active: true })
            .select()
            .single();

          if (langError) {
            console.error('Error creating programming language:', langError);
            continue;
          }
          language = newLang;
        }

        // Link to project
        await supabase
          .from('project_languages')
          .insert({
            project_id: project.id,
            programming_language_id: language.id,
            required_level: 'beginner',
            is_primary: true
          });
      }
    }

    // Handle topics
    if (topics && topics.length > 0) {
      for (const topicName of topics) {
        // Get or create topic
        let { data: topic } = await supabase
          .from('topics')
          .select('id')
          .eq('name', topicName)
          .single();

        if (!topic) {
          const { data: newTopic, error: topicError } = await supabase
            .from('topics')
            .insert({ 
              name: topicName, 
              category: 'general',
              is_active: true 
            })
            .select()
            .single();

          if (topicError) {
            console.error('Error creating topic:', topicError);
            continue;
          }
          topic = newTopic;
        }

        // Link to project
        await supabase
          .from('project_topics')
          .insert({
            project_id: project.id,
            topic_id: topic.id,
            is_primary: true
          });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
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

// Get all projects with filters
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

// Delete project (new function)
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First, verify that the user is the owner of the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, owner_id, title')
      .eq('id', id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if the current user is the owner
    if (project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own projects'
      });
    }

    // Delete related records first (due to foreign key constraints)
    
    // Delete project recommendations
    await supabase
      .from('project_recommendations')
      .delete()
      .eq('project_id', id);

    // Delete project members
    await supabase
      .from('project_members')
      .delete()
      .eq('project_id', id);

    // Delete project languages
    await supabase
      .from('project_languages')
      .delete()
      .eq('project_id', id);

    // Delete project topics
    await supabase
      .from('project_topics')
      .delete()
      .eq('project_id', id);

    // Delete coding attempts (if any)
    await supabase
      .from('coding_attempts')
      .delete()
      .eq('project_id', id);

    // Finally, delete the project itself
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete project',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: `Project "${project.title}" has been deleted successfully`
    });

  } catch (error) {
    console.error('Delete project error:', error);
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
  getUserProjects,
  deleteProject // Add the new delete function
};