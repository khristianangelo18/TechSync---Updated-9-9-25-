// backend/routes/projects.js
const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');

// Import controllers
const {
  createProject,
  getProjects,
  getProjectById,
  getUserProjects,
  deleteProject
} = require('../controllers/projectController');

// Import middleware - Fixed path
const authMiddleware = require('../middleware/auth');

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

// Validation rules for creating projects
const createProjectValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  body('detailed_description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Detailed description must not exceed 2000 characters'),
  
  body('required_experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  
  body('maximum_members')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Maximum members must be between 1 and 50'),
  
  body('estimated_duration_weeks')
    .optional()
    .isInt({ min: 1, max: 104 })
    .withMessage('Duration must be between 1 and 104 weeks'),
  
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  body('github_repo_url')
    .optional()
    .isURL()
    .withMessage('Invalid GitHub repository URL'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline date format'),
  
  body('programming_languages')
    .optional()
    .isArray()
    .withMessage('Programming languages must be an array'),
  
  body('programming_languages.*')
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each programming language must be a valid string'),
  
  body('topics')
    .optional()
    .isArray()
    .withMessage('Topics must be an array'),
  
  body('topics.*')
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('Each topic must be a valid string')
];

// Validation rules for getting projects
const getProjectsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('status')
    .optional()
    .isIn(['recruiting', 'active', 'completed', 'paused', 'cancelled'])
    .withMessage('Invalid project status'),
  
  query('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  query('required_experience_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

// Project ID validation
const projectIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid project ID format')
];

// Routes

// GET /api/projects - Get all projects (public, with filters)
router.get('/', getProjectsValidation, handleValidationErrors, getProjects);

// GET /api/projects/:id - Get specific project by ID (public)
router.get('/:id', projectIdValidation, handleValidationErrors, getProjectById);

// Protected routes (require authentication)
router.use(authMiddleware);

// POST /api/projects - Create new project
router.post('/', createProjectValidation, handleValidationErrors, createProject);

// GET /api/projects/user/my - Get current user's projects
router.get('/user/my', getUserProjects);

// DELETE /api/projects/:id - Delete project (only by owner)
router.delete('/:id', projectIdValidation, handleValidationErrors, deleteProject);

module.exports = router;