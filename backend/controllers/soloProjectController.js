// backend/controllers/soloProjectController.js - FIXED VERSION
const supabase = require('../config/supabase');

// Helper function to verify solo project ownership
const verifySoloProjectAccess = async (projectId, userId) => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, maximum_members, current_members')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return { 
        success: false, 
        message: 'Project not found',
        error: projectError
      };
    }

    // Verify it's a solo project (1 member max) and user is the owner
    if (project.maximum_members !== 1 || project.owner_id !== userId) {
      return { 
        success: false, 
        message: 'Access denied. This is not your solo project.',
        statusCode: 403
      };
    }

    return { success: true, project };
  } catch (error) {
    console.error('Error verifying solo project access:', error);
    return { 
      success: false, 
      message: 'Error verifying project access',
      error
    };
  }
};

// ===== DASHBOARD CONTROLLERS =====

const getDashboardData = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📊 Getting dashboard data for solo project:', projectId);

    // Verify access first
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // FIXED: Fetch complete project data with programming languages and topics
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        users!owner_id (
          id,
          username,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching complete project data:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project data'
      });
    }

    // FIXED: Fetch project languages separately (Supabase join limitation)
    const { data: projectLanguages, error: languagesError } = await supabase
      .from('project_languages')
      .select(`
        id,
        is_primary,
        required_level,
        programming_languages (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (languagesError) {
      console.error('Error fetching project languages:', languagesError);
    }

    // FIXED: Fetch project topics separately  
    const { data: projectTopics, error: topicsError } = await supabase
      .from('project_topics')
      .select(`
        id,
        is_primary,
        topics (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (topicsError) {
      console.error('Error fetching project topics:', topicsError);
    }

    // FIXED: Add programming languages and topics to project data
    project.programming_languages = projectLanguages || [];
    project.topics = projectTopics || [];

    // FIXED: Get the primary programming language for the challenge system
    const primaryLanguage = projectLanguages?.find(pl => pl.is_primary);
    if (primaryLanguage) {
      project.programming_language_id = primaryLanguage.programming_languages.id;
      project.programming_language = primaryLanguage.programming_languages;
    } else if (projectLanguages?.length > 0) {
      // Fallback to first language if no primary is set
      project.programming_language_id = projectLanguages[0].programming_languages.id;
      project.programming_language = projectLanguages[0].programming_languages;
    }

    console.log('🔧 Project language info:', {
      languageId: project.programming_language_id,
      languageName: project.programming_language?.name,
      totalLanguages: projectLanguages?.length || 0
    });

    // Fetch project tasks for statistics
    const { data: tasks, error: tasksError } = await supabase
      .from('project_tasks')
      .select('id, status, priority, created_at, completed_at')
      .eq('project_id', projectId);

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    // Fetch goals for additional statistics
    const { data: goals, error: goalsError } = await supabase
      .from('solo_project_goals')
      .select('id, status, priority, created_at, completed_at')
      .eq('project_id', projectId);

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
    }

    // Calculate task statistics
    const allTasks = tasks || [];
    const completed = allTasks.filter(task => task.status === 'completed');
    const inProgress = allTasks.filter(task => task.status === 'in_progress');
    const completionRate = allTasks.length > 0 ?
      Math.round((completed.length / allTasks.length) * 100) : 0;

    // Calculate goal statistics
    const allGoals = goals || [];
    const completedGoals = allGoals.filter(goal => goal.status === 'completed');
    const activeGoals = allGoals.filter(goal => goal.status === 'active');

    // Get today's time tracking (mock for now - will be implemented with real tracking)
    const timeSpentToday = Math.floor(Math.random() * 8) + 1; // Mock data
    const streakDays = Math.floor(Math.random() * 30) + 1; // Mock data

    const dashboardData = {
      project, // FIXED: Now includes programming languages and topics
      stats: {
        totalTasks: allTasks.length,
        completedTasks: completed.length,
        inProgressTasks: inProgress.length,
        completionRate,
        totalGoals: allGoals.length,
        completedGoals: completedGoals.length,
        activeGoals: activeGoals.length,
        timeSpentToday,
        streakDays
      }
    };

    console.log('✅ Dashboard data retrieved successfully with programming languages');

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('💥 Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    console.log('📋 Getting recent activity for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Fetch recent activity from the user_activity table
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activity')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recent activity'
      });
    }

    console.log('✅ Recent activity retrieved successfully');

    res.json({
      success: true,
      data: { activities: activities || [] }
    });

  } catch (error) {
    console.error('💥 Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    });
  }
};

const logActivity = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { action, target, type, metadata } = req.body;
    const userId = req.user.id;

    console.log('📝 Logging activity for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Log activity
    const { data: activity, error: activityError } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        project_id: projectId,
        activity_type: type,
        activity_data: {
          action,
          target,
          metadata: metadata || {}
        }
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error logging activity:', activityError);
      return res.status(500).json({
        success: false,
        message: 'Failed to log activity'
      });
    }

    console.log('✅ Activity logged successfully:', activity.id);

    res.json({
      success: true,
      data: { activity },
      message: 'Activity logged successfully'
    });

  } catch (error) {
    console.error('💥 Log activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log activity'
    });
  }
};

