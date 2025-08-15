// backend/controllers/projectMemberController.js
const supabase = require('../config/supabase');

// Get all members of a project
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('📋 Getting project members for project:', projectId);

    // Verify user has access to this project
    const { data: userAccess, error: accessError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .neq('status', 'removed')
      .single();

    // Also check if user is the project owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (!userAccess && (!project || project.owner_id !== userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a member of this project.'
      });
    }

    // Get all active members with user details
    const { data: members, error } = await supabase
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

    if (error) {
      console.error('Error fetching members:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project members'
      });
    }

    console.log('✅ Found', members?.length || 0, 'members');

    res.json({
      success: true,
      data: members || []
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

// Update a member's role
const updateMemberRole = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user.id;

    console.log('🔄 Updating member role:', memberId, 'to role:', role);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions - only owner or leads can update roles
    const isOwner = project.owner_id === userId;
    let canUpdate = isOwner;

    if (!isOwner) {
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      canUpdate = userMembership?.role === 'lead';
    }

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners or leads can update member roles.'
      });
    }

    // Update the member's role
    const { data: updatedMember, error: updateError } = await supabase
      .from('project_members')
      .update({ role: role })
      .eq('id', memberId)
      .eq('project_id', projectId)
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
      .single();

    if (updateError || !updatedMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found or update failed'
      });
    }

    console.log('✅ Member role updated successfully');

    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: { member: updatedMember }
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

// Remove a member from a project (FIXED - no more removed_at column)
const removeMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ Removing member:', memberId, 'from project:', projectId);

    // Verify project exists and get details
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, current_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get member details before removal
    const { data: memberToRemove, error: memberError } = await supabase
      .from('project_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('project_id', projectId)
      .neq('status', 'removed')
      .single();

    if (memberError || !memberToRemove) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check permissions
    const isOwner = project.owner_id === userId;
    const isRemovingSelf = memberToRemove.user_id === userId;
    let canRemove = isOwner || isRemovingSelf;

    if (!canRemove && !isOwner) {
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .single();

      // Leads can remove members (but not other leads unless they're owner)
      canRemove = userMembership?.role === 'lead' && memberToRemove.role === 'member';
    }

    if (!canRemove) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions to remove this member.'
      });
    }

    // FIXED: Only update status to 'removed' (no removed_at column in schema)
    const { error: removeError } = await supabase
      .from('project_members')
      .update({ 
        status: 'removed'
      })
      .eq('id', memberId);

    if (removeError) {
      console.error('Error removing member:', removeError);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove member from project'
      });
    }

    // Update project member count
    const newMemberCount = Math.max(1, (project.current_members || 1) - 1);
    await supabase
      .from('projects')
      .update({ current_members: newMemberCount })
      .eq('id', projectId);

    console.log('✅ Member removed successfully');

    res.json({
      success: true,
      message: 'Member removed from project successfully'
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

// Leave a project (for members) - FIXED: no more removed_at column
const leaveProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🚪 User leaving project:', projectId, 'user:', userId);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, current_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Owner cannot leave their own project
    if (project.owner_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Project owners cannot leave their own project. Transfer ownership or delete the project instead.'
      });
    }

    // Find user's membership
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .neq('status', 'removed')
      .single();

    if (memberError || !membership) {
      return res.status(404).json({
        success: false,
        message: 'You are not a member of this project'
      });
    }

    // FIXED: Only update status to 'removed' (no removed_at column in schema)
    const { error: leaveError } = await supabase
      .from('project_members')
      .update({ 
        status: 'removed'
      })
      .eq('id', membership.id);

    if (leaveError) {
      console.error('Error leaving project:', leaveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to leave project'
      });
    }

    // Update project member count
    const newMemberCount = Math.max(1, (project.current_members || 1) - 1);
    await supabase
      .from('projects')
      .update({ current_members: newMemberCount })
      .eq('id', projectId);

    console.log('✅ User left project successfully');

    res.json({
      success: true,
      message: 'You have successfully left the project'
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

// REMOVED: addProjectMember function as requested

module.exports = {
  getProjectMembers,
  updateMemberRole,
  removeMember,
  leaveProject
  // addProjectMember removed as requested
};