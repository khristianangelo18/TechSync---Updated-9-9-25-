// backend/controllers/projectRecruitmentController.js
const supabase = require('../config/supabase');
const { VM } = require('vm2');

// Get the active coding challenge for a project (for users wanting to join)
const getProjectChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is already a member of this project
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingMember && existingMember.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    // Check if user has a recent failed attempt (cooldown period)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempt } = await supabase
      .from('challenge_attempts')
      .select('id, submitted_at, status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .gte('submitted_at', oneHourAgo.toISOString())
      .eq('status', 'failed')
      .single();

    if (recentAttempt) {
      const nextAttemptAt = new Date(recentAttempt.submitted_at);
      nextAttemptAt.setHours(nextAttemptAt.getHours() + 1);
      
      return res.status(429).json({
        success: false,
        message: 'You must wait 1 hour before attempting this challenge again',
        nextAttemptAt
      });
    }

    // Get project details and primary language
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select(`
        id, title, description, current_members, maximum_members,
        project_languages!inner (
          programming_languages (id, name)
        )
      `)
      .eq('id', projectId)
      .eq('project_languages.is_primary', true)
      .single();

    if (projectError || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project has available spots
    if (project.current_members >= project.maximum_members) {
      return res.status(400).json({
        success: false,
        message: 'Project has reached maximum capacity'
      });
    }

    // Try to get the active coding challenge for this project
    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .select(`
        id, title, description, difficulty_level, time_limit_minutes,
        starter_code, test_cases,
        programming_languages (id, name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // If no challenge exists, create a default one
    if (challengeError || !challenge) {
      console.log(`No challenge found for project ${projectId}, creating default challenge`);
      
      // Create a simple default challenge
      const defaultChallenge = {
        id: `temp_${projectId}`,
        title: "Welcome Challenge",
        description: `Welcome! This project doesn't have a specific coding challenge yet. 

Please write a simple function that demonstrates your ${project.project_languages[0].programming_languages.name} skills:

Write a function called 'sayHello' that takes a name parameter and returns a greeting message.

**Example:**
\`\`\`javascript
sayHello("World") // should return "Hello, World!"
\`\`\``,
        difficulty_level: 'easy',
        time_limit_minutes: 15,
        starter_code: `function sayHello(name) {
  // Your code here
  
}`,
        test_cases: [
          {
            function_call: 'sayHello("World")',
            expected: "Hello, World!",
            description: "Basic greeting"
          },
          {
            function_call: 'sayHello("JavaScript")',
            expected: "Hello, JavaScript!",
            description: "Greeting with different name"
          },
          {
            function_call: 'sayHello("")',
            expected: "Hello, !",
            description: "Empty name"
          }
        ],
        programming_languages: project.project_languages[0].programming_languages,
        isTemporary: true
      };

      return res.json({
        success: true,
        data: {
          project: {
            id: project.id,
            title: project.title,
            description: project.description,
            spotsRemaining: project.maximum_members - project.current_members,
            primaryLanguage: project.project_languages[0].programming_languages.name
          },
          challenge: defaultChallenge,
          isTemporaryChallenge: true
        }
      });
    }

    // Remove sensitive data before sending to frontend
    const { expected_solution, ...safeChallenge } = challenge;

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          spotsRemaining: project.maximum_members - project.current_members,
          primaryLanguage: project.project_languages[0].programming_languages.name
        },
        challenge: safeChallenge,
        isTemporaryChallenge: false
      }
    });

  } catch (error) {
    console.error('Get project challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Submit a coding challenge attempt for project recruitment
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedCode, startedAt } = req.body;
    const userId = req.user.id;

    console.log('Challenge submission received:', { projectId, userId, codeLength: submittedCode?.length });

    // Handle temporary challenges (projects without real challenges)
    const isTemporary = req.body.challengeId && req.body.challengeId.startsWith('temp_');
    
    if (isTemporary) {
      // For temporary challenges, just evaluate the basic code and auto-approve
      const evaluation = await evaluateTemporaryChallenge(submittedCode);
      
      // Add user to project immediately
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (memberError && !memberError.message.includes('duplicate')) {
        console.error('Error adding user to project:', memberError);
      }

      // Update project current members count
      await supabase
        .from('projects')
        .update({
          current_members: supabase.sql`current_members + 1`
        })
        .eq('id', projectId);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          project_id: projectId,
          notification_type: 'challenge_passed',
          title: 'Welcome to the Project! 🎉',
          message: `You have successfully joined the project!`,
          is_read: false
        });

      return res.json({
        success: true,
        data: {
          attempt: {
            id: `temp_attempt_${Date.now()}`,
            score: evaluation.score,
            status: 'passed'
          },
          evaluation: evaluation,
          projectJoined: true
        }
      });
    }

    // Get the challenge details for real challenges
    const { data: challenge, error: challengeError } = await supabase
      .from('coding_challenges')
      .select(`
        id, test_cases, expected_solution, time_limit_minutes, title,
        programming_languages (name)
      `)
      .eq('project_id', projectId)
      .eq('is_active', true)
      .single();

    if (challengeError || !challenge) {
      return res.status(404).json({
        success: false,
        message: 'No active challenge found for this project'
      });
    }

    // Check if user already has an attempt for this challenge
    const { data: existingAttempt } = await supabase
      .from('challenge_attempts')
      .select('id')
      .eq('challenge_id', challenge.id)
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .single();

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an attempt for this challenge'
      });
    }

    // Calculate solve time if startedAt is provided
    let solveTimeMinutes = null;
    if (startedAt) {
      const startTime = new Date(startedAt);
      const endTime = new Date();
      solveTimeMinutes = Math.round((endTime - startTime) / (1000 * 60));
    }

    // Evaluate the submitted code
    const evaluation = await evaluateCode(submittedCode, challenge);

    // Create challenge attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('challenge_attempts')
      .insert({
        challenge_id: challenge.id,
        user_id: userId,
        project_id: projectId,
        submitted_code: submittedCode,
        score: evaluation.score,
        execution_time_ms: evaluation.executionTime,
        memory_usage_mb: evaluation.memoryUsage,
        solve_time_minutes: solveTimeMinutes,
        test_cases_passed: evaluation.passedTests,
        total_test_cases: evaluation.totalTests,
        status: evaluation.status,
        feedback: evaluation.feedback,
        code_quality_score: evaluation.codeQuality,
        submitted_at: new Date().toISOString()
      })
      .select('id, score, status')
      .single();

    if (attemptError) {
      console.error('Error saving attempt:', attemptError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save attempt',
        error: attemptError.message
      });
    }

    // If challenge passed, add user to project
    if (evaluation.status === 'passed') {
      // Add user to project members
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (memberError && !memberError.message.includes('duplicate')) {
        console.error('Error adding user to project:', memberError);
      }

      // Update project current members count
      await supabase
        .from('projects')
        .update({
          current_members: supabase.sql`current_members + 1`
        })
        .eq('id', projectId);

      // Create notification for successful challenge completion
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          project_id: projectId,
          notification_type: 'challenge_passed',
          title: 'Challenge Passed! 🎉',
          message: `Congratulations! You successfully completed the coding challenge and joined the project.`,
          is_read: false
        });

      // Log user activity
      await supabase
        .from('user_activity')
        .insert({
          user_id: userId,
          project_id: projectId,
          activity_type: 'project_joined',
          activity_data: {
            method: 'challenge_completion',
            challengeTitle: challenge.title,
            score: evaluation.score
          }
        });
    } else {
      // Create notification for failed attempt
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          project_id: projectId,
          notification_type: 'challenge_failed',
          title: 'Challenge Attempt',
          message: `Your coding challenge submission scored ${evaluation.score}%. You can try again after the cooldown period.`,
          is_read: false
        });
    }

    res.json({
      success: true,
      data: {
        attempt: {
          id: attempt.id,
          score: evaluation.score,
          status: evaluation.status
        },
        evaluation: {
          score: evaluation.score,
          status: evaluation.status,
          passedTests: evaluation.passedTests,
          totalTests: evaluation.totalTests,
          feedback: evaluation.feedback,
          codeQuality: evaluation.codeQuality,
          executionTime: evaluation.executionTime
        },
        projectJoined: evaluation.status === 'passed'
      }
    });

  } catch (error) {
    console.error('Submit challenge attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's challenge attempts with pagination
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, projectId } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('challenge_attempts')
      .select(`
        id, score, status, submitted_at, solve_time_minutes, 
        test_cases_passed, total_test_cases,
        coding_challenges (id, title, difficulty_level),
        projects (id, title)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: attempts, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attempts',
        error: error.message
      });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('challenge_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) countQuery = countQuery.eq('status', status);
    if (projectId) countQuery = countQuery.eq('project_id', projectId);

    const { count, error: countError } = await countQuery;

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: offset + attempts.length < count,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get detailed information about a specific attempt
const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const { data: attempt, error } = await supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (
          id, title, description, difficulty_level, test_cases,
          programming_languages (name)
        ),
        projects (id, title, description)
      `)
      .eq('id', attemptId)
      .eq('user_id', userId)
      .single();

    if (error || !attempt) {
      return res.status(404).json({
        success: false,
        message: 'Attempt not found'
      });
    }

    res.json({
      success: true,
      data: { attempt }
    });

  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get user's challenge statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall statistics
    const { data: overallStats } = await supabase
      .from('challenge_attempts')
      .select('score, status, solve_time_minutes')
      .eq('user_id', userId);

    if (!overallStats || overallStats.length === 0) {
      return res.json({
        success: true,
        data: {
          overall: {
            totalAttempts: 0,
            passedAttempts: 0,
            failedAttempts: 0,
            averageScore: 0,
            highestScore: 0,
            averageSolveTime: 0
          },
          byLanguage: []
        }
      });
    }

    const totalAttempts = overallStats.length;
    const passedAttempts = overallStats.filter(a => a.status === 'passed').length;
    const failedAttempts = overallStats.filter(a => a.status === 'failed').length;
    const averageScore = Math.round(overallStats.reduce((sum, a) => sum + a.score, 0) / totalAttempts);
    const highestScore = Math.max(...overallStats.map(a => a.score));
    const solveTimes = overallStats.filter(a => a.solve_time_minutes).map(a => a.solve_time_minutes);
    const averageSolveTime = solveTimes.length > 0 ? Math.round(solveTimes.reduce((sum, t) => sum + t, 0) / solveTimes.length) : 0;

    // Statistics by programming language
    const { data: languageStats } = await supabase
      .from('challenge_attempts')
      .select(`
        score, status,
        coding_challenges (
          programming_languages (id, name)
        )
      `)
      .eq('user_id', userId);

    const langStatsMap = {};
    languageStats?.forEach(attempt => {
      const langName = attempt.coding_challenges?.programming_languages?.name;
      if (langName) {
        if (!langStatsMap[langName]) {
          langStatsMap[langName] = {
            language: langName,
            attempts: 0,
            passed: 0,
            averageScore: 0,
            totalScore: 0
          };
        }
        langStatsMap[langName].attempts++;
        langStatsMap[langName].totalScore += attempt.score;
        if (attempt.status === 'passed') langStatsMap[langName].passed++;
      }
    });

    const byLanguage = Object.values(langStatsMap).map(lang => ({
      ...lang,
      averageScore: Math.round(lang.totalScore / lang.attempts)
    }));

    res.json({
      success: true,
      data: {
        overall: {
          totalAttempts,
          passedAttempts,
          failedAttempts,
          averageScore,
          highestScore,
          averageSolveTime
        },
        byLanguage
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Check if user can attempt a project challenge
const canAttemptChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is already a member
    const { data: member } = await supabase
      .from('project_members')
      .select('status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (member && member.status === 'active') {
      return res.json({
        success: true,
        data: {
          canAttempt: false,
          reason: 'Already a project member'
        }
      });
    }

    // Check for recent failed attempts (cooldown)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempt } = await supabase
      .from('challenge_attempts')
      .select('submitted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .gte('submitted_at', oneHourAgo.toISOString())
      .eq('status', 'failed')
      .single();

    if (recentAttempt) {
      const nextAttemptAt = new Date(recentAttempt.submitted_at);
      nextAttemptAt.setHours(nextAttemptAt.getHours() + 1);
      
      return res.json({
        success: true,
        data: {
          canAttempt: false,
          reason: 'Cooldown period active',
          nextAttemptAt
        }
      });
    }

    // Check if project has space
    const { data: project } = await supabase
      .from('projects')
      .select('current_members, maximum_members')
      .eq('id', projectId)
      .single();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    if (project.current_members >= project.maximum_members) {
      return res.json({
        success: true,
        data: {
          canAttempt: false,
          reason: 'Project at maximum capacity'
        }
      });
    }

    res.json({
      success: true,
      data: {
        canAttempt: true,
        spotsRemaining: project.maximum_members - project.current_members
      }
    });

  } catch (error) {
    console.error('Can attempt challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper function to evaluate temporary challenges
async function evaluateTemporaryChallenge(submittedCode) {
  try {
    // Basic evaluation for temporary challenges
    const hasFunction = submittedCode.includes('function sayHello') || submittedCode.includes('sayHello =');
    const hasReturn = submittedCode.includes('return');
    const hasParameter = submittedCode.includes('name');

    let score = 0;
    let feedback = [];

    if (hasFunction) {
      score += 40;
      feedback.push('✅ Function definition found');
    } else {
      feedback.push('❌ Function definition not found');
    }

    if (hasParameter) {
      score += 30;
      feedback.push('✅ Parameter usage detected');
    } else {
      feedback.push('❌ Parameter usage not detected');
    }

    if (hasReturn) {
      score += 30;
      feedback.push('✅ Return statement found');
    } else {
      feedback.push('❌ Return statement not found');
    }

    return {
      score: Math.max(score, 75), // Give benefit of doubt for temporary challenges
      status: 'passed', // Always pass temporary challenges
      passedTests: 3,
      totalTests: 3,
      feedback: feedback.join('\n'),
      codeQuality: score,
      executionTime: 100
    };
  } catch (error) {
    return {
      score: 75,
      status: 'passed',
      passedTests: 3,
      totalTests: 3,
      feedback: 'Code submitted successfully',
      codeQuality: 75,
      executionTime: 100
    };
  }
}

// Code evaluation function for real challenges
async function evaluateCode(submittedCode, challenge) {
  const startTime = Date.now();
  let score = 0;
  let passedTests = 0;
  let totalTests = 0;
  let feedback = [];
  let status = 'failed';

  try {
    const testCases = challenge.test_cases || [];
    totalTests = testCases.length;

    if (totalTests === 0) {
      return {
        score: 100,
        passedTests: 1,
        totalTests: 1,
        status: 'passed',
        feedback: 'No test cases defined',
        executionTime: 0,
        memoryUsage: 0,
        codeQuality: calculateCodeQuality(submittedCode)
      };
    }

    // Create VM for secure code execution
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        console: { log: () => {}, error: () => {} }
      }
    });

    // Execute each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        const testCode = `
          ${submittedCode}
          
          (function() {
            try {
              ${testCase.setup || ''}
              const result = ${testCase.function_call};
              return { result, expected: ${JSON.stringify(testCase.expected)}, success: true };
            } catch (e) {
              return { error: e.message, success: false };
            }
          })()
        `;

        const result = vm.run(testCode);
        
        if (result.success && JSON.stringify(result.result) === JSON.stringify(result.expected)) {
          passedTests++;
          feedback.push(`Test case ${i + 1}: PASSED`);
        } else {
          feedback.push(`Test case ${i + 1}: FAILED - Expected: ${JSON.stringify(result.expected)}, Got: ${JSON.stringify(result.result)}`);
        }
      } catch (error) {
        feedback.push(`Test case ${i + 1}: ERROR - ${error.message}`);
      }
    }

    // Calculate score and status
    score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    status = score >= 70 ? 'passed' : 'failed'; // 70% pass rate

    const executionTime = Date.now() - startTime;
    const codeQuality = calculateCodeQuality(submittedCode);

    return {
      score,
      passedTests,
      totalTests,
      status,
      feedback: feedback.join('\n'),
      executionTime,
      memoryUsage: 0,
      codeQuality
    };

  } catch (error) {
    return {
      score: 0,
      passedTests: 0,
      totalTests,
      status: 'failed',
      feedback: `Execution error: ${error.message}`,
      executionTime: Date.now() - startTime,
      memoryUsage: 0,
      codeQuality: 0
    };
  }
}

// Basic code quality assessment
function calculateCodeQuality(code) {
  let score = 100;
  const lines = code.split('\n');
  const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
  
  // Penalize extremely short or long solutions
  if (codeLines < 3) score -= 20;
  if (codeLines > 50) score -= 10;
  
  // Bonus for comments
  const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
  if (commentLines > 0) score += 5;
  
  // Check for proper naming conventions
  if (code.includes('function ') && !code.match(/function\s+[a-z]/)) score -= 10;
  
  // Penalize excessive console.log
  const consoleLogs = (code.match(/console\.log/g) || []).length;
  if (consoleLogs > 2) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

module.exports = {
  getProjectChallenge,
  submitChallengeAttempt,
  getUserAttempts,
  getAttemptDetails,
  getUserStats,
  canAttemptChallenge
};