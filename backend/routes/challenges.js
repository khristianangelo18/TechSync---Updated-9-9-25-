// backend/routes/challenges.js
const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');

// Import controllers
const {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  getChallengesByLanguage
} = require('../controllers/challengeController');

// Import middleware
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

// Validation rules
const createChallengeValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('difficulty_level')
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('time_limit_minutes')
    .isInt({ min: 5, max: 300 })
    .withMessage('Time limit must be between 5 and 300 minutes'),
  
  body('programming_language_id')
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  body('project_id')
    .optional()
    .isUUID()
    .withMessage('Project ID must be a valid UUID'),
  
  body('starter_code')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Starter code must be less than 10000 characters'),
  
  body('expected_solution')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Expected solution must be less than 10000 characters'),
  
  body('test_cases')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          throw new Error('Test cases must be valid JSON');
        }
      }
      return true;
    })
];

const updateChallengeValidation = [
  param('id')
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be between 1 and 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Difficulty level must be easy, medium, hard, or expert'),
  
  body('time_limit_minutes')
    .optional()
    .isInt({ min: 5, max: 300 })
    .withMessage('Time limit must be between 5 and 300 minutes'),
  
  body('programming_language_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  body('starter_code')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Starter code must be less than 10000 characters'),
  
  body('expected_solution')
    .optional()
    .isLength({ max: 10000 })
    .withMessage('Expected solution must be less than 10000 characters'),
  
  body('test_cases')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch (error) {
          throw new Error('Test cases must be valid JSON');
        }
      }
      return true;
    })
];

const getChallengesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  
  query('difficulty_level')
    .optional()
    .isIn(['easy', 'medium', 'hard', 'expert'])
    .withMessage('Invalid difficulty level'),
  
  query('programming_language_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Programming language ID must be a positive integer'),
  
  query('created_by')
    .optional()
    .isUUID()
    .withMessage('Created by must be a valid UUID'),
  
  query('project_id')
    .optional()
    .custom((value) => {
      if (value !== 'null' && !value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        throw new Error('Project ID must be a valid UUID or "null"');
      }
      return true;
    }),
  
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

const challengeIdValidation = [
  param('id')
    .isUUID()
    .withMessage('Challenge ID must be a valid UUID')
];

const languageIdValidation = [
  param('languageId')
    .isInt({ min: 1 })
    .withMessage('Language ID must be a positive integer')
];

// PUBLIC ROUTES (no authentication required)

// GET /api/challenges - Get all challenges with filters
router.get('/', getChallengesValidation, handleValidationErrors, getChallenges);

// GET /api/challenges/:id - Get specific challenge by ID
router.get('/:id', challengeIdValidation, handleValidationErrors, getChallengeById);

// GET /api/challenges/language/:languageId - Get challenges by programming language
router.get('/language/:languageId', 
  languageIdValidation, 
  handleValidationErrors, 
  getChallengesByLanguage
);

// PROTECTED ROUTES (require authentication)
router.use(authMiddleware);

// POST /api/challenges - Create new challenge
router.post('/', createChallengeValidation, handleValidationErrors, createChallenge);

// PUT /api/challenges/:id - Update challenge
router.put('/:id', updateChallengeValidation, handleValidationErrors, updateChallenge);

// DELETE /api/challenges/:id - Delete challenge
router.delete('/:id', challengeIdValidation, handleValidationErrors, deleteChallenge);

module.exports = router;