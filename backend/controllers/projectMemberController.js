// backend/controllers/projectMemberController.js - COMPLETE VERSION
const supabase = require('../config/supabase');

// Get all members of a project
const getProjectMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🔍 Getting project members for:', projectId, 'requested by:', userId);

    // Verify project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, owner_id, created_at')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    const isOwner = project.owner_id === userId;
    let isMember = false;

    if (!isOwner) {
      const { data: membership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .neq('status', 'removed')
        .single();

      isMember = !!membership;
    }

    if (!isOwner && !isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be a project member to view members.'
      });
    }

    // Get project members - FIXED: Exclude owner from members list
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
      .neq('user_id', project.owner_id) // ✅ FIXED: Exclude owner from members
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

    // Get the project owner
    const { data: owner, error: ownerError } = await supabase
      .from('users')
      .select('id, username, full_name, email, avatar_url, years_experience, github_username')
      .eq('id', project.owner_id)
      .single();

    if (ownerError) {
      console.error('Error fetching owner:', ownerError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch project owner'
      });
    }

    // ✅ FIXED: Correct counting - owner + members (owner is not in members array)
    const actualMembers = members || [];
    const totalMembers = actualMembers.length + 1; // +1 for owner

    // Count by roles (excluding owner from role counts)
    const roleStats = {
      lead: actualMembers.filter(m => m.role === 'lead').length,
      moderator: actualMembers.filter(m => m.role === 'moderator').length, 
      member: actualMembers.filter(m => m.role === 'member').length
    };

    const result = {
      owner: owner,
      members: actualMembers,
      total_members: totalMembers,
      role_stats: roleStats
    };

    console.log(`✅ Found ${actualMembers.length} members + 1 owner = ${totalMembers} total`);
    console.log(`   Role breakdown: ${roleStats.lead} leads, ${roleStats.moderator} moderators, ${roleStats.member} members`);

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

    // Check permissions - only owner or admin can add members
    const isOwner = project.owner_id === userId;
    let canAddMembers = isOwner;

    if (!isOwner) {
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .neq('status', 'removed')
        .single();

      canAddMembers = userMembership?.role === 'lead' || userMembership?.role === 'moderator';
    }

    if (!canAddMembers) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only project owners, leads, or moderators can add members.'
      });
    }

    // Check if project has reached maximum members
    if (project.maximum_members && project.current_members >= project.maximum_members) {
      return res.status(400).json({
        success: false,
        message: 'Project has reached maximum member limit'
      });
    }

    // Verify the user to be added exists
    const { data: userToAdd, error: userError } = await supabase
      .from('users')
      .select('id, username, full_name, email')
      .eq('id', user_id)
      .single();

    if (userError || !userToAdd) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member or is the owner
    if (user_id === project.owner_id) {
      return res.status(400).json({
        success: false,
        message: 'User is already the project owner'
      });
    }

    const { data: existingMember } = await supabase
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
      }
      
      // Reactivate if they were previously removed
      const { data: updatedMember, error: updateError } = await supabase
        .from('project_members')
        .update({
          role: role,
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .eq('id', existingMember.id)
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

      if (updateError) {
        console.error('Error reactivating member:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to reactivate member'
        });
      }

      // Update project member count
      await supabase
        .from('projects')
        .update({ current_members: project.current_members + 1 })
        .eq('id', projectId);

      return res.status(200).json({
        success: true,
        message: 'Member reactivated successfully',
        data: { member: updatedMember }
      });
    }

    // Add new member
    const { data: newMember, error: insertError } = await supabase
      .from('project_members')
      .insert({
        project_id: projectId,
        user_id: user_id,
        role: role,
        status: 'active',
        joined_at: new Date().toISOString()
      })
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

    if (insertError) {
      console.error('Error adding member:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to add member to project',
        error: insertError.message
      });
    }

    // Update project member count
    await supabase
      .from('projects')
      .update({ current_members: (project.current_members || 1) + 1 })
      .eq('id', projectId);

    console.log('✅ Member added successfully');

    res.status(201).json({
      success: true,
      message: 'Member added to project successfully',
      data: { member: newMember }
    });

  } catch (error) {
    console.error('💥 Add member error:', error);
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

    // Verify project exists and get owner
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
    let canUpdateRoles = isOwner;

    if (!isOwner) {
      const { data: userMembership } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', userId)
        .neq('status', 'removed')
        .single();

      canUpdateRoles = userMembership?.role === 'lead';
    }

    if (!canUpdateRoles) {
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

// Remove a member from a project
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

    // Remove member (soft delete by setting status to removed)
    const { error: removeError } = await supabase
      .from('project_members')
      .update({ 
        status: 'removed',
        removed_at: new Date().toISOString()
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

// Leave a project (for members)
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

    // Remove user from project
    const { error: leaveError } = await supabase
      .from('project_members')
      .update({ 
        status: 'removed',
        removed_at: new Date().toISOString()
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

module.exports = {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject
};