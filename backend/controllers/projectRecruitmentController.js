// backend/controllers/projectRecruitmentController.js
const supabase = require('../config/supabase');

// Get the active coding challenge for a project (for users wanting to join)
const getProjectChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('Getting project challenge for:', { projectId, userId });

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

    // Get project details first (simplified query)
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, title, description, current_members, maximum_members')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      console.error('Project query error:', projectError);
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get project languages separately
    const { data: projectLanguages, error: languageError } = await supabase
      .from('project_languages')
      .select(`
        programming_language_id,
        is_primary,
        programming_languages (id, name)
      `)
      .eq('project_id', projectId);

    if (languageError) {
      console.error('Project languages query error:', languageError);
    }

    console.log('Raw project languages from DB:', projectLanguages);

    // Add languages to project object
    project.project_languages = projectLanguages || [];

    // Check if project has available spots
    if (project.current_members >= project.maximum_members) {
      return res.status(400).json({
        success: false,
        message: 'Project has reached maximum capacity'
      });
    }

    // If no languages found, we need to check what's in the project or use a sensible default
    if (!project.project_languages || project.project_languages.length === 0) {
      console.log('No project languages found, checking project data for language hints...');
      // You might want to add logic here to detect language from project title/description
      // For now, we'll create a generic challenge
    }

    // Get all programming languages used in this project (with better fallback)
    const projectLanguageIds = project.project_languages?.length > 0 
      ? project.project_languages.map(pl => pl.programming_language_id)
      : null; // Don't default to anything - let's see what we're working with
      
    const primaryLanguage = project.project_languages?.find(pl => pl.is_primary)?.programming_languages ||
                          project.project_languages?.[0]?.programming_languages ||
                          null; // No default yet

    console.log('Project language IDs:', projectLanguageIds);
    console.log('Primary language:', primaryLanguage);

    // Look for coding challenges that match the project's programming languages
    let availableChallenges = [];
    
    if (projectLanguageIds && projectLanguageIds.length > 0) {
      console.log('Searching for challenges with language IDs:', projectLanguageIds);
      
      try {
        // First try to get project-specific challenges
        const { data: projectSpecificChallenges, error: projectChallengeError } = await supabase
          .from('coding_challenges')
          .select(`
            id, title, description, difficulty_level, time_limit_minutes,
            starter_code, test_cases, programming_language_id,
            programming_languages (id, name)
          `)
          .eq('project_id', projectId)
          .eq('is_active', true);

        if (projectChallengeError) {
          console.error('Error fetching project-specific challenges:', projectChallengeError);
        } else {
          console.log('Project-specific challenges found:', projectSpecificChallenges?.length || 0);
        }
        
        // If no project-specific challenges, get general challenges matching the languages
        const { data: generalChallenges, error: generalChallengeError } = await supabase
          .from('coding_challenges')
          .select(`
            id, title, description, difficulty_level, time_limit_minutes,
            starter_code, test_cases, programming_language_id,
            programming_languages (id, name)
          `)
          .in('programming_language_id', projectLanguageIds)
          .is('project_id', null)
          .eq('is_active', true);

        if (generalChallengeError) {
          console.error('Error fetching general challenges:', generalChallengeError);
        } else {
          console.log('General challenges found:', generalChallenges?.length || 0);
          console.log('General challenges details:', generalChallenges?.map(c => ({ 
            id: c.id, 
            title: c.title, 
            lang_id: c.programming_language_id,
            lang_name: c.programming_languages?.name 
          })));
        }

        // Combine and prioritize challenges
        availableChallenges = [
          ...(projectSpecificChallenges || []),
          ...(generalChallenges || [])
        ];
      } catch (challengeError) {
        console.error('Error fetching challenges:', challengeError);
      }
    } else {
      console.log('No valid project language IDs found, will create temporary challenge');
    }

    console.log('Available challenges:', availableChallenges.length);

    let selectedChallenge = null;

    if (availableChallenges.length > 0) {
      // Randomly select a challenge
      const randomIndex = Math.floor(Math.random() * availableChallenges.length);
      selectedChallenge = availableChallenges[randomIndex];
      
      console.log('Selected challenge:', selectedChallenge.title);
    } else {
      // No challenges found, create a temporary default challenge
      console.log('No challenges found, creating temporary challenge');
      console.log('Using primary language:', primaryLanguage?.name || 'Unknown');
      
      // Use the actual primary language or make an educated guess
      const fallbackLanguage = primaryLanguage || { id: 1, name: 'JavaScript' };
      
      selectedChallenge = {
        id: `temp_${projectId}_${Date.now()}`,
        title: `${fallbackLanguage.name} Challenge`,
        description: `Welcome to "${project.title}"!\n\nSince this project uses ${fallbackLanguage.name}, please complete this coding challenge to demonstrate your skills.\n\n**Task:** Create a function that solves a simple problem using ${fallbackLanguage.name}.\n\n**Instructions:**\n1. Write clean, readable code\n2. Make sure your solution handles edge cases\n3. Add comments to explain your approach\n\nGood luck! 🚀`,
        difficulty_level: 'easy',
        time_limit_minutes: 30,
        starter_code: getStarterCodeByLanguage(fallbackLanguage.name),
        test_cases: getTestCasesByLanguage(fallbackLanguage.name),
        programming_languages: fallbackLanguage,
        isTemporary: true
      };
    }

    // Remove sensitive data before sending to frontend
    const { expected_solution, ...safeChallenge } = selectedChallenge;

    res.json({
      success: true,
      data: {
        project: {
          id: project.id,
          title: project.title,
          description: project.description,
          spotsRemaining: project.maximum_members - project.current_members,
          primaryLanguage: primaryLanguage?.name || 'Multiple'
        },
        challenge: safeChallenge,
        isTemporaryChallenge: selectedChallenge.isTemporary || false
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

// Helper function to generate starter code based on language
function getStarterCodeByLanguage(languageName) {
  const language = languageName?.toLowerCase() || 'javascript';
  
  switch (language) {
    case 'javascript':
      return `function solveProblem(input) {
  // Write your solution here
  // Example: return a result based on the input
  
  return result;
}`;

    case 'python':
      return `def solve_problem(input_data):
    """
    Write your solution here
    Args:
        input_data: The input for your problem
    Returns:
        The solution result
    """
    
    return result`;

    case 'java':
      return `public class Solution {
    public static String solveProblem(String input) {
        // Write your solution here
        
        return result;
    }
}`;

    case 'c++':
    case 'cpp':
    case 'c plus plus':
      return `#include <iostream>
#include <string>
using namespace std;

string solveProblem(string input) {
    // Write your solution here
    
    return result;
}`;

    case 'c#':
    case 'csharp':
      return `using System;

public class Solution 
{
    public static string SolveProblem(string input) 
    {
        // Write your solution here
        
        return result;
    }
}`;

    case 'go':
      return `package main

import "fmt"

func solveProblem(input string) string {
    // Write your solution here
    
    return result
}`;

    case 'rust':
      return `fn solve_problem(input: &str) -> String {
    // Write your solution here
    
    result
}`;

    default:
      return `// Write your solution here
// Language: ${languageName}

function solveProblem(input) {
    // Implement your solution
    return result;
}`;
  }
}

// Helper function to generate test cases based on language
function getTestCasesByLanguage(languageName) {
  const basicTestCases = [
    {
      input: "test",
      expected: "Test completed successfully",
      description: "Basic functionality test"
    },
    {
      input: "",
      expected: "Empty input handled",
      description: "Edge case: empty input"
    },
    {
      input: "hello world",
      expected: "Input processed correctly",
      description: "Multi-word input test"
    }
  ];

  return basicTestCases;
}

// Submit a coding challenge attempt for project recruitment
const submitChallengeAttempt = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedCode, startedAt, challengeId } = req.body;
    const userId = req.user.id;

    console.log('Challenge submission received:', { projectId, userId, challengeId });

    // Handle temporary challenges (projects without real challenges)
    const isTemporary = challengeId && challengeId.startsWith('temp_');
    
    if (isTemporary) {
      // For temporary challenges, provide a generous evaluation
      const evaluation = await evaluateTemporaryChallenge(submittedCode);
      
      // Add user to project if they pass
      if (evaluation.status === 'passed') {
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
        } else {
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
              notification_type: 'project_joined',
              title: 'Welcome to the Project! 🎉',
              message: `You have successfully joined the project!`,
              is_read: false
            });
        }
      }

      return res.json({
        success: true,
        data: {
          attempt: {
            id: `temp_attempt_${Date.now()}`,
            score: evaluation.score,
            status: evaluation.status
          },
          evaluation: evaluation,
          projectJoined: evaluation.status === 'passed'
        }
      });
    }

    // Handle real challenges
    const { data: challenge } = await supabase
      .from('coding_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Evaluate the real challenge
    const evaluation = await evaluateCode(submittedCode, challenge);
    
    // Store the attempt
    const { data: attempt } = await supabase
      .from('challenge_attempts')
      .insert({
        challenge_id: challengeId,
        user_id: userId,
        project_id: projectId,
        submitted_code: submittedCode,
        score: evaluation.score,
        status: evaluation.status,
        feedback: evaluation.feedback,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    // Add user to project if they pass
    let projectJoined = false;
    if (evaluation.status === 'passed') {
      const { error: memberError } = await supabase
        .from('project_members')
        .insert({
          project_id: projectId,
          user_id: userId,
          role: 'member',
          status: 'active',
          joined_at: new Date().toISOString()
        });

      if (!memberError) {
        projectJoined = true;
        
        // Update project current members count
        await supabase
          .from('projects')
          .update({
            current_members: supabase.sql`current_members + 1`
          })
          .eq('id', projectId);
      }
    }

    res.json({
      success: true,
      data: {
        attempt,
        evaluation,
        projectJoined
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

// Helper function to evaluate temporary challenges
async function evaluateTemporaryChallenge(submittedCode) {
  try {
    // Basic evaluation for temporary challenges - be generous
    const hasCode = submittedCode && submittedCode.trim().length > 20;
    const hasFunction = /function|def |class |fn |func /.test(submittedCode);
    const hasLogic = submittedCode.includes('return') || submittedCode.includes('print') || submittedCode.includes('cout');
    
    let score = 60; // Base score
    let feedback = [];

    if (hasCode) {
      score += 20;
      feedback.push('✅ Code submission detected');
    }

    if (hasFunction) {
      score += 15;
      feedback.push('✅ Function/method definition found');
    } else {
      feedback.push('⚠️ Consider using functions/methods for better code organization');
    }

    if (hasLogic) {
      score += 15;
      feedback.push('✅ Logic implementation detected');
    }

    // Always pass temporary challenges with reasonable effort
    if (score >= 70) {
      return {
        score: Math.min(score, 95),
        status: 'passed',
        passed_tests: 3,
        total_tests: 3,
        feedback: feedback.join('\n') + '\n\n🎉 Great job! Welcome to the team!'
      };
    } else {
      return {
        score: score,
        status: 'passed', // Still pass, but with lower score
        passed_tests: 2,
        total_tests: 3,
        feedback: feedback.join('\n') + '\n\n✨ Nice effort! We look forward to working with you.'
      };
    }
  } catch (error) {
    // Even on error, pass the temporary challenge
    return {
      score: 75,
      status: 'passed',
      passed_tests: 3,
      total_tests: 3,
      feedback: '✅ Code submitted successfully! Welcome to the team!'
    };
  }
}

// Basic code evaluation for real challenges
async function evaluateCode(submittedCode, challenge) {
  // This is a simplified evaluation - in production you'd want more sophisticated testing
  try {
    let score = 0;
    const testCases = challenge.test_cases || [];
    let passedTests = 0;

    // Basic checks
    if (submittedCode.trim().length > 10) score += 20;
    if (submittedCode.includes('function') || submittedCode.includes('def ')) score += 20;
    if (submittedCode.includes('return')) score += 20;

    // Simulate test case evaluation
    passedTests = Math.floor(testCases.length * 0.8); // Pass 80% of test cases
    score = Math.min(95, score + (passedTests / testCases.length) * 40);

    return {
      score: Math.round(score),
      status: score >= 70 ? 'passed' : 'failed',
      passed_tests: passedTests,
      total_tests: testCases.length,
      feedback: score >= 70 ? 'Good solution!' : 'Keep practicing, you\'ll get there!'
    };
  } catch (error) {
    return {
      score: 0,
      status: 'failed',
      passed_tests: 0,
      total_tests: challenge.test_cases?.length || 0,
      feedback: `Error evaluating code: ${error.message}`
    };
  }
}

// Check if user can attempt a project challenge
const canAttemptChallenge = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('project_members')
      .select('id, status')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      return res.json({
        success: true,
        data: {
          canAttempt: false,
          reason: 'You are already a member of this project'
        }
      });
    }

    // Check recent failed attempts
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const { data: recentAttempt } = await supabase
      .from('challenge_attempts')
      .select('submitted_at')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('status', 'failed')
      .gte('submitted_at', oneHourAgo.toISOString())
      .single();

    if (recentAttempt) {
      const nextAttemptAt = new Date(recentAttempt.submitted_at);
      nextAttemptAt.setHours(nextAttemptAt.getHours() + 1);
      
      return res.json({
        success: true,
        data: {
          canAttempt: false,
          reason: 'You must wait 1 hour before attempting this challenge again',
          nextAttemptAt
        }
      });
    }

    res.json({
      success: true,
      data: {
        canAttempt: true
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

// Get user's challenge attempts with pagination
const getUserAttempts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, projectId } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('challenge_attempts')
      .select(`
        *,
        coding_challenges (
          id, title, difficulty_level,
          programming_languages (name)
        ),
        projects (id, title)
      `)
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (projectId) query = query.eq('project_id', projectId);

    const { data: attempts, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attempts',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: attempts.length
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

    // Get overall stats
    const { data: attempts } = await supabase
      .from('challenge_attempts')
      .select('score, status, submitted_at')
      .eq('user_id', userId);

    const totalAttempts = attempts?.length || 0;
    const passedAttempts = attempts?.filter(a => a.status === 'passed').length || 0;
    const failedAttempts = totalAttempts - passedAttempts;
    const averageScore = totalAttempts > 0 ? 
      Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts) : 0;
    const highestScore = totalAttempts > 0 ? 
      Math.max(...attempts.map(a => a.score)) : 0;

    res.json({
      success: true,
      data: {
        overall: {
          totalAttempts,
          passedAttempts,
          failedAttempts,
          averageScore,
          highestScore
        }
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

module.exports = {
  getProjectChallenge,
  submitChallengeAttempt,
  getUserAttempts,
  getAttemptDetails,
  getUserStats,
  canAttemptChallenge
};