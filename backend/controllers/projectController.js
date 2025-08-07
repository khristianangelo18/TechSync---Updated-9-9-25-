// backend/controllers/projectController.js - FINAL COMPLETE VERSION
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
      for (const langData of programming_languages) {
        let languageId;
        
        // If it's a string, find or create the language
        if (typeof langData === 'string') {
          let { data: language } = await supabase
            .from('programming_languages')
            .select('id')
            .eq('name', langData)
            .single();

          if (!language) {
            const { data: newLang, error: langError } = await supabase
              .from('programming_languages')
              .insert({ 
                name: langData, 
                is_active: true,
                created_by: userId
              })
              .select()
              .single();

            if (langError) {
              console.error('Error creating language:', langError);
              continue;
            }
            language = newLang;
          }
          languageId = language.id;
        } else {
          // If it's an object with id
          languageId = langData.id || langData.language_id;
        }

        // FIXED: Add to project_languages with correct column name
        const { error: projLangError } = await supabase
          .from('project_languages')
          .insert({
            project_id: project.id,
            language_id: languageId, // FIXED: was programming_language_id
            is_primary: langData.is_primary || false,
            required_level: langData.required_level || 'beginner'
          });

        if (projLangError) {
          console.error('Error adding project language:', projLangError);
        }
      }
    }

    // Handle topics
    if (topics && topics.length > 0) {
      for (const topicData of topics) {
        let topicId;
        
        if (typeof topicData === 'string') {
          let { data: topic } = await supabase
            .from('topics')
            .select('id')
            .eq('name', topicData)
            .single();

          if (!topic) {
            const { data: newTopic, error: topicError } = await supabase
              .from('topics')
              .insert({ 
                name: topicData, 
                is_active: true,
                created_by: userId
              })
              .select()
              .single();

            if (topicError) {
              console.error('Error creating topic:', topicError);
              continue;
            }
            topic = newTopic;
          }
          topicId = topic.id;
        } else {
          topicId = topicData.id || topicData.topic_id;
        }

        const { error: projTopicError } = await supabase
          .from('project_topics')
          .insert({
            project_id: project.id,
            topic_id: topicId,
            is_primary: topicData.is_primary || false
          });

        if (projTopicError) {
          console.error('Error adding project topic:', projTopicError);
        }
      }
    }

    // Fetch the complete project with relationships
    const { data: completeProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        project_languages (
          language_id,
          is_primary,
          required_level,
          programming_languages (id, name)
        ),
        project_topics (
          topic_id,
          is_primary,
          topics (id, name, category)
        ),
        project_members (
          user_id,
          role,
          status,
          joined_at,
          users (id, username, full_name)
        )
      `)
      .eq('id', project.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete project:', fetchError);
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: completeProject || project }
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
      status,
      difficulty_level,
      required_experience_level,
      programming_language,
      topic,
      search
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('projects')
      .select(`
        *,
        project_languages (
          language_id,
          is_primary,
          required_level,
          programming_languages (id, name)
        ),
        project_topics (
          topic_id,
          is_primary,
          topics (id, name, category)
        ),
        project_members!inner (
          user_id,
          role,
          users (id, username, full_name, avatar_url)
        )
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

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
        project_languages (
          language_id,
          is_primary,
          required_level,
          programming_languages (id, name)
        ),
        project_topics (
          topic_id,
          is_primary,
          topics (id, name, category)
        ),
        project_members (
          user_id,
          role,
          status,
          joined_at,
          contribution_score,
          users (id, username, full_name, avatar_url)
        ),
        users:owner_id (id, username, full_name, avatar_url)
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
    const { role, status } = req.query;

    let query = supabase
      .from('project_members')
      .select(`
        *,
        projects (
          *,
          project_languages (
            language_id,
            is_primary,
            programming_languages (id, name)
          ),
          project_topics (
            topic_id,
            is_primary,
            topics (id, name, category)
          )
        )
      `)
      .eq('user_id', userId);

    if (role) {
      query = query.eq('role', role);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: memberships, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user projects',
        error: error.message
      });
    }

    const projects = memberships.map(membership => ({
      ...membership.projects,
      membership: {
        role: membership.role,
        status: membership.status,
        joined_at: membership.joined_at,
        contribution_score: membership.contribution_score
      }
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

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Check if project exists and user is the owner
    const { data: existingProject, error: findError } = await supabase
      .from('projects')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (findError || !existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (existingProject.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own projects'
      });
    }

    // Update the project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        project_languages (
          language_id,
          is_primary,
          required_level,
          programming_languages (id, name)
        ),
        project_topics (
          topic_id,
          is_primary,
          topics (id, name, category)
        ),
        project_members (
          user_id,
          role,
          status,
          users (id, username, full_name)
        )
      `)
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update project',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete project (only by owner) - COMPLETELY FIXED
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log(`Delete project request: ${id} by user: ${userId}`);

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

    console.log(`Deleting project: ${project.title} (${id})`);

    // Delete related records first (due to foreign key constraints)
    
    // Get project tasks first (needed for dependencies)
    const { data: projectTasks } = await supabase
      .from('project_tasks')
      .select('id')
      .eq('project_id', id);

    console.log(`Found ${projectTasks?.length || 0} project tasks`);

    // Delete task dependencies first
    if (projectTasks && projectTasks.length > 0) {
      const taskIds = projectTasks.map(task => task.id);
      
      await supabase
        .from('task_dependencies')
        .delete()
        .in('task_id', taskIds);
        
      await supabase
        .from('task_dependencies')
        .delete()
        .in('depends_on_task_id', taskIds);

      // Delete task submissions
      await supabase
        .from('task_submissions')
        .delete()
        .in('task_id', taskIds);
    }

    // Get project files for permissions cleanup
    const { data: projectFiles } = await supabase
      .from('project_files')
      .select('id')
      .eq('project_id', id);

    // Delete file permissions
    if (projectFiles && projectFiles.length > 0) {
      const fileIds = projectFiles.map(file => file.id);
      
      await supabase
        .from('file_permissions')
        .delete()
        .in('file_id', fileIds);
    }

    // Get chat rooms for message cleanup
    const { data: chatRooms } = await supabase
      .from('chat_rooms')
      .select('id')
      .eq('project_id', id);

    // Delete chat messages first
    if (chatRooms && chatRooms.length > 0) {
      const roomIds = chatRooms.map(room => room.id);
      
      await supabase
        .from('chat_messages')
        .delete()
        .in('room_id', roomIds);
    }

    // Now delete all project-related records
    console.log('Deleting project relationships...');

    // Delete project recommendations
    await supabase
      .from('project_recommendations')
      .delete()
      .eq('project_id', id);

    // Delete recommendation feedback
    await supabase
      .from('recommendation_feedback')
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

    // FIXED: Delete challenge attempts using correct table name
    await supabase
      .from('challenge_attempts') // FIXED: was 'coding_attempts'
      .delete()
      .eq('project_id', id);

    // Delete coding challenges
    await supabase
      .from('coding_challenges')
      .delete()
      .eq('project_id', id);

    // Delete project files
    await supabase
      .from('project_files')
      .delete()
      .eq('project_id', id);

    // Delete project tasks
    await supabase
      .from('project_tasks')
      .delete()
      .eq('project_id', id);

    // Delete chat rooms
    await supabase
      .from('chat_rooms')
      .delete()
      .eq('project_id', id);

    // Delete notifications
    await supabase
      .from('notifications')
      .delete()
      .eq('project_id', id);

    // Delete user activity
    await supabase
      .from('user_activity')
      .delete()
      .eq('project_id', id);

    // Finally, delete the project itself
    console.log('Deleting main project record...');
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

    console.log(`Project "${project.title}" deleted successfully`);

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
  updateProject,
  deleteProject
};