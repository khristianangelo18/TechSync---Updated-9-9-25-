// backend/controllers/projectMemberController.js
const { createClient } = require('@supabase/supabase-js');

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

// Get all members of a project
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Getting members for project:', projectId, 'by user:', userId);

    // Verify user has access to the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: memberCheck, error: memberError } = await supabase
        .from('project_members')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!memberError && memberCheck) {
        isMember = true;
      }
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view members.'
      });
    }

    // Get project members
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          email,
          avatar_url,
          years_experience,
          github_username
        )
      `)
      .eq('project_id', projectId)
      .neq('status', 'removed')
      .order('joined_at', { ascending: true });

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project members',
        error: membersError.message
      });
    }

    // Also include the project owner
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id, username, full_name, email, avatar_url, years_experience, github_username')
      .eq('id', project.owner_id)
      .single();

    const result = {
      owner: owner,
      members: members || [],
      total_members: (members?.length || 0) + 1 // +1 for owner
    };

    console.log(`✅ Found ${result.members.length} members + 1 owner for project`);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('💥 Get project members error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add a member to a project
const addProjectMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role = 'member' } = req.body;
    const userId = req.user.id;

    console.log('➕ Adding member to project:', projectId, 'user:', user_id, 'role:', role);

    // Verify user is the project owner or admin
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, title, maximum_members, current_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners can add members'
      });
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, email')
      .eq('id', user_id)
      .single();

    if (userError || !userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    const { data: existingMember, error: existingError } = await supabase
      .from('project_members')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', user_id)
      .single();

    if (existingMember) {
      if (existingMember.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this project'
        });
      } else if (existingMember.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'User already has a pending invitation to this project'
        });
      }
    }

    // Check maximum members limit
    if (project.maximum_members && project.current_members >= project.maximum_members) {
      return res.status(400).json({
        success: false,
        message: 'Project has reached maximum member limit'
      });
    }

    // Add the member
    const { data: newMember, error: addError } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: user_id,
        role: role,
        status: 'active'
      })
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          email,
          avatar_url,
          years_experience
        )
      `)
      .single();

    if (addError) {
      console.error('Error adding member:', addError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add member',
        error: addError.message
      });
    }

    // Update project current_members count
    await supabase
      .from('projects')
      .update({ current_members: project.current_members + 1 })
      .eq('id', projectId);

    console.log(`✅ Successfully added ${userExists.username} to project ${project.title}`);

    res.status(201).json({
      success: true,
      data: { member: newMember },
      message: `${userExists.username} has been added to the project`
    });

  } catch (error) {
    console.error('💥 Add project member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    console.log('🔄 Updating member role:', memberId, 'to:', role);

    // Verify user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, title')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners can update member roles'
      });
    }

    // Validate role
    const validRoles = ['member', 'moderator', 'lead'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: member, moderator, lead'
      });
    }

    // Update the member
    const { data: updatedMember, error: updateError } = await supabase
      .from('project_members')
      .update({ role })
      .eq('id', memberId)
      .eq('project_id', projectId)
      .select(`
        *,
        users:user_id (
          id,
          username,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (updateError || !updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    console.log(`✅ Updated ${updatedMember.users.username} role to ${role}`);

    res.json({
      success: true,
      data: { member: updatedMember },
      message: `Member role updated to ${role}`
    });

  } catch (error) {
    console.error('💥 Update member role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Remove a member from a project
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Removing member:', memberId, 'from project:', projectId);

    // Verify user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, title, current_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.owner_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only project owners can remove members'
      });
    }

    // Get member details before removing
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select(`
        *,
        users:user_id (username)
      `)
      .eq('id', memberId)
      .eq('project_id', projectId)
      .single();

    if (memberError || !member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Update member status to 'removed'
    const { error: removeError } = await supabase
      .from('project_members')
      .update({ status: 'removed' })
      .eq('id', memberId);

    if (removeError) {
      console.error('Error removing member:', removeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove member',
        error: removeError.message
      });
    }

    // Update project current_members count
    await supabase
      .from('projects')
      .update({ current_members: Math.max(1, project.current_members - 1) })
      .eq('id', projectId);

    // Unassign member from all tasks in this project
    await supabase
      .from('project_tasks')
      .update({ assigned_to: null })
      .eq('project_id', projectId)
      .eq('assigned_to', member.user_id);

    console.log(`✅ Removed ${member.users.username} from project ${project.title}`);

    res.json({
      success: true,
      message: `${member.users.username} has been removed from the project`
    });

  } catch (error) {
    console.error('💥 Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Leave a project (for members to leave themselves)
const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🚪 User leaving project:', projectId, 'user:', userId);

    // Check if user is a member
    const { data: member, error: memberError } = await supabase
      .from('project_members')
      .select('id, role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (memberError || !member) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // Update member status to 'removed'
    const { error: leaveError } = await supabase
      .from('project_members')
      .update({ status: 'removed' })
      .eq('id', member.id);

    if (leaveError) {
      console.error('Error leaving project:', leaveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to leave project',
        error: leaveError.message
      });
    }

    // Update project current_members count
    const { data: project } = await supabase
      .from('projects')
      .select('current_members')
      .eq('id', projectId)
      .single();

    if (project) {
      await supabase
        .from('projects')
        .update({ current_members: Math.max(1, project.current_members - 1) })
        .eq('id', projectId);
    }

    // Unassign user from all tasks in this project
    await supabase
      .from('project_tasks')
      .update({ assigned_to: null })
      .eq('project_id', projectId)
      .eq('assigned_to', userId);

    console.log(`✅ User ${userId} left project ${projectId}`);

    res.json({
      success: true,
      message: 'You have left the project'
    });

  } catch (error) {
    console.error('💥 Leave project error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject
};