// ===== GOALS CONTROLLERS =====

const getGoals = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, category, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const userId = req.user.id;

    console.log('🎯 Getting goals for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query
    let query = supabase
      .from('solo_project_goals')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    const { data: goals, error: goalsError } = await query;

    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch goals'
      });
    }

    console.log('✅ Goals retrieved successfully');

    res.json({
      success: true,
      data: { goals: goals || [] }
    });

  } catch (error) {
    console.error('💥 Get goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals'
    });
  }
};

const createGoal = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, priority, category, target_date } = req.body;
    const userId = req.user.id;

    console.log('🎯 Creating goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Create goal
    const { data: goal, error: goalError } = await supabase
      .from('solo_project_goals')
      .insert({
        project_id: projectId,
        title,
        description,
        priority: priority || 'medium',
        category: category || 'general',
        target_date,
        status: 'active'
      })
      .select()
      .single();

    if (goalError) {
      console.error('Error creating goal:', goalError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create goal'
      });
    }

    console.log('✅ Goal created successfully:', goal.id);

    res.json({
      success: true,
      data: { goal },
      message: 'Goal created successfully'
    });

  } catch (error) {
    console.error('💥 Create goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal'
    });
  }
};

const updateGoal = async (req, res) => {
  try {
    const { projectId, goalId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('🎯 Updating goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate goal belongs to project
    const { data: existingGoal, error: checkError } = await supabase
      .from('solo_project_goals')
      .select('id')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Update goal
    const { data: goal, error: updateError } = await supabase
      .from('solo_project_goals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating goal:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update goal'
      });
    }

    console.log('✅ Goal updated successfully:', goal.id);

    res.json({
      success: true,
      data: { goal },
      message: 'Goal updated successfully'
    });

  } catch (error) {
    console.error('💥 Update goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal'
    });
  }
};

const deleteGoal = async (req, res) => {
  try {
    const { projectId, goalId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate goal belongs to project and get goal data
    const { data: existingGoal, error: checkError } = await supabase
      .from('solo_project_goals')
      .select('id, title')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete goal
    const { error: deleteError } = await supabase
      .from('solo_project_goals')
      .delete()
      .eq('id', goalId);

    if (deleteError) {
      console.error('Error deleting goal:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete goal'
      });
    }

    console.log('✅ Goal deleted successfully:', existingGoal.title);

    res.json({
      success: true,
      message: `Goal "${existingGoal.title}" deleted successfully`
    });

  } catch (error) {
    console.error('💥 Delete goal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal'
    });
  }
};

// ===== NOTES CONTROLLERS =====

const getNotes = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category, search, sort_by = 'created_at', sort_order = 'desc' } = req.query;
    const userId = req.user.id;

    console.log('📝 Getting notes for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query
    let query = supabase
      .from('solo_project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data: notes, error: notesError } = await query;

    if (notesError) {
      console.error('Error fetching notes:', notesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch notes'
      });
    }

    console.log('✅ Notes retrieved successfully');

    res.json({
      success: true,
      data: { notes: notes || [] }
    });

  } catch (error) {
    console.error('💥 Get notes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

const getNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user.id;

    console.log('📝 Getting note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Fetch note
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .select('*')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('✅ Note retrieved successfully');

    res.json({
      success: true,
      data: { note }
    });

  } catch (error) {
    console.error('💥 Get note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch note'
    });
  }
};

const createNote = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, content, category } = req.body;
    const userId = req.user.id;

    console.log('📝 Creating note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Create note - FIXED: Include user_id in the insert
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,  // ✅ ADDED: This was missing and causing the error
        title,
        content,
        category: category || 'general'
      })
      .select()
      .single();

    if (noteError) {
      console.error('Error creating note:', noteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create note'
      });
    }

    console.log('✅ Note created successfully:', note.id);

    res.json({
      success: true,
      data: { note },
      message: 'Note created successfully'
    });

  } catch (error) {
    console.error('💥 Create note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create note'
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('📝 Updating note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate note belongs to project
    const { data: existingNote, error: checkError } = await supabase
      .from('solo_project_notes')
      .select('id')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Update note
    const { data: note, error: updateError } = await supabase
      .from('solo_project_notes')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', noteId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating note:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update note'
      });
    }

    console.log('✅ Note updated successfully:', note.id);

    res.json({
      success: true,
      data: { note },
      message: 'Note updated successfully'
    });

  } catch (error) {
    console.error('💥 Update note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update note'
    });
  }
};

const deleteNote = async (req, res) => {
  try {
    const { projectId, noteId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Deleting note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Validate note belongs to project and get note data
    const { data: existingNote, error: checkError } = await supabase
      .from('solo_project_notes')
      .select('id, title')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .single();

    if (checkError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Delete note
    const { error: deleteError } = await supabase
      .from('solo_project_notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) {
      console.error('Error deleting note:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete note'
      });
    }

    console.log('✅ Note deleted successfully:', existingNote.title);

    res.json({
      success: true,
      message: `Note "${existingNote.title}" deleted successfully`
    });

  } catch (error) {
    console.error('💥 Delete note error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete note'
    });
  }
};

// ===== TIME TRACKING CONTROLLERS =====

const getTimeTracking = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { date_from, date_to } = req.query;
    const userId = req.user.id;

    console.log('⏱️ Getting time tracking for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Build query for time entries
    let query = supabase
      .from('solo_project_time_tracking')
      .select('*')
      .eq('project_id', projectId)
      .order('logged_at', { ascending: false });

    if (date_from) query = query.gte('logged_at', date_from);
    if (date_to) query = query.lte('logged_at', date_to);

    const { data: timeEntries, error: timeError } = await query;

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch time tracking data'
      });
    }

    // Calculate summary statistics
    const entries = timeEntries || [];
    const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0);
    const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

    // Group by activity type
    const byActivityType = entries.reduce((acc, entry) => {
      const type = entry.activity_type || 'coding';
      if (!acc[type]) acc[type] = 0;
      acc[type] += entry.duration_minutes || 0;
      return acc;
    }, {});

    console.log('✅ Time tracking data retrieved successfully');

    res.json({
      success: true,
      data: {
        entries,
        summary: {
          totalMinutes,
          totalHours,
          entriesCount: entries.length,
          byActivityType
        }
      }
    });

  } catch (error) {
    console.error('💥 Get time tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch time tracking data'
    });
  }
};

const logTimeEntry = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { description, duration_minutes, activity_type } = req.body;
    const userId = req.user.id;

    console.log('⏱️ Logging time entry for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Log time entry
    const { data: timeEntry, error: timeError } = await supabase
      .from('solo_project_time_tracking')
      .insert({
        project_id: projectId,
        description,
        duration_minutes: parseInt(duration_minutes),
        activity_type
      })
      .select()
      .single();

    if (timeError) {
      console.error('Error logging time entry:', timeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to log time entry'
      });
    }

    console.log('✅ Time entry logged successfully:', timeEntry.id);

    res.json({
      success: true,
      data: { timeEntry },
      message: 'Time entry logged successfully'
    });

  } catch (error) {
    console.error('💥 Log time entry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log time entry'
    });
  }
};

// ===== PROJECT INFO CONTROLLERS =====

const getProjectInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📋 Getting project info for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // FIXED: Fetch complete project information with programming languages and topics
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        users!owner_id (
          id,
          username,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project info:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project information'
      });
    }

    // FIXED: Fetch project languages separately
    const { data: projectLanguages, error: languagesError } = await supabase
      .from('project_languages')
      .select(`
        id,
        is_primary,
        required_level,
        programming_languages (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (languagesError) {
      console.error('Error fetching project languages:', languagesError);
    }

    // FIXED: Fetch project topics separately  
    const { data: projectTopics, error: topicsError } = await supabase
      .from('project_topics')
      .select(`
        id,
        is_primary,
        topics (
          id,
          name,
          description
        )
      `)
      .eq('project_id', projectId);

    if (topicsError) {
      console.error('Error fetching project topics:', topicsError);
    }

    // FIXED: Add programming languages and topics to project data
    project.programming_languages = projectLanguages || [];
    project.topics = projectTopics || [];

    // FIXED: Get the primary programming language
    const primaryLanguage = projectLanguages?.find(pl => pl.is_primary);
    if (primaryLanguage) {
      project.programming_language_id = primaryLanguage.programming_languages.id;
      project.programming_language = primaryLanguage.programming_languages;
    } else if (projectLanguages?.length > 0) {
      project.programming_language_id = projectLanguages[0].programming_languages.id;
      project.programming_language = projectLanguages[0].programming_languages;
    }

    console.log('✅ Project info retrieved successfully');

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('💥 Get project info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project information'
    });
  }
};

const updateProjectInfo = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    console.log('✏️ Updating project info for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Update project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project info:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project information'
      });
    }

    console.log('✅ Project info updated successfully');

    res.json({
      success: true,
      data: { project },
      message: 'Project information updated successfully'
    });

  } catch (error) {
    console.error('💥 Update project info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project information'
    });
  }
};

module.exports = {
  // Dashboard
  getDashboardData,
  getRecentActivity,
  logActivity,
  
  // Goals
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  
  // Notes
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  
  // Time Tracking
  getTimeTracking,
  logTimeEntry,
  
  // Project Info
  getProjectInfo,
  updateProjectInfo
};