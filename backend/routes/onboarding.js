const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getProgrammingLanguages,
  getTopics,
  saveUserLanguages,
  saveUserTopics,
  updateUserExperience,
  completeOnboarding
} = require('../controllers/onboardingController');

// Public routes (no auth required)
router.get('/programming-languages', getProgrammingLanguages);
router.get('/topics', getTopics);

// Protected routes (auth required)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.post('/languages', saveUserLanguages);
router.post('/topics', saveUserTopics);
router.put('/experience', updateUserExperience);
router.post('/complete', completeOnboarding);

module.exports = router;