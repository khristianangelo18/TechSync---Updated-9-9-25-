// backend/controllers/projectRecruitmentController.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// GET /api/challenges/project/:projectId/challenge
const getProjectChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log(`\n=== GET PROJECT CHALLENGE ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);

    // Step 1: Get project with basic info
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

    // Step 2: Get project languages
    const { data: projectLanguages, error: languageError } = await supabase
      .from('project_languages')
      .select(`
        programming_language_id,
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

    // Step 3: Process project languages
    const validLanguages = project.project_languages.filter(
      pl => pl.programming_language_id && pl.programming_languages
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

    const projectLanguageIds = validLanguages.map(pl => pl.programming_language_id);
    const primaryLanguage = validLanguages.find(pl => pl.is_primary)?.programming_languages ||
                            validLanguages[0]?.programming_languages;

    console.log(`Project language IDs: [${projectLanguageIds.join(', ')}]`);
    console.log(`Primary language: ${primaryLanguage?.name || 'None'}`);

    // Step 4: Find matching challenges
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

      // Step 5: Select a challenge
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
        // No challenges found - create a basic temporary one
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

    // Step 6: Return the response
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

// GET /api/challenges/project/:projectId/can-attempt
const canAttemptChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log(`\n=== CAN ATTEMPT CHECK ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);

    // Check if user is already a member
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

    // Check recent attempts (limit: 1 attempt per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentAttempts, error: attemptError } = await supabase
      .from('coding_attempts')
      .select('attempted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .gte('attempted_at', oneHourAgo)
      .order('attempted_at', { ascending: false })
      .limit(1);

    if (attemptError) {
      console.error('Recent attempts check error:', attemptError);
      return res.status(500).json({
        success: false,
        message: 'Error checking recent attempts'
      });
    }

    if (recentAttempts && recentAttempts.length > 0) {
      const lastAttempt = new Date(recentAttempts[0].attempted_at);
      const nextAttemptTime = new Date(lastAttempt.getTime() + 60 * 60 * 1000);
      
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'You can only attempt once per hour',
        nextAttemptAt: nextAttemptTime.toISOString()
      });
    }

    // Check if project has available spots
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('current_members, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Project check error:', projectError);
      return res.status(500).json({
        success: false,
        message: 'Error checking project availability'
      });
    }

    if (project.current_members >= project.maximum_members) {
      return res.json({
        success: true,
        canAttempt: false,
        reason: 'Project has reached maximum capacity'
      });
    }

    return res.json({
      success: true,
      canAttempt: true,
      reason: 'You can attempt this challenge'
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

// POST /api/challenges/project/:projectId/attempt
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedCode, startedAt, challengeId } = req.body;
    const userId = req.user.id;

    console.log(`\n=== SUBMIT CHALLENGE ATTEMPT ===`);
    console.log(`Project ID: ${projectId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Challenge ID: ${challengeId || 'temporary'}`);

    // Validate input
    if (!submittedCode || submittedCode.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Submitted code is required and must be at least 10 characters'
      });
    }

    // Check if user can attempt (reuse logic)
    const canAttemptResult = await canAttemptChallenge(req, { json: () => {} });
    // Since we can't easily access the result, let's do a quick check
    const { data: membership } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (membership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this project'
      });
    }

    // Simple scoring logic (you can make this more sophisticated)
    const score = calculateCodeScore(submittedCode);
    const passed = score >= 70; // 70% threshold

    // Store the attempt
    const attemptData = {
      user_id: userId,
      project_id: projectId,
      submitted_code: submittedCode,
      score: score,
      passed: passed,
      attempted_at: new Date().toISOString()
    };

    // Only add challenge_id if it's not a temporary challenge
    if (challengeId && !challengeId.startsWith('temp_')) {
      attemptData.challenge_id = challengeId;
    }

    const { data: attempt, error: attemptError } = await supabase
      .from('coding_attempts')
      .insert(attemptData)
      .select()
      .single();

    if (attemptError) {
      console.error('Error storing attempt:', attemptError);
      return res.status(500).json({
        success: false,
        message: 'Error storing challenge attempt',
        error: attemptError.message
      });
    }

    let projectJoined = false;
    let membershipData = null;

    // If passed, add user to project
    if (passed) {
      const { data: newMember, error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          joined_at: new Date().toISOString(),
          role: 'member'
        })
        .select()
        .single();

      if (memberError) {
        console.error('Error adding member:', memberError);
        // Don't fail the whole request, just log the error
      } else {
        projectJoined = true;
        membershipData = newMember;

        // Update project member count
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            current_members: supabase.sql`current_members + 1`
          })
          .eq('id', projectId);

        if (updateError) {
          console.error('Error updating member count:', updateError);
        }
      }
    }

    const response = {
      success: true,
      data: {
        attempt: attempt,
        score: score,
        passed: passed,
        projectJoined: projectJoined,
        feedback: generateFeedback(score, passed),
        membership: membershipData
      }
    };

    console.log(`=== ATTEMPT RESULT ===`);
    console.log(`Score: ${score}%`);
    console.log(`Passed: ${passed}`);
    console.log(`Project Joined: ${projectJoined}`);

    return res.json(response);

  } catch (error) {
    console.error('Error in submitChallengeAttempt:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Helper Functions
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
  submitChallengeAttempt
};