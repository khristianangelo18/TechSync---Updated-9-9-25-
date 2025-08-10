// backend/routes/projectMembers.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  getProjectMembers,
  addProjectMember,
  updateMemberRole,
  removeMember,
  leaveProject
} = require('../controllers/projectMemberController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation rules
const projectIdValidation = [
  param('projectId')
    .isUUID()
    .withMessage('Project ID must be a valid UUID')
];

const memberIdValidation = [
  param('memberId')
    .isUUID()
    .withMessage('Member ID must be a valid UUID')
];

const addMemberValidation = [
  body('user_id')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  body('role')
    .optional()
    .isIn(['member', 'moderator', 'lead'])
    .withMessage('Role must be one of: member, moderator, lead')
];

const updateRoleValidation = [
  body('role')
    .isIn(['member', 'moderator', 'lead'])
    .withMessage('Role must be one of: member, moderator, lead')
];

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects/:projectId/members - Get all members of a project
router.get(
  '/:projectId/members',
  projectIdValidation,
  handleValidationErrors,
  getProjectMembers
);

// POST /api/projects/:projectId/members - Add a member to a project
router.post(
  '/:projectId/members',
  projectIdValidation,
  addMemberValidation,
  handleValidationErrors,
  addProjectMember
);

// PUT /api/projects/:projectId/members/:memberId/role - Update a member's role
router.put(
  '/:projectId/members/:memberId/role',
  projectIdValidation,
  memberIdValidation,
  updateRoleValidation,
  handleValidationErrors,
  updateMemberRole
);

// DELETE /api/projects/:projectId/members/:memberId - Remove a member from a project
router.delete(
  '/:projectId/members/:memberId',
  projectIdValidation,
  memberIdValidation,
  handleValidationErrors,
  removeMember
);

// POST /api/projects/:projectId/leave - Leave a project (for members)
router.post(
  '/:projectId/leave',
  projectIdValidation,
  handleValidationErrors,
  leaveProject
);

module.exports = router;