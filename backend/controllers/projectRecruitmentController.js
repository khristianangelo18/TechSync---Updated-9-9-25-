// backend/controllers/projectRecruitmentController.js
const supabase = require('../config/supabase');

// Get the active coding challenge for a project (for users wanting to join)
const getProjectChallenge = async (req, res) => {
  console.log('🎯 getProjectChallenge called for project:', req.params.projectId);
  
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('User ID:', userId);

    // Simple response for testing
    return res.json({
      success: true,
      message: 'Challenge endpoint is working!',
      data: {
        project: {
          id: projectId,
          title: 'Test Project',
          description: 'This is a test response to verify the endpoint is working',
          spotsRemaining: 5,
          primaryLanguage: 'JavaScript'
        },
        challenge: {
          id: `temp_${projectId}_${Date.now()}`,
          title: 'Test Challenge',
          description: 'This is a test challenge to verify the endpoint is working.\n\nWrite a simple function that returns "Hello, World!"',
          difficulty_level: 'easy',
          time_limit_minutes: 30,
          starter_code: 'function sayHello() {\n  // Your code here\n  \n}',
          programming_languages: { name: 'JavaScript' },
          isTemporary: true
        },
        isTemporaryChallenge: true
      }
    });

  } catch (error) {
    console.error('❌ Get project challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check if user can attempt a project challenge
const canAttemptChallenge = async (req, res) => {
  console.log('🎯 canAttemptChallenge called for project:', req.params.projectId);
  
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('User ID:', userId);

    // Simple response for testing
    res.json({
      success: true,
      message: 'Can attempt endpoint is working!',
      data: {
        canAttempt: true,
        message: 'You can attempt this challenge'
      }
    });

  } catch (error) {
    console.error('❌ Can attempt challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Submit a coding challenge attempt for project recruitment
const submitChallengeAttempt = async (req, res) => {
  console.log('🎯 submitChallengeAttempt called for project:', req.params.projectId);
  
  try {
    const { projectId } = req.params;
    const { submittedCode } = req.body;
    const userId = req.user.id;

    console.log('Challenge submission received:', { projectId, userId, codeLength: submittedCode?.length });

    // Simple response for testing
    res.json({
      success: true,
      message: 'Submit endpoint is working!',
      data: {
        attempt: {
          id: `test_attempt_${Date.now()}`,
          score: 85,
          status: 'passed'
        },
        evaluation: {
          score: 85,
          status: 'passed',
          passed_tests: 3,
          total_tests: 3,
          feedback: '✅ Test submission successful!'
        },
        projectJoined: true
      }
    });

  } catch (error) {
    console.error('❌ Submit challenge attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Placeholder functions for other required exports
const getUserAttempts = async (req, res) => {
  console.log('🎯 getUserAttempts called');
  res.json({
    success: true,
    data: { attempts: [], total: 0 }
  });
};

const getAttemptDetails = async (req, res) => {
  console.log('🎯 getAttemptDetails called');
  res.json({
    success: true,
    data: { attempt: null }
  });
};

const getUserStats = async (req, res) => {
  console.log('🎯 getUserStats called');
  res.json({
    success: true,
    data: { stats: {} }
  });
};

console.log('✅ projectRecruitmentController loaded successfully');

module.exports = {
  getProjectChallenge,
  submitChallengeAttempt,
  getUserAttempts,
  getAttemptDetails,
  getUserStats,
  canAttemptChallenge
};