// backend/controllers/taskController.js
const { createClient } = require('@supabase/supabase-js');

// Use SERVICE_KEY for backend operations (not ANON_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Get all tasks for a project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { sort_by = 'created_at', sort_order = 'desc', status, assigned_to, priority } = req.query;
    const userId = req.user.id;

    console.log('🔍 Getting tasks for project:', projectId, 'by user:', userId);
    console.log('🔍 Query parameters:', { sort_by, sort_order, status, assigned_to, priority });

    // First, verify the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, owner_id, status')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('❌ Project error:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log('✅ Project found:', project.title, 'Owner:', project.owner_id);

    // Check if user is the project owner
    const isOwner = project.owner_id === userId;
    console.log('👑 User is owner:', isOwner);

    let isMember = false;
    if (!isOwner) {
      // Check if user is a project member
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('id, role, status')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active') // Only check active members
        .single();

      if (!memberError && projectMember) {
        isMember = true;
        console.log('👥 User is member:', projectMember.role, 'Status:', projectMember.status);
      } else {
        console.log('❌ Member error or not found:', memberError?.message || 'Not a member');
      }
    }

    // Check access permissions
    if (!isOwner && !isMember) {
      console.log('🚫 Access denied - user is neither owner nor active member');
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view tasks.'
      });
    }

    console.log('✅ Access granted - fetching tasks');

    // Build query for tasks
    let query = supabase
      .from('project_tasks')
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, username, email),
        creator:created_by(id, full_name, username, email)
      `)
      .eq('project_id', projectId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
      console.log('🔍 Filtering by status:', status);
    }
    if (assigned_to) {
      query = query.eq('assigned_to', assigned_to);
      console.log('🔍 Filtering by assigned_to:', assigned_to);
    }
    if (priority) {
      query = query.eq('priority', priority);
      console.log('🔍 Filtering by priority:', priority);
    }

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'asc' ? { ascending: true } : { ascending: false };
    
    console.log('📋 Sorting by:', sortColumn, sortDirection.ascending ? 'ASC' : 'DESC');
    query = query.order(sortColumn, sortDirection);

    const { data: tasks, error: tasksError } = await query;

    if (tasksError) {
      console.error('❌ Error fetching tasks:', tasksError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch tasks',
        error: tasksError.message
      });
    }

    console.log(`✅ Found ${tasks?.length || 0} tasks for project ${projectId}`);

    // Debug: Log first few tasks if any exist
    if (tasks && tasks.length > 0) {
      console.log('📋 Sample tasks:');
      tasks.slice(0, 3).forEach((task, index) => {
        console.log(`  ${index + 1}. ${task.title} - ${task.status} - ${task.priority}`);
      });
    }

    res.json({
      success: true,
      data: { tasks: tasks || [] }
    });

  } catch (error) {
    console.error('💥 Get project tasks error:', error);
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

    console.log('🆕 Creating task for project:', projectId, 'by user:', userId);
    console.log('📝 Task data:', { title, task_type, priority, status, assigned_to });

    // Verify user has access to create tasks in this project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && projectMember) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
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
        .eq('status', 'active')
        .single();

      const isAssignedOwner = project.owner_id === assigned_to;
      
      if (assignedError && !isAssignedOwner) {
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

    console.log('💾 Inserting task:', taskData);

    const { data: task, error: createError } = await supabase
      .from('project_tasks')
      .insert(taskData)
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, username, email),
        creator:created_by(id, full_name, username, email)
      `)
      .single();

    if (createError) {
      console.error('❌ Error creating task:', createError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create task',
        error: createError.message
      });
    }

    console.log('✅ Task created successfully:', task.id);

    res.status(201).json({
      success: true,
      data: { task },
      message: 'Task created successfully'
    });

  } catch (error) {
    console.error('💥 Create task error:', error);
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
    const updateData = req.body;

    console.log('🔄 Updating task:', taskId, 'in project:', projectId, 'by user:', userId);

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && projectMember) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to update tasks.'
      });
    }

    // Verify task exists and belongs to the project
    const { data: existingTask, error: taskError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (taskError || !existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Validate assigned user is a project member (if updating assignment)
    if (updateData.assigned_to) {
      const { data: assignedMember, error: assignedError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', updateData.assigned_to)
        .eq('status', 'active')
        .single();

      const isAssignedOwner = project.owner_id === updateData.assigned_to;
      
      if (assignedError && !isAssignedOwner) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user must be a project member'
        });
      }
    }

    // Prepare update data
    const allowedFields = [
      'title', 'description', 'task_type', 'priority', 'status', 
      'assigned_to', 'estimated_hours', 'actual_hours', 'due_date'
    ];
    
    const filteredUpdateData = {};
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        if (key === 'estimated_hours' || key === 'actual_hours') {
          filteredUpdateData[key] = updateData[key] ? parseInt(updateData[key]) : null;
        } else if (key === 'title' || key === 'description') {
          filteredUpdateData[key] = updateData[key]?.trim() || null;
        } else {
          filteredUpdateData[key] = updateData[key];
        }
      }
    });

    // Add completed_at timestamp if status is being changed to completed
    if (updateData.status === 'completed' && existingTask.status !== 'completed') {
      filteredUpdateData.completed_at = new Date().toISOString();
    } else if (updateData.status !== 'completed' && existingTask.status === 'completed') {
      filteredUpdateData.completed_at = null;
    }

    // Add updated_at timestamp
    filteredUpdateData.updated_at = new Date().toISOString();

    console.log('💾 Updating task with data:', filteredUpdateData);

    // Update the task
    const { data: task, error: updateError } = await supabase
      .from('project_tasks')
      .update(filteredUpdateData)
      .eq('id', taskId)
      .select(`
        *,
        assigned_user:assigned_to(id, full_name, username, email),
        creator:created_by(id, full_name, username, email)
      `)
      .single();

    if (updateError) {
      console.error('❌ Error updating task:', updateError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update task',
        error: updateError.message
      });
    }

    console.log('✅ Task updated successfully:', task.id);

    res.json({
      success: true,
      data: { task },
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('💥 Update task error:', error);
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

    console.log('🗑️ Deleting task:', taskId, 'from project:', projectId);

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && projectMember) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to delete tasks.'
      });
    }

    // Verify task exists and belongs to the project
    const { data: existingTask, error: taskError } = await supabase
      .from('project_tasks')
      .select('*')
      .eq('id', taskId)
      .eq('project_id', projectId)
      .single();

    if (taskError || !existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete the task
    const { error: deleteError } = await supabase
      .from('project_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('❌ Error deleting task:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete task',
        error: deleteError.message
      });
    }

    console.log('✅ Task deleted successfully:', taskId);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('💥 Delete task error:', error);
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

    console.log('📋 Getting task:', taskId, 'from project:', projectId);

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && projectMember) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
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
        assigned_user:assigned_to(id, full_name, username, email),
        creator:created_by(id, full_name, username, email)
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

    console.log('✅ Task found:', task.title);

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('💥 Get task error:', error);
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

    console.log('📊 Getting task stats for project:', projectId);

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: projectMember, error: memberError } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && projectMember) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
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

    console.log('📊 Task stats calculated:', stats);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('💥 Get task stats error:', error);
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