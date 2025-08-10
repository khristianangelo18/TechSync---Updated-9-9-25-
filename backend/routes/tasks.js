// backend/routes/tasks.js
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getTaskStats
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/auth'); // FIXED: Changed from authMiddleware to auth

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

const taskIdValidation = [
  param('taskId')
    .isUUID()
    .withMessage('Task ID must be a valid UUID')
];

const createTaskValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('task_type')
    .optional()
    .isIn(['development', 'design', 'testing', 'documentation', 'research', 'meeting', 'review'])
    .withMessage('Invalid task type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'in_review', 'completed', 'blocked'])
    .withMessage('Invalid status'),
  
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid user ID'),
  
  body('estimated_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer'),
  
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const updateTaskValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  
  body('task_type')
    .optional()
    .isIn(['development', 'design', 'testing', 'documentation', 'research', 'meeting', 'review'])
    .withMessage('Invalid task type'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'in_review', 'completed', 'blocked'])
    .withMessage('Invalid status'),
  
  body('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to must be a valid user ID'),
  
  body('estimated_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Estimated hours must be a positive integer'),
  
  body('actual_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Actual hours must be a positive integer'),
  
  body('due_date')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const getTasksValidation = [
  query('sort_by')
    .optional()
    .isIn(['created_at', 'updated_at', 'due_date', 'priority', 'status', 'title'])
    .withMessage('Invalid sort field'),
  
  query('sort_order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['todo', 'in_progress', 'in_review', 'completed', 'blocked'])
    .withMessage('Invalid status filter'),
  
  query('assigned_to')
    .optional()
    .isUUID()
    .withMessage('Assigned to filter must be a valid user ID'),
  
  query('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority filter')
];

// All routes require authentication
router.use(authMiddleware);

// GET /api/projects/:projectId/tasks - Get all tasks for a project
router.get(
  '/:projectId/tasks',
  projectIdValidation,
  getTasksValidation,
  handleValidationErrors,
  getProjectTasks
);

// POST /api/projects/:projectId/tasks - Create a new task
router.post(
  '/:projectId/tasks',
  projectIdValidation,
  createTaskValidation,
  handleValidationErrors,
  createTask
);

// GET /api/projects/:projectId/tasks/stats - Get task statistics
router.get(
  '/:projectId/tasks/stats',
  projectIdValidation,
  handleValidationErrors,
  getTaskStats
);

// GET /api/projects/:projectId/tasks/:taskId - Get a specific task
router.get(
  '/:projectId/tasks/:taskId',
  projectIdValidation,
  taskIdValidation,
  handleValidationErrors,
  getTask
);

// PUT /api/projects/:projectId/tasks/:taskId - Update a task
router.put(
  '/:projectId/tasks/:taskId',
  projectIdValidation,
  taskIdValidation,
  updateTaskValidation,
  handleValidationErrors,
  updateTask
);

// DELETE /api/projects/:projectId/tasks/:taskId - Delete a task
router.delete(
  '/:projectId/tasks/:taskId',
  projectIdValidation,
  taskIdValidation,
  handleValidationErrors,
  deleteTask
);

module.exports = router;