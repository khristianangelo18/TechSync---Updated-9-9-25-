// backend/controllers/projectRecruitmentController.js - COMPLETELY FIXED
// Enhanced with alert system while preserving YOUR EXACT working structure
const supabase = require('../config/supabase');

// NEW: Helper function to count user's failed attempts for a specific project
const getFailedAttemptsCount = async (userId, projectId) => {
  try {
    const { data: failedAttempts, error } = await supabase
      .from('challenge_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .eq('status', 'failed');

    if (error) {
      console.error('Error counting failed attempts:', error);
      return 0;
    }

    return failedAttempts ? failedAttempts.length : 0;
  } catch (error) {
    console.error('Error in getFailedAttemptsCount:', error);
    return 0;
  }
};

// NEW: Helper function to generate comforting messages based on attempt count
const generateComfortingMessage = (attemptCount, projectTitle) => {
  const messages = [
    {
      threshold: 7,
      message: `It seems like you're having a hard time entering the "${projectTitle}" project and answering the challenge. Don't worry, coding challenges can be tricky! Consider reviewing the requirements again, or perhaps this project might be more advanced than your current skill level. Keep practicing and you'll get there! 💪`
    },
    {
      threshold: 10,
      message: `We notice you've been persistently trying to join "${projectTitle}". Your determination is admirable! However, you might want to take a short break, review some coding tutorials, or try some easier projects first. Remember, every expert was once a beginner! 🌟`
    },
    {
      threshold: 15,
      message: `You've made ${attemptCount} attempts at "${projectTitle}" - that shows incredible persistence! Sometimes it helps to step back and approach the problem from a different angle. Consider reaching out to the community for tips, or exploring similar but simpler projects to build your confidence. You've got this! 🚀`
    }
  ];

  // Find the appropriate message based on attempt count
  for (let i = messages.length - 1; i >= 0; i--) {
    if (attemptCount >= messages[i].threshold) {
      return messages[i].message;
    }
  }

  return null;
};

// GET /api/challenges/project/:projectId/challenge - FOLLOWING YOUR WORKING APPROACH
const getProjectChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log(`\n=== GET PROJECT CHALLENGE ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);

    // Step 1: Get project with basic info (EXACTLY like your working version)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project query error:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        error: projectError.message
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    console.log(`Found project: ${project.title}`);

    // Step 2: Get project languages (EXACTLY like your working version)
    const { data: projectLanguages, error: languageError } = await supabase
      .from('project_languages')
      .select(`
        language_id,
        is_primary,
        programming_languages (
          id,
          name
        )
      `)
      .eq('project_id', projectId);

    if (languageError) {
      console.error('Project languages query error:', languageError);
      return res.status(500).json({
        success: false,
        message: 'Error fetching project languages',
        error: languageError.message,
        debug: {
          projectId,
          query: 'project_languages with programming_languages join'
        }
      });
    }

    console.log('Raw project languages:', JSON.stringify(projectLanguages, null, 2));

    // Add languages to project object
    project.project_languages = projectLanguages || [];

    // Check if project has available spots
    if (project.current_members >= project.maximum_members) {
      return res.status(400).json({
        success: false,
        message: 'Project has reached maximum capacity'
      });
    }

    // Step 3: Process project languages (EXACTLY like your working version)
    const validLanguages = project.project_languages.filter(
      pl => pl.language_id && pl.programming_languages
    );

    if (validLanguages.length === 0) {
      console.log('No valid programming languages found for project');
      return res.status(400).json({
        success: false,
        message: 'This project has no programming languages configured. Please contact the project owner.',
        debug: {
          projectId,
          rawLanguages: project.project_languages,
          projectTitle: project.title
        }
      });
    }

    const projectLanguageIds = validLanguages.map(pl => pl.language_id);
    const primaryLanguage = validLanguages.find(pl => pl.is_primary)?.programming_languages ||
                            validLanguages[0]?.programming_languages;

    console.log(`Project language IDs: [${projectLanguageIds.join(', ')}]`);
    console.log(`Primary language: ${primaryLanguage?.name || 'None'}`);

    // Step 4: Find matching challenges (EXACTLY like your working version)
    let selectedChallenge = null;
    let availableChallenges = [];

    try {
      // First: Look for project-specific challenges
      console.log('Searching for project-specific challenges...');
      const { data: projectChallenges, error: projectChallengeError } = await supabase
        .from('coding_challenges')
        .select(`
          id, title, description, difficulty_level, time_limit_minutes,
          starter_code, test_cases, programming_language_id,
          programming_languages (id, name)
        `)
        .eq('project_id', projectId)
        .in('programming_language_id', projectLanguageIds)
        .eq('is_active', true);

      if (projectChallengeError) {
        console.error('Project-specific challenges error:', projectChallengeError);
      } else {
        console.log(`Found ${projectChallenges?.length || 0} project-specific challenges`);
        if (projectChallenges && projectChallenges.length > 0) {
          availableChallenges = projectChallenges;
        }
      }

      // Second: If no project-specific challenges, look for general challenges
      if (availableChallenges.length === 0) {
        console.log('Searching for general challenges...');
        const { data: generalChallenges, error: generalChallengeError } = await supabase
          .from('coding_challenges')
          .select(`
            id, title, description, difficulty_level, time_limit_minutes,
            starter_code, test_cases, programming_language_id,
            programming_languages (id, name)
          `)
          .is('project_id', null)
          .in('programming_language_id', projectLanguageIds)
          .eq('is_active', true);

        if (generalChallengeError) {
          console.error('General challenges error:', generalChallengeError);
        } else {
          console.log(`Found ${generalChallenges?.length || 0} general challenges`);
          if (generalChallenges && generalChallenges.length > 0) {
            availableChallenges = generalChallenges;
          }
        }
      }

      // Step 5: Select a challenge (EXACTLY like your working version)
      if (availableChallenges.length > 0) {
        // Prefer primary language challenges
        const primaryLanguageChallenges = primaryLanguage 
          ? availableChallenges.filter(c => c.programming_language_id === primaryLanguage.id)
          : [];

        if (primaryLanguageChallenges.length > 0) {
          const randomIndex = Math.floor(Math.random() * primaryLanguageChallenges.length);
          selectedChallenge = primaryLanguageChallenges[randomIndex];
          console.log(`Selected primary language challenge: ${selectedChallenge.title}`);
        } else {
          const randomIndex = Math.floor(Math.random() * availableChallenges.length);
          selectedChallenge = availableChallenges[randomIndex];
          console.log(`Selected available challenge: ${selectedChallenge.title}`);
        }
      } else {
        // No challenges found - create a basic temporary one (EXACTLY like your working version)
        console.log('No challenges found, creating temporary challenge');
        const languageForChallenge = primaryLanguage || validLanguages[0].programming_languages;
        
        selectedChallenge = {
          id: `temp_${projectId}_${Date.now()}`,
          title: `${languageForChallenge.name} Coding Challenge`,
          description: `Welcome to "${project.title}"!\n\nThis project uses ${languageForChallenge.name}. Please complete this coding challenge to demonstrate your skills.\n\n**Task:** Write a function that demonstrates your ${languageForChallenge.name} programming skills.\n\n**Requirements:**\n1. Write clean, readable code\n2. Handle edge cases appropriately\n3. Add meaningful comments\n4. Follow best practices for ${languageForChallenge.name}\n\n**Example Challenge:**\nCreate a function that solves a common programming problem using ${languageForChallenge.name}.\n\nGood luck!`,
          difficulty_level: 'medium',
          time_limit_minutes: 60,
          starter_code: getStarterCodeForLanguage(languageForChallenge.name),
          test_cases: null,
          programming_language_id: languageForChallenge.id,
          programming_languages: languageForChallenge,
          isTemporary: true
        };
        
        console.log('Created temporary challenge for:', languageForChallenge.name);
      }

    } catch (challengeError) {
      console.error('Error in challenge selection:', challengeError);
      return res.status(500).json({
        success: false,
        message: 'Error retrieving coding challenges',
        error: challengeError.message
      });
    }

    // Step 6: Return the response (EXACTLY like your working version)
    if (!selectedChallenge) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate a coding challenge'
      });
    }

    const response = {
      success: true,
      challenge: selectedChallenge,
      project: {
        id: project.id,
        title: project.title,
        description: project.description,
        primaryLanguage: primaryLanguage?.name || 'Unknown',
        availableSpots: project.maximum_members - project.current_members
      }
    };

    console.log(`=== RESPONSE ===`);
    console.log(`Challenge: ${selectedChallenge.title}`);
    console.log(`Language: ${selectedChallenge.programming_languages?.name}`);
    console.log(`Temporary: ${selectedChallenge.isTemporary || false}`);

    return res.json(response);

  } catch (error) {
    console.error('Error in getProjectChallenge:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// GET /api/challenges/project/:projectId/can-attempt - ENHANCED with alert system
const canAttemptChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log(`\n=== CAN ATTEMPT CHECK ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);

    // Check if user is already a member (EXACTLY like your working version)
    const { data: membership, error: membershipError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('Membership check error:', membershipError);
      return res.status(500).json({
        success: false,
        message: 'Error checking membership status'
      });
    }

    if (membership) {
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'You are already a member of this project'
      });
    }

    // NEW: Check failed attempts count for alert system
    const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);
    console.log(`Failed attempts count: ${failedAttemptsCount}`);

    // Get project details for comforting message
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('title, current_members, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project check error:', projectError);
    }

    const projectTitle = project?.title || 'this project';

    // Check if alert should be shown (7 or more failed attempts)
    const shouldShowAlert = failedAttemptsCount >= 7;
    const comfortingMessage = shouldShowAlert ? 
      generateComfortingMessage(failedAttemptsCount, projectTitle) : null;

    // Check recent attempts (EXACTLY like your working version)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: attemptError } = await supabase
      .from('challenge_attempts')
      .select('started_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .gte('started_at', oneHourAgo)
      .order('started_at', { ascending: false })
      .limit(1);

    if (attemptError) {
      console.error('Recent attempts check error:', attemptError);
      return res.status(500).json({
        success: false,
        message: 'Error checking recent attempts'
      });
    }

    if (recentAttempts && recentAttempts.length > 0) {
      const lastAttempt = new Date(recentAttempts[0].started_at);
      const nextAttemptTime = new Date(lastAttempt.getTime() + 60 * 60 * 1000);
      
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'You can only attempt once per hour',
        nextAttemptAt: nextAttemptTime.toISOString(),
        // NEW: Include alert data even when rate limited
        alertData: shouldShowAlert ? {
          shouldShow: true,
          attemptCount: failedAttemptsCount,
          message: comfortingMessage
        } : null
      });
    }

    // Check if project has available spots (EXACTLY like your working version)
    if (project && project.current_members >= project.maximum_members) {
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'Project has reached maximum capacity',
        // NEW: Include alert data even when project is full
        alertData: shouldShowAlert ? {
          shouldShow: true,
          attemptCount: failedAttemptsCount,
          message: comfortingMessage
        } : null
      });
    }

    return res.json({
      success: true,
      canAttempt: true,
      reason: 'You can attempt this challenge',
      // NEW: Include alert data when user can attempt
      alertData: shouldShowAlert ? {
        shouldShow: true,
        attemptCount: failedAttemptsCount,
        message: comfortingMessage
      } : null
    });

  } catch (error) {
    console.error('Error in canAttemptChallenge:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// POST /api/challenges/project/:projectId/attempt - ENHANCED with alert tracking
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedCode, startedAt, challengeId } = req.body;
    const userId = req.user.id;

    console.log(`\n=== SUBMIT CHALLENGE ATTEMPT ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Challenge ID: ${challengeId || 'temporary'}`);

    // Enhanced input validation (EXACTLY like your working version)
    if (!submittedCode || submittedCode.trim().length < 10) {
      return res.status(200).json({
        success: true,
        data: {
          attempt: null,
          score: 0,
          passed: false,
          projectJoined: false,
          feedback: "Your solution is too short. Please provide a more complete solution.",
          status: 'failed'
        }
      });
    }

    // Check if user can attempt (EXACTLY like your working version)
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return res.status(200).json({
        success: true,
        data: {
          attempt: null,
          score: 0,
          passed: false,
          projectJoined: false,
          feedback: "You are already a member of this project.",
          status: 'already_member'
        }
      });
    }

    // Get project details for context-aware scoring (EXACTLY like your working version)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        project_languages (
          language_id,
          is_primary,
          programming_languages (id, name)
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Enhanced scoring with stricter validation (EXACTLY like your working version)
    const evaluationResult = evaluateCodeSubmission(submittedCode, project);
    const score = evaluationResult.score;
    const passed = score >= 70; // 70% threshold

    console.log(`Evaluation result: Score=${score}, Passed=${passed}`);
    console.log(`Evaluation details:`, evaluationResult);

    // Store the attempt (EXACTLY like your working version)
    const attemptData = {
      user_id: userId,
      project_id: projectId,
      submitted_code: submittedCode,
      score: score,
      status: passed ? 'passed' : 'failed',
      started_at: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
      submitted_at: new Date().toISOString(),
      feedback: evaluationResult.feedback
    };

    if (challengeId && !challengeId.startsWith('temp_')) {
      attemptData.challenge_id = challengeId;
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert(attemptData)
      .select()
      .single();

    if (attemptError) {
      console.error('Error storing attempt:', attemptError);
      return res.status(200).json({
        success: true,
        data: {
          attempt: null,
          score: score,
          passed: false,
          projectJoined: false,
          feedback: "Your solution was evaluated but there was an issue saving the attempt. Please try again.",
          status: 'failed'
        }
      });
    }

    let projectJoined = false;
    let membershipData = null;

    // If passed, add user to project (EXACTLY like your working version)
    if (passed) {
      console.log('🎉 User passed! Adding to project...');
      
      const { data: newMember, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: 'member',
          status: 'active'
        })
        .select()
        .single();

      if (memberError) {
        console.error('❌ Error adding member:', memberError);
      } else {
        projectJoined = true;
        membershipData = newMember;
        console.log('✅ User added to project as member');

        try {
          await supabase.rpc('increment_project_member_count', { 
            project_uuid: projectId 
          });
          console.log('✅ Project member count updated');
        } catch (updateError) {
          console.error('❌ Error updating member count:', updateError);
        }
      }
    }

    // NEW: If failed, check for alert system
    let alertData = null;
    if (!passed) {
      const failedAttemptsCount = await getFailedAttemptsCount(userId, projectId);
      console.log(`Total failed attempts after this attempt: ${failedAttemptsCount}`);
      
      if (failedAttemptsCount >= 7) {
        const comfortingMessage = generateComfortingMessage(failedAttemptsCount, project.title);
        alertData = {
          shouldShow: true,
          attemptCount: failedAttemptsCount,
          message: comfortingMessage
        };
      }
    }

    // Always return success with evaluation results (EXACTLY like your working version + alertData)
    const response = {
      success: true,
      data: {
        attempt: attempt,
        score: score,
        passed: passed,
        projectJoined: projectJoined,
        feedback: evaluationResult.feedback,
        membership: membershipData,
        status: passed ? 'passed' : 'failed',
        evaluation: evaluationResult,
        alertData: alertData // NEW: Include alert data for failed attempts
      }
    };

    console.log('📤 Sending response:', {
      passed,
      projectJoined,
      score,
      alertData: alertData ? `Alert for ${alertData.attemptCount} attempts` : 'No alert',
      feedback: evaluationResult.feedback.substring(0, 50) + '...'
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error in submitChallengeAttempt:', error);
    
    res.status(200).json({
      success: true,
      data: {
        attempt: null,
        score: 0,
        passed: false,
        projectJoined: false,
        feedback: "There was an issue evaluating your solution. Please check your code and try again.",
        status: 'error'
      }
    });
  }
};

// ALL YOUR EXISTING EVALUATION FUNCTIONS - EXACTLY THE SAME
function evaluateCodeSubmission(code, project) {
  const trimmedCode = code.trim();
  let score = 0;
  let feedback = "";
  const details = {
    hasFunction: false,
    hasLogic: false,
    hasComments: false,
    properStructure: false,
    languageMatch: false,
    complexity: 0
  };

  // Basic validation - code must be substantial
  if (trimmedCode.length < 20) {
    return {
      score: 0,
      feedback: "Your solution is too short. Please provide a more complete implementation.",
      details
    };
  }

  // Check for obvious test/placeholder content
  const placeholderPatterns = [
    /todo/i,
    /placeholder/i,
    /your code here/i,
    /implement/i,
    /test/i,
    /hello world/i,
    /console\.log\s*\(\s*["'][^"']*["']\s*\)/i // Simple console.log statements
  ];

  const isPlaceholder = placeholderPatterns.some(pattern => pattern.test(trimmedCode));
  if (isPlaceholder && trimmedCode.length < 100) {
    return {
      score: 15,
      feedback: "Your solution appears to contain placeholder code. Please implement a proper solution.",
      details
    };
  }

  // Language-specific validation
  const projectLanguages = project.project_languages || [];
  const primaryLanguage = projectLanguages.find(pl => pl.is_primary)?.programming_languages?.name?.toLowerCase();
  
  let languageScore = 0;
  if (primaryLanguage) {
    details.languageMatch = checkLanguageMatch(trimmedCode, primaryLanguage);
    if (details.languageMatch) {
      languageScore = 20;
      score += 20;
    }
  } else {
    // If no primary language specified, give partial credit for any recognized language
    if (hasAnyProgrammingLanguageFeatures(trimmedCode)) {
      languageScore = 15;
      score += 15;
    }
  }

  // Function/method definition check (crucial for most challenges)
  const functionPatterns = [
    /function\s+\w+/i,           // JavaScript function
    /def\s+\w+/i,                // Python function
    /\w+\s*\([^)]*\)\s*{/,       // C/C++/Java/C# method
    /=>\s*{?/,                   // Arrow function
    /public\s+\w+\s+\w+/i,       // Java/C# public method
    /fn\s+\w+/i                  // Rust function
  ];

  details.hasFunction = functionPatterns.some(pattern => pattern.test(trimmedCode));
  if (details.hasFunction) {
    score += 25;
  }

  // Logic and control structures
  const logicPatterns = [
    /if\s*\(/i,
    /for\s*\(/i,
    /while\s*\(/i,
    /switch\s*\(/i,
    /elif\s*:/i,
    /else\s*:/i,
    /return\s+\w/i
  ];

  details.hasLogic = logicPatterns.some(pattern => pattern.test(trimmedCode));
  if (details.hasLogic) {
    score += 20;
  }

  // Comments and documentation
  const commentPatterns = [
    /\/\/[^\n]+/,                // Single line comments
    /\/\*[\s\S]*?\*\//,          // Multi-line comments
    /#[^\n]+/,                   // Python/Shell comments
    /"""[\s\S]*?"""/,            // Python docstrings
    /'''[\s\S]*?'''/             // Python docstrings
  ];

  details.hasComments = commentPatterns.some(pattern => pattern.test(trimmedCode));
  if (details.hasComments) {
    score += 10;
  }

  // Code complexity and structure
  const complexityIndicators = [
    /\{[\s\S]*\}/,               // Blocks of code
    /\[[\s\S]*\]/,               // Arrays/lists
    /\w+\.\w+/,                  // Object/method access
    /[=+\-*/%]/,                 // Mathematical operations
    /&&|\|\||and|or/i            // Logical operators
  ];

  details.complexity = complexityIndicators.filter(pattern => pattern.test(trimmedCode)).length;
  score += Math.min(details.complexity * 3, 15); // Up to 15 points for complexity

  // Code structure (indentation, proper formatting)
  const lines = trimmedCode.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  const indentedLines = lines.filter(line => /^\s+/.test(line));
  
  details.properStructure = nonEmptyLines.length >= 3 && (indentedLines.length / nonEmptyLines.length) > 0.3;
  if (details.properStructure) {
    score += 10;
  }

  // Prevent extremely high scores for trivial code
  if (trimmedCode.length < 50 && score > 40) {
    score = Math.min(score, 40);
  }

  // Generate feedback based on evaluation
  feedback = generateDetailedFeedback(score, details, primaryLanguage);

  return {
    score: Math.max(0, Math.min(100, score)),
    feedback,
    details
  };
}

function checkLanguageMatch(code, language) {
  const languagePatterns = {
    'javascript': [
      /function\s+\w+/i,
      /=>\s*{?/,
      /const\s+\w+/i,
      /let\s+\w+/i,
      /var\s+\w+/i,
      /console\.log/i
    ],
    'python': [
      /def\s+\w+/i,
      /import\s+\w+/i,
      /print\s*\(/i,
      /if\s+.*:/,
      /for\s+\w+\s+in/i,
      /class\s+\w+/i
    ],
    'java': [
      /public\s+class/i,
      /public\s+static\s+void\s+main/i,
      /System\.out\.println/i,
      /public\s+\w+\s+\w+\s*\(/i
    ],
    'c++': [
      /#include\s*</i,
      /using\s+namespace/i,
      /int\s+main\s*\(/i,
      /cout\s*<</i,
      /std::/i
    ],
    'c#': [
      /using\s+System/i,
      /public\s+class/i,
      /Console\.WriteLine/i,
      /static\s+void\s+Main/i
    ]
  };

  const patterns = languagePatterns[language.toLowerCase()];
  if (!patterns) return false;

  return patterns.some(pattern => pattern.test(code));
}

function hasAnyProgrammingLanguageFeatures(code) {
  const generalPatterns = [
    /function\s+\w+/i,
    /def\s+\w+/i,
    /public\s+class/i,
    /if\s*\(/i,
    /for\s*\(/i,
    /while\s*\(/i,
    /return\s+/i,
    /=>\s*{?/,
    /#include/i,
    /import\s+/i
  ];

  return generalPatterns.some(pattern => pattern.test(code));
}

function generateDetailedFeedback(score, details, primaryLanguage) {
  let feedback = "";

  if (score >= 80) {
    feedback = "🎉 Excellent work! Your solution demonstrates strong programming skills with proper structure and logic.";
  } else if (score >= 70) {
    feedback = "✅ Good job! Your solution meets the requirements and shows solid programming understanding.";
  } else if (score >= 50) {
    feedback = "⚠️ Your solution shows some programming knowledge but needs improvement. ";
    
    const suggestions = [];
    if (!details.hasFunction) {
      suggestions.push("Consider defining proper functions or methods");
    }
    if (!details.hasLogic) {
      suggestions.push("Add conditional logic and control structures");
    }
    if (primaryLanguage && !details.languageMatch) {
      suggestions.push(`Use ${primaryLanguage} syntax and features`);
    }
    if (!details.properStructure) {
      suggestions.push("Improve code formatting and structure");
    }
    
    if (suggestions.length > 0) {
      feedback += "Try to: " + suggestions.slice(0, 2).join(", ") + ".";
    }
  } else if (score >= 25) {
    feedback = "❌ Your solution needs significant improvement. Make sure to write a complete, functional solution that addresses the problem requirements.";
  } else {
    feedback = "❌ Your solution appears to be incomplete or incorrect. Please review the challenge requirements and implement a proper solution with functions, logic, and appropriate syntax.";
  }

  return feedback;
}

// Helper Functions (EXACTLY like your working version)
function getStarterCodeForLanguage(languageName) {
  const starterCodes = {
    'JavaScript': '// Your JavaScript solution here\nfunction solution() {\n    // TODO: Implement your solution\n    return null;\n}',
    'Python': '# Your Python solution here\ndef solution():\n    # TODO: Implement your solution\n    pass',
    'Java': '// Your Java solution here\npublic class Solution {\n    public static void main(String[] args) {\n        // TODO: Implement your solution\n    }\n}',
    'C++': '// Your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // TODO: Implement your solution\n    return 0;\n}',
    'C#': '// Your C# solution here\nusing System;\n\nclass Program {\n    static void Main() {\n        // TODO: Implement your solution\n    }\n}',
    'Go': '// Your Go solution here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    // TODO: Implement your solution\n}',
    'Rust': '// Your Rust solution here\nfn main() {\n    // TODO: Implement your solution\n}',
    'TypeScript': '// Your TypeScript solution here\nfunction solution(): any {\n    // TODO: Implement your solution\n    return null;\n}'
  };

  return starterCodes[languageName] || `// Your ${languageName} solution here\n// TODO: Implement your solution`;
}

function calculateCodeScore(code) {
  let score = 50; // Base score

  // Simple heuristics for code quality
  if (code.length > 100) score += 10;
  if (code.includes('function') || code.includes('def') || code.includes('class')) score += 15;
  if (code.includes('//') || code.includes('#') || code.includes('/*')) score += 10; // Comments
  if (code.includes('if') || code.includes('for') || code.includes('while')) score += 10; // Control structures
  if (code.includes('return')) score += 5;

  // Bonus for proper structure
  const lines = code.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 5) score += 10;

  return Math.min(100, Math.max(20, score)); // Clamp between 20-100
}

function generateFeedback(score, passed) {
  if (passed) {
    if (score >= 90) return "Excellent work! Your solution demonstrates strong programming skills.";
    if (score >= 80) return "Great job! Your solution is solid and well-structured.";
    return "Good work! Your solution meets the requirements.";
  } else {
    if (score >= 60) return "Close! Your solution shows promise but needs some improvements.";
    if (score >= 40) return "Keep practicing! Your solution has some good elements but needs work.";
    return "Don't give up! Consider reviewing the requirements and trying again.";
  }
}

module.exports = {
  getProjectChallenge,
  canAttemptChallenge,
  submitChallengeAttempt,
  getFailedAttemptsCount,
  generateComfortingMessage
};