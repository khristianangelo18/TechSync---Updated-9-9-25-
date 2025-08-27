// backend/controllers/soloProjectController.js
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

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

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
    const completionRate = allTasks.length > 0 ? Math.round((completed.length / allTasks.length) * 100) : 0;

    // Calculate goal statistics
    const allGoals = goals || [];
    const completedGoals = allGoals.filter(goal => goal.status === 'completed');
    const activeGoals = allGoals.filter(goal => goal.status === 'active');

    // Get today's time tracking (mock for now - will be implemented with real tracking)
    const timeSpentToday = Math.floor(Math.random() * 8) + 1; // Mock data
    const streakDays = Math.floor(Math.random() * 30) + 1; // Mock data

    const dashboardData = {
      project: accessCheck.project,
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

    console.log('✅ Dashboard data retrieved successfully');

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
    const { action, target, type, metadata = {} } = req.body;
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

    // Create activity log entry
    const { data: activity, error: activityError } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        project_id: projectId,
        activity_type: type,
        activity_data: {
          action,
          target,
          ...metadata
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

    let query = supabase
      .from('solo_project_goals')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (category) {
      query = query.eq('category', category);
    }

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
    const { title, description, target_date, priority = 'medium', category = 'feature' } = req.body;
    const userId = req.user.id;

    console.log('➕ Creating goal for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Create the goal
    const { data: goal, error: goalError } = await supabase
      .from('solo_project_goals')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: title.trim(),
        description: description?.trim() || null,
        target_date: target_date || null,
        priority,
        category,
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

    // Log activity
    await logActivity({
      params: { projectId },
      body: {
        action: 'created goal',
        target: title,
        type: 'goal_created'
      },
      user: { id: userId }
    }, { json: () => {} }); // Mock response object

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

    console.log('✏️ Updating goal:', goalId, 'for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Verify goal exists and belongs to this project
    const { data: existingGoal, error: fetchError } = await supabase
      .from('solo_project_goals')
      .select('*')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Prepare update data
    const cleanUpdateData = {};
    if (updateData.title !== undefined) cleanUpdateData.title = updateData.title.trim();
    if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim() || null;
    if (updateData.status !== undefined) cleanUpdateData.status = updateData.status;
    if (updateData.priority !== undefined) cleanUpdateData.priority = updateData.priority;
    if (updateData.target_date !== undefined) cleanUpdateData.target_date = updateData.target_date;
    if (updateData.category !== undefined) cleanUpdateData.category = updateData.category;

    // Set completion timestamp if marking as completed
    if (cleanUpdateData.status === 'completed' && existingGoal.status !== 'completed') {
      cleanUpdateData.completed_at = new Date().toISOString();
    } else if (cleanUpdateData.status !== 'completed') {
      cleanUpdateData.completed_at = null;
    }

    cleanUpdateData.updated_at = new Date().toISOString();

    // Update the goal
    const { data: goal, error: updateError } = await supabase
      .from('solo_project_goals')
      .update(cleanUpdateData)
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

    console.log('🗑️ Deleting goal:', goalId, 'for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Verify goal exists and belongs to this project
    const { data: existingGoal, error: fetchError } = await supabase
      .from('solo_project_goals')
      .select('title')
      .eq('id', goalId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingGoal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete the goal
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

    console.log('✅ Goal deleted successfully:', goalId);

    res.json({
      success: true,
      message: 'Goal deleted successfully'
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
    const { category, search, sort_by = 'updated_at', sort_order = 'desc' } = req.query;
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

    let query = supabase
      .from('solo_project_notes')
      .select('*')
      .eq('project_id', projectId)
      .order(sort_by, { ascending: sort_order === 'asc' });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

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

    console.log('📖 Getting note:', noteId, 'for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Fetch the specific note
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .select('*')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (noteError || !note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    console.log('✅ Note retrieved successfully:', note.id);

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
    const { title, content, category = 'general' } = req.body;
    const userId = req.user.id;

    console.log('➕ Creating note for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Create the note
    const { data: note, error: noteError } = await supabase
      .from('solo_project_notes')
      .insert({
        project_id: projectId,
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
        category
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

    // Log activity
    await logActivity({
      params: { projectId },
      body: {
        action: 'created note',
        target: title,
        type: 'note_created'
      },
      user: { id: userId }
    }, { json: () => {} }); // Mock response object

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

    console.log('✏️ Updating note:', noteId, 'for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Verify note exists and belongs to this project
    const { data: existingNote, error: fetchError } = await supabase
      .from('solo_project_notes')
      .select('*')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Prepare update data
    const cleanUpdateData = {};
    if (updateData.title !== undefined) cleanUpdateData.title = updateData.title.trim();
    if (updateData.content !== undefined) cleanUpdateData.content = updateData.content.trim();
    if (updateData.category !== undefined) cleanUpdateData.category = updateData.category;
    
    cleanUpdateData.updated_at = new Date().toISOString();

    // Update the note
    const { data: note, error: updateError } = await supabase
      .from('solo_project_notes')
      .update(cleanUpdateData)
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

    console.log('🗑️ Deleting note:', noteId, 'for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    // Verify note exists and belongs to this project
    const { data: existingNote, error: fetchError } = await supabase
      .from('solo_project_notes')
      .select('title')
      .eq('id', noteId)
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Delete the note
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

    console.log('✅ Note deleted successfully:', noteId);

    res.json({
      success: true,
      message: 'Note deleted successfully'
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

    console.log('⏰ Getting time tracking for solo project:', projectId);

    // Verify access
    const accessCheck = await verifySoloProjectAccess(projectId, userId);
    if (!accessCheck.success) {
      return res.status(accessCheck.statusCode || 404).json({
        success: false,
        message: accessCheck.message
      });
    }

    let query = supabase
      .from('solo_project_time_entries')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply date filters
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: timeEntries, error: timeError } = await query;

    if (timeError) {
      console.error('Error fetching time entries:', timeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch time tracking data'
      });
    }

    // Calculate totals
    const totalMinutes = (timeEntries || []).reduce((sum, entry) => sum + entry.duration_minutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    console.log('✅ Time tracking data retrieved successfully');

    res.json({
      success: true,
      data: {
        timeEntries: timeEntries || [],
        summary: {
          totalMinutes,
          totalHours,
          remainingMinutes,
          totalFormatted: `${totalHours}h ${remainingMinutes}m`
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
    const { description, duration_minutes, activity_type = 'coding' } = req.body;
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

    // Create time entry
    const { data: timeEntry, error: timeError } = await supabase
      .from('solo_project_time_entries')
      .insert({
        project_id: projectId,
        user_id: userId,
        description: description?.trim() || null,
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

    // Fetch detailed project information
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

    // Prepare update data
    const cleanUpdateData = {};
    if (updateData.title !== undefined) cleanUpdateData.title = updateData.title.trim();
    if (updateData.description !== undefined) cleanUpdateData.description = updateData.description?.trim() || null;
    if (updateData.tech_stack !== undefined) cleanUpdateData.tech_stack = updateData.tech_stack;
    if (updateData.repository_url !== undefined) cleanUpdateData.repository_url = updateData.repository_url?.trim() || null;
    if (updateData.live_demo_url !== undefined) cleanUpdateData.live_demo_url = updateData.live_demo_url?.trim() || null;
    if (updateData.project_status !== undefined) cleanUpdateData.project_status = updateData.project_status;
    if (updateData.difficulty_level !== undefined) cleanUpdateData.difficulty_level = updateData.difficulty_level;

    cleanUpdateData.updated_at = new Date().toISOString();

    // Update the project
    const { data: project, error: updateError } = await supabase
      .from('projects')
      .update(cleanUpdateData)
      .eq('id', projectId)
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
      .single();

    if (updateError) {
      console.error('Error updating project info:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update project information'
      });
    }

    // Log activity
    await logActivity({
      params: { projectId },
      body: {
        action: 'updated project',
        target: 'Project information',
        type: 'project_updated'
      },
      user: { id: userId }
    }, { json: () => {} }); // Mock response object

    console.log('✅ Project info updated successfully:', project.id);

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
  getDashboardData,
  getRecentActivity,
  logActivity,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getTimeTracking,
  logTimeEntry,
  getProjectInfo,
  updateProjectInfo
};