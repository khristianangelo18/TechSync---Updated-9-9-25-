// backend/controllers/taskController.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Get all tasks for a project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort_by = 'created_at', sort_order = 'desc', status, assigned_to } = req.query;
    const userId = req.user.id;

    // Verify user has access to the project
    const { data: projectMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || (!projectMember && project?.owner_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view tasks.'
      });
    }

    // Build query
    let query = supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name, email),
        creator:created_by(id, first_name, last_name, email)
      `)
      .eq('project_id', projectId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'asc' ? { ascending: true } : { ascending: false };
    
    query = query.order(sortColumn, sortDirection);

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        error: tasksError.message
      });
    }

    res.json({
      success: true,
      data: { tasks: tasks || [] }
    });

  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new task
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const {
      title,
      description,
      task_type = 'development',
      priority = 'medium',
      status = 'todo',
      assigned_to,
      estimated_hours,
      due_date
    } = req.body;

    // Verify user has access to create tasks in this project
    const { data: projectMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || (!projectMember && project?.owner_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to create tasks.'
      });
    }

    // Validate required fields
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    // Validate assigned user is a project member (if assigned)
    if (assigned_to) {
      const { data: assignedMember, error: assignedError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', assigned_to)
        .single();

      const isOwner = project?.owner_id === assigned_to;
      
      if (assignedError && !isOwner) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a project member'
        });
      }
    }

    // Create the task
    const taskData = {
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      task_type,
      priority,
      status,
      assigned_to: assigned_to || null,
      created_by: userId,
      estimated_hours: estimated_hours ? parseInt(estimated_hours) : null,
      due_date: due_date || null
    };

    const { data: task, error: createError } = await supabase
      .from('project_tasks')
      .insert([taskData])
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name, email),
        creator:created_by(id, first_name, last_name, email)
      `)
      .single();

    if (createError) {
      console.error('Error creating task:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create task',
        error: createError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Get the task first
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    const { data: projectMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const isOwner = project?.owner_id === userId;
    const isCreator = task.created_by === userId;
    const isAssigned = task.assigned_to === userId;
    const isMember = projectMember !== null;

    if (!isOwner && !isCreator && !isAssigned && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks you created, are assigned to, or if you are the project owner.'
      });
    }

    // Validate assigned user is a project member (if being assigned)
    if (updates.assigned_to) {
      const { data: assignedMember, error: assignedError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', updates.assigned_to)
        .single();

      const isAssignedOwner = project?.owner_id === updates.assigned_to;
      
      if (assignedError && !isAssignedOwner) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a project member'
        });
      }
    }

    // Prepare update data
    const allowedUpdates = [
      'title', 'description', 'task_type', 'priority', 'status', 
      'assigned_to', 'estimated_hours', 'actual_hours', 'due_date'
    ];
    
    const updateData = {};
    allowedUpdates.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        if (field === 'estimated_hours' || field === 'actual_hours') {
          updateData[field] = updates[field] ? parseInt(updates[field]) : null;
        } else if (field === 'title' && updates[field]) {
          updateData[field] = updates[field].trim();
        } else if (field === 'description') {
          updateData[field] = updates[field]?.trim() || null;
        } else {
          updateData[field] = updates[field];
        }
      }
    });

    // Add completion timestamp if status changed to completed
    if (updateData.status === 'completed' && task.status !== 'completed') {
      updateData.completed_at = new Date().toISOString();
    } else if (updateData.status !== 'completed' && task.status === 'completed') {
      updateData.completed_at = null;
    }

    updateData.updated_at = new Date().toISOString();

    // Update the task
    const { data: updatedTask, error: updateError } = await supabase
      .from('project_tasks')
      .update(updateData)
      .eq('id', taskId)
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name, email),
        creator:created_by(id, first_name, last_name, email)
      `)
      .single();

    if (updateError) {
      console.error('Error updating task:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update task',
        error: updateError.message
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    // Get the task first
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check permissions (only owner or creator can delete)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    const isOwner = project?.owner_id === userId;
    const isCreator = task.created_by === userId;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the project owner or task creator can delete tasks.'
      });
    }

    // Delete task dependencies first
    await supabase
      .from('task_dependencies')
      .delete()
      .eq('task_id', taskId);

    await supabase
      .from('task_dependencies')
      .delete()
      .eq('depends_on_task_id', taskId);

    // Delete task submissions
    await supabase
      .from('task_submissions')
      .delete()
      .eq('task_id', taskId);

    // Delete the task
    const { error: deleteError } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task',
        error: deleteError.message
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific task
const getTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    const userId = req.user.id;

    // Verify user has access to the project
    const { data: projectMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || (!projectMember && project?.owner_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view tasks.'
      });
    }

    // Get the task
    const { data: task, error: taskError } = await supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, first_name, last_name, email),
        creator:created_by(id, first_name, last_name, email),
        dependencies:task_dependencies!task_dependencies_task_id_fkey(
          depends_on_task_id,
          dependency:depends_on_task_id(id, title, status)
        ),
        dependents:task_dependencies!task_dependencies_depends_on_task_id_fkey(
          task_id,
          dependent:task_id(id, title, status)
        )
      `)
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (taskError || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get task statistics for a project
const getTaskStats = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify user has access to the project
    const { data: projectMember, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || (!projectMember && project?.owner_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view task statistics.'
      });
    }

    // Get task counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('project_tasks')
      .select('status')
      .eq('project_id', projectId);

    if (statusError) {
      throw statusError;
    }

    // Get task counts by priority
    const { data: priorityCounts, error: priorityError } = await supabase
      .from('project_tasks')
      .select('priority')
      .eq('project_id', projectId);

    if (priorityError) {
      throw priorityError;
    }

    // Calculate statistics
    const stats = {
      total: statusCounts.length,
      byStatus: {
        todo: statusCounts.filter(t => t.status === 'todo').length,
        in_progress: statusCounts.filter(t => t.status === 'in_progress').length,
        in_review: statusCounts.filter(t => t.status === 'in_review').length,
        completed: statusCounts.filter(t => t.status === 'completed').length,
        blocked: statusCounts.filter(t => t.status === 'blocked').length
      },
      byPriority: {
        low: priorityCounts.filter(t => t.priority === 'low').length,
        medium: priorityCounts.filter(t => t.priority === 'medium').length,
        high: priorityCounts.filter(t => t.priority === 'high').length,
        urgent: priorityCounts.filter(t => t.priority === 'urgent').length
      }
    };

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getTaskStats
};