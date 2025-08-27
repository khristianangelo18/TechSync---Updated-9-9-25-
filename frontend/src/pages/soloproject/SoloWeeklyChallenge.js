// frontend/src/pages/soloproject/SoloWeeklyChallenge.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChallengeAPI from '../../services/challengeAPI';
import SoloProjectService from '../../services/soloProjectService';
import api from '../../services/api'; // Add this import for direct API calls

function SoloWeeklyChallenge() {
  const { projectId } = useParams();

  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmission, setShowSubmission] = useState(false);
  const [submission, setSubmission] = useState({
    code: '',
    description: '',
    language: 'javascript'
  });
  const [submitting, setSubmitting] = useState(false);
  const [pastChallenges, setPastChallenges] = useState([]);
  const [activeTab, setActiveTab] = useState('current');
  const [error, setError] = useState(null);

  const [languageId, setLanguageId] = useState(null);
  const [languageName, setLanguageName] = useState('');

  // Helpers
  const mapDifficultyToPoints = (level) => {
    const lv = String(level || '').toLowerCase();
    if (lv === 'easy') return 100;
    if (lv === 'medium') return 150;
    if (lv === 'hard') return 250;
    if (lv === 'expert') return 350;
    return 150;
  };

  const examplesFromTestCases = (testCases) => {
    if (!Array.isArray(testCases)) return [];
    return testCases.slice(0, 3).map((tc, idx) => ({
      input: typeof tc.input === 'string' ? tc.input : JSON.stringify(tc.input),
      output: typeof tc.output === 'string' ? tc.output : JSON.stringify(tc.output),
      explanation: tc.explanation || `Example ${idx + 1}`
    }));
  };

  const formatChallengeForUI = (ch) => {
    const examples = examplesFromTestCases(ch?.test_cases);
    const category = 'algorithms';

    return {
      id: ch.id,
      title: ch.title,
      description: ch.description,
      difficulty: ch.difficulty_level || 'medium',
      points: mapDifficultyToPoints(ch.difficulty_level),
      timeLimit: ch.time_limit_minutes ? `${ch.time_limit_minutes} minutes` : '30 minutes',
      category,
      requirements: [
        'Write clean, readable code with comments',
        'Pass all provided test cases',
        ch.time_limit_minutes ? `Complete within ${ch.time_limit_minutes} minutes` : 'Manage time efficiently'
      ],
      examples: examples.length
        ? examples
        : [
            {
              input: 'Input will be provided',
              output: 'Expected output format',
              explanation: 'Example will be provided when you start'
            }
          ],
      startedAt: new Date(),
      endsAt: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
    };
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🔄 Loading weekly challenge for project:', projectId);

        // 1) Get project language information
        const dashboardRes = await SoloProjectService.getDashboardData(projectId);
        const dashboardData = dashboardRes?.data || {};
        
        const langId = dashboardData.project?.programming_language_id;
        const langName = dashboardData.project?.programming_language?.name;

        console.log('📊 Project language info:', { langId, langName });

        if (!langId) {
          if (isMounted) {
            setError('Project programming language not found. Please set up your project language first.');
            setLoading(false);
          }
          return;
        }

        if (!isMounted) return;
        setLanguageId(langId);
        setLanguageName(langName || '');

        // 2) Use the BETTER approach: Get challenges by language specifically
        // This will filter at the database level for better performance
        const challengesRes = await ChallengeAPI.getChallengesByLanguage(langId, {
          project_id: projectId, // Include project-specific challenges
          page: 1,
          limit: 20
        });

        const allChallenges = challengesRes?.data?.challenges || [];
        console.log('🎯 Found challenges for language:', allChallenges.length);

        // 3) Get user attempts to filter out recently attempted ones
        const attemptsRes = await ChallengeAPI.getUserAttempts({ page: 1, limit: 50 });
        const attempts = attemptsRes?.data?.data?.attempts || attemptsRes?.data?.attempts || [];

        // Filter out challenges attempted in the last 14 days
        const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const recentAttemptIds = new Set(
          attempts
            .filter(a => new Date(a.started_at || a.submitted_at || 0) > since)
            .map(a => a.challenge_id)
        );

        const availableChallenges = allChallenges.filter(ch => !recentAttemptIds.has(ch.id));
        
        console.log('✅ Available challenges after filtering:', availableChallenges.length);

        // 4) Pick the next challenge (prefer project-specific, then general)
        let nextChallenge = null;
        
        if (availableChallenges.length > 0) {
          // Prefer project-specific challenges first
          const projectSpecific = availableChallenges.filter(ch => ch.project_id === projectId);
          const general = availableChallenges.filter(ch => !ch.project_id);
          
          if (projectSpecific.length > 0) {
            nextChallenge = projectSpecific[Math.floor(Math.random() * projectSpecific.length)];
            console.log('🎯 Selected project-specific challenge:', nextChallenge.title);
          } else if (general.length > 0) {
            nextChallenge = general[Math.floor(Math.random() * general.length)];
            console.log('🌍 Selected general challenge:', nextChallenge.title);
          }
        }

        if (nextChallenge && isMounted) {
          const formatted = formatChallengeForUI(nextChallenge);
          
          // Check if user already attempted this challenge
          const existingAttempt = attempts.find(a => a.challenge_id === nextChallenge.id);
          if (existingAttempt) {
            formatted.submitted = existingAttempt.status !== 'pending';
            formatted.userSubmission = {
              submittedAt: existingAttempt.submitted_at || existingAttempt.started_at,
              score: existingAttempt.score ?? 0,
              language: langName?.toLowerCase() || submission.language,
              feedback: existingAttempt.feedback || ''
            };
          }
          
          // Set submission language default
          if (langName) {
            setSubmission(prev => ({ ...prev, language: langName.toLowerCase() }));
          }
          
          setCurrentChallenge(formatted);
        } else if (isMounted) {
          setCurrentChallenge(null);
          setError(`No ${langName || 'programming'} challenges available. New challenges are added weekly!`);
        }

        // 5) Set up past challenges (only from this language)
        const pastAttempts = attempts
          .filter(a => {
            const challengeInList = allChallenges.find(ch => ch.id === a.challenge_id);
            return challengeInList && challengeInList.programming_language_id === langId;
          })
          .map(a => {
            const challengeDetail = allChallenges.find(ch => ch.id === a.challenge_id);
            return {
              id: a.challenge_id,
              title: challengeDetail?.title || 'Challenge',
              difficulty: challengeDetail?.difficulty_level || 'medium',
              points: mapDifficultyToPoints(challengeDetail?.difficulty_level),
              category: 'algorithms',
              completedAt: a.submitted_at || a.reviewed_at || a.started_at,
              score: a.score || 0,
              timeSpent: a.solve_time_minutes
                ? `${a.solve_time_minutes} minutes`
                : a.execution_time_ms
                ? `${Math.round(a.execution_time_ms / 1000)}s`
                : '—',
              status: a.status === 'passed' ? 'completed' : 'missed'
            };
          })
          .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        if (isMounted) setPastChallenges(pastAttempts);

      } catch (err) {
        console.error('❌ Error loading weekly challenge:', err);
        if (isMounted) {
          setError(err?.response?.data?.message || err.message || 'Failed to load weekly challenge');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [projectId]);

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!currentChallenge || !submission.code.trim()) return;

    try {
      setSubmitting(true);
      setError(null);

      console.log('🚀 Submitting solo weekly challenge attempt...');

      // FIXED: Use simple challenge submission for solo weekly challenges
      // This bypasses the project recruitment system entirely
      const attemptData = {
        challenge_id: currentChallenge.id,
        submitted_code: submission.code,
        notes: submission.description,
        language: submission.language,
        project_id: projectId, // Include project ID for tracking
        attempt_type: 'solo_weekly' // Mark this as a solo weekly challenge
      };

      // Use the new simple challenge submission method
      const response = await ChallengeAPI.submitSimpleChallenge(attemptData);
      const attempt = response?.data?.attempt || response?.data || null;

      setCurrentChallenge(prev =>
        prev
          ? {
              ...prev,
              submitted: true,
              userSubmission: {
                submittedAt: attempt?.submitted_at || new Date(),
                score: attempt?.score ?? 0,
                language: submission.language,
                feedback: attempt?.feedback || 'Your submission has been received and is being evaluated.'
              }
            }
          : prev
      );

      setShowSubmission(false);
      setSubmission({ code: '', description: '', language: submission.language });

      console.log('✅ Solo weekly challenge submitted successfully');

    } catch (err) {
      console.error('❌ Submission error:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to submit challenge');
    } finally {
      setSubmitting(false);
    }
  };

  // Rest of your component rendering logic remains the same...
  if (loading) {
    return (
      <div style={{ padding: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading Weekly Challenge...</div>
        <div style={{ color: '#666' }}>Fetching {languageName || 'programming'} challenges for you</div>
      </div>
    );
  }

  if (error && !currentChallenge) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: '#e74c3c' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️ {error}</div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#3498db', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Weekly {languageName || 'Programming'} Challenge</h1>
        <p style={{ color: '#666' }}>
          Challenge yourself with weekly {languageName || 'programming'} problems to improve your skills!
        </p>
      </div>

      <div style={{ borderBottom: '2px solid #eee', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'current' ? '#3498db' : 'transparent',
            color: activeTab === 'current' ? 'white' : '#666',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            marginRight: '5px'
          }}
        >
          Current Challenge
        </button>
        <button
          onClick={() => setActiveTab('past')}
          style={{
            padding: '10px 20px',
            border: 'none',
            backgroundColor: activeTab === 'past' ? '#3498db' : 'transparent',
            color: activeTab === 'past' ? 'white' : '#666',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer'
          }}
        >
          Past Challenges ({pastChallenges.length})
        </button>
      </div>

      {activeTab === 'current' && (
        <div>
          {currentChallenge ? (
            <div>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px', 
                marginBottom: '20px' 
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h2 style={{ margin: '0 0 10px 0' }}>{currentChallenge.title}</h2>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        backgroundColor: getDifficultyColor(currentChallenge.difficulty),
                        color: 'white',
                        borderRadius: '15px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {currentChallenge.difficulty?.toUpperCase()}
                      </span>
                      <span style={{ color: '#666' }}>
                        🏆 {currentChallenge.points} points
                      </span>
                      <span style={{ color: '#666' }}>
                        ⏱️ {currentChallenge.timeLimit}
                      </span>
                      <span style={{ color: '#666' }}>
                        💻 {languageName}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <h3>Description</h3>
                  <div style={{ 
                    backgroundColor: 'white', 
                    padding: '15px', 
                    borderRadius: '5px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {currentChallenge.description}
                  </div>
                </div>

                {currentChallenge.examples && currentChallenge.examples.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3>Examples</h3>
                    {currentChallenge.examples.map((example, idx) => (
                      <div key={idx} style={{ 
                        backgroundColor: 'white', 
                        padding: '15px', 
                        borderRadius: '5px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Input:</strong>
                          <pre style={{ 
                            backgroundColor: '#f1f2f6', 
                            padding: '8px', 
                            borderRadius: '3px',
                            margin: '5px 0',
                            fontSize: '14px'
                          }}>
                            {example.input}
                          </pre>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Output:</strong>
                          <pre style={{ 
                            backgroundColor: '#f1f2f6', 
                            padding: '8px', 
                            borderRadius: '3px',
                            margin: '5px 0',
                            fontSize: '14px'
                          }}>
                            {example.output}
                          </pre>
                        </div>
                        {example.explanation && (
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            <strong>Explanation:</strong> {example.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {!currentChallenge.submitted ? (
                <div>
                  {!showSubmission ? (
                    <button
                      onClick={() => setShowSubmission(true)}
                      style={{
                        padding: '15px 30px',
                        backgroundColor: '#27ae60',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '16px',
                        cursor: 'pointer'
                      }}
                    >
                      Start Challenge
                    </button>
                  ) : (
                    <form onSubmit={handleSubmitChallenge}>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Your Solution ({languageName})
                        </label>
                        <textarea
                          value={submission.code}
                          onChange={(e) => setSubmission(prev => ({ ...prev, code: e.target.value }))}
                          placeholder={`Write your ${languageName} solution here...`}
                          rows={15}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #ddd',
                            borderRadius: '5px',
                            fontFamily: 'Monaco, Consolas, monospace',
                            fontSize: '14px'
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                          Description (Optional)
                        </label>
                        <textarea
                          value={submission.description}
                          onChange={(e) => setSubmission(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your approach or any notes about your solution..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '2px solid #ddd',
                            borderRadius: '5px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          disabled={submitting || !submission.code.trim()}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: submitting ? '#95a5a6' : '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: submitting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {submitting ? 'Submitting...' : 'Submit Solution'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowSubmission(false)}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>

                      {error && (
                        <div style={{ 
                          color: '#e74c3c', 
                          marginTop: '10px',
                          padding: '10px',
                          backgroundColor: '#fdf2f2',
                          borderRadius: '5px'
                        }}>
                          {error}
                        </div>
                      )}
                    </form>
                  )}
                </div>
              ) : (
                <div style={{ 
                  backgroundColor: '#d5edda', 
                  padding: '20px', 
                  borderRadius: '8px',
                  border: '1px solid #c3e6cb'
                }}>
                  <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>
                    ✅ Challenge Completed!
                  </h3>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Score:</strong> {currentChallenge.userSubmission?.score}/100
                  </p>
                  <p style={{ margin: '5px 0' }}>
                    <strong>Submitted:</strong> {new Date(currentChallenge.userSubmission?.submittedAt).toLocaleDateString()}
                  </p>
                  {currentChallenge.userSubmission?.feedback && (
                    <p style={{ margin: '10px 0 0 0', fontStyle: 'italic' }}>
                      {currentChallenge.userSubmission.feedback}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎯</div>
              <h2>No Current Challenge</h2>
              <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto 20px' }}>
                {languageName 
                  ? `No new ${languageName} challenges available right now. New challenges are added weekly!`
                  : 'No challenges available. Set up your project programming language first.'
                }
              </p>
              <button 
                onClick={() => window.location.reload()} 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Check Again
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'past' && (
        <div>
          {pastChallenges.length > 0 ? (
            <div>
              <h2>Past {languageName} Challenges</h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                {pastChallenges.map(challenge => (
                  <div key={challenge.id} style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '8px',
                    border: challenge.status === 'completed' ? '2px solid #27ae60' : '2px solid #e67e22'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 10px 0' }}>{challenge.title}</h3>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ 
                            padding: '4px 12px', 
                            backgroundColor: getDifficultyColor(challenge.difficulty),
                            color: 'white',
                            borderRadius: '15px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {challenge.difficulty?.toUpperCase()}
                          </span>
                          <span style={{ color: '#666' }}>🏆 {challenge.points} points</span>
                          <span style={{ color: '#666' }}>⏱️ {challenge.timeSpent}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                          <span>Completed: {new Date(challenge.completedAt).toLocaleDateString()}</span>
                          <span>Score: {challenge.score}/100</span>
                        </div>
                      </div>
                      <div style={{ 
                        padding: '8px 16px',
                        backgroundColor: challenge.status === 'completed' ? '#27ae60' : '#e67e22',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {challenge.status === 'completed' ? '✅ PASSED' : '❌ FAILED'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
              <h2>No Past Challenges</h2>
              <p style={{ color: '#666' }}>
                You haven't attempted any {languageName || 'programming'} challenges yet. 
                Start with the current challenge to build your history!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function for difficulty colors
function getDifficultyColor(difficulty) {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return '#27ae60';
    case 'medium': return '#f39c12';
    case 'hard': return '#e74c3c';
    case 'expert': return '#8e44ad';
    default: return '#95a5a6';
  }
}

export default SoloWeeklyChallenge;