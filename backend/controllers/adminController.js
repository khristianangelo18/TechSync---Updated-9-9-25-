// backend/controllers/adminController.js
const supabase = require('../config/supabase');
const { logAdminActivity } = require('../middleware/adminAuth');

// Get admin dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const adminId = req.admin.id;

    // Get total counts for different resources
    const [
      { count: totalUsers },
      { count: totalProjects },
      { count: totalChallenges },
      { count: activeProjects },
      { count: suspendedUsers },
      { count: recentRegistrations }
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }),
      supabase.from('coding_challenges').select('id', { count: 'exact', head: true }),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_suspended', true),
      supabase.from('users').select('id', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('admin_activity_logs')
      .select(`
        *,
        users!admin_id (username, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Log admin access
    await logAdminActivity(adminId, 'VIEW_DASHBOARD', 'system', null, {}, req);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProjects,
          totalChallenges,
          activeProjects,
          suspendedUsers,
          recentRegistrations
        },
        recentActivity: recentActivity || []
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats'
    });
  }
};

// Get all users with filtering and pagination
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      suspended
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select(`
        id, username, email, full_name, role, 
        is_active, is_suspended, years_experience,
        created_at, last_login_at, suspension_reason
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    if (role) {
      query = query.eq('role', role);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    }

    if (suspended === 'true') {
      query = query.eq('is_suspended', true);
    } else if (suspended === 'false') {
      query = query.eq('is_suspended', false);
    }

    const { data: users, error } = await query;

    if (error) {
      throw error;
    }

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_USERS', 'user', null, { filters: req.query }, req);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Update user status/role
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, is_active, is_suspended, suspension_reason, suspension_duration } = req.body;
    const adminId = req.admin.id;

    // Prevent admin from suspending themselves
    if (userId === adminId && (is_active === false || is_suspended === true)) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend or deactivate your own account'
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (is_suspended !== undefined) {
      updateData.is_suspended = is_suspended;
      if (is_suspended && suspension_duration) {
        updateData.suspended_until = new Date(Date.now() + suspension_duration * 60 * 1000).toISOString();
      } else if (!is_suspended) {
        updateData.suspended_until = null;
        updateData.suspension_reason = null;
      }
    }
    if (suspension_reason) updateData.suspension_reason = suspension_reason;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, role, is_active, is_suspended')
      .single();

    if (error) {
      throw error;
    }

    // Log admin activity
    await logAdminActivity(adminId, 'UPDATE_USER', 'user', userId, updateData, req);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Get all projects for admin management
const getProjects = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      difficulty
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('projects')
      .select(`
        *,
        users:owner_id (id, username, full_name),
        project_members (id)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    const { data: projects, error } = await query;

    if (error) {
      throw error;
    }

    // Add member count to each project
    const projectsWithCounts = projects.map(project => ({
      ...project,
      member_count: project.project_members?.length || 0
    }));

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_PROJECTS', 'project', null, { filters: req.query }, req);

    res.json({
      success: true,
      data: {
        projects: projectsWithCounts,
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
      message: 'Failed to fetch projects'
    });
  }
};

// Get all challenges for admin management
const getChallenges = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      difficulty,
      language,
      is_active
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('coding_challenges')
      .select(`
        *,
        programming_languages (id, name),
        users:created_by (id, username, full_name),
        projects (id, title)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (difficulty) {
      query = query.eq('difficulty_level', difficulty);
    }

    if (language) {
      query = query.eq('programming_language_id', language);
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }

    const { data: challenges, error } = await query;

    if (error) {
      throw error;
    }

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_CHALLENGES', 'challenge', null, { filters: req.query }, req);

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
      message: 'Failed to fetch challenges'
    });
  }
};

// Get system settings
const getSystemSettings = async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      throw error;
    }

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = {
        value: setting.setting_value,
        description: setting.description,
        updated_at: setting.updated_at
      };
      return acc;
    }, {});

    // Log admin access
    await logAdminActivity(req.admin.id, 'VIEW_SETTINGS', 'system', null, {}, req);

    res.json({
      success: true,
      data: { settings: settingsObject }
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings'
    });
  }
};

// Update system settings
const updateSystemSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const adminId = req.admin.id;

    const updates = [];
    for (const [key, value] of Object.entries(settings)) {
      updates.push(
        supabase
          .from('system_settings')
          .upsert({
            setting_key: key,
            setting_value: value,
            updated_by: adminId,
            updated_at: new Date().toISOString()
          })
      );
    }

    await Promise.all(updates);

    // Log admin activity
    await logAdminActivity(adminId, 'UPDATE_SETTINGS', 'system', null, { settings }, req);

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Get admin activity logs
const getActivityLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      admin_id,
      action,
      resource_type,
      date_from,
      date_to
    } = req.query;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('admin_activity_logs')
      .select(`
        *,
        users!admin_id (username, full_name)
      `)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (admin_id) {
      query = query.eq('admin_id', admin_id);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resource_type) {
      query = query.eq('resource_type', resource_type);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    const { data: logs, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: logs.length
        }
      }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUser,
  getProjects,
  getChallenges,
  getSystemSettings,
  updateSystemSettings,
  getActivityLogs
};