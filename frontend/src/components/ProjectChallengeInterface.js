// frontend/src/components/ProjectChallengeInterface.js - CLEAN LAYOUT (Fixed to match working version)
import React, { useState, useEffect, useCallback, useRef } from 'react';

const ProjectChallengeInterface = ({ projectId, onClose, onSuccess }) => {
  const [challenge, setChallenge] = useState(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAttempt, setCanAttempt] = useState(null);

  // Use ref to avoid stale closure issues
  const handleSubmitRef = useRef();

  // API Configuration - use proxy for development (SAME AS WORKING VERSION)
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || ''
    : '';

  // Helper function to get auth headers (SAME AS WORKING VERSION)
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
  }, []);

  // Helper function to handle API responses (SAME AS WORKING VERSION)
  const handleApiResponse = useCallback(async (response, actionName) => {
    console.log(`${actionName} response status:`, response.status);
    console.log(`${actionName} response headers:`, [...response.headers.entries()]);
    
    const contentType = response.headers.get('content-type');
    console.log(`${actionName} Content-Type:`, contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error(`${actionName} - Expected JSON, got:`, textResponse.substring(0, 500));
      throw new Error(`Server returned HTML instead of JSON. Check if backend is running on port 5000.`);
    }

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`${actionName} error:`, data);
      throw new Error(data.message || `${actionName} failed`);
    }
    
    return data;
  }, []);

  // Check if user can attempt challenge (SAME AS WORKING VERSION)
  const checkCanAttempt = useCallback(async () => {
    try {
      console.log('Checking if user can attempt challenge...');
      
      const timestamp = Date.now();
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/can-attempt?t=${timestamp}`;
      
      console.log('Can-attempt URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response, 'Can-attempt check');
      console.log('Can-attempt result:', data);
      
      setCanAttempt(data);
      
      if (!data.canAttempt) {
        setLoading(false);
      }
      
    } catch (err) {
      console.error('Error checking can attempt:', err);
      setError(`Error checking attempt eligibility: ${err.message}`);
      setLoading(false);
    }
  }, [projectId, API_BASE_URL, getAuthHeaders, handleApiResponse]);

  // Fetch challenge data (SAME AS WORKING VERSION)
  const fetchChallenge = useCallback(async () => {
    if (!canAttempt?.canAttempt) {
      console.log('Cannot attempt, skipping challenge fetch');
      return;
    }

    try {
      console.log('Fetching challenge...');
      setError(null);
      
      const timestamp = Date.now();
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/challenge?t=${timestamp}`;
      
      console.log('Challenge URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await handleApiResponse(response, 'Fetch challenge');
      console.log('Challenge data:', data);
      
      setChallenge(data);
      
      // Set starter code if available
      if (data.challenge?.starter_code && !submittedCode) {
        setSubmittedCode(data.challenge.starter_code);
      }
      
      setLoading(false);
      
    } catch (err) {
      console.error('Error fetching challenge:', err);
      setError(`Error loading challenge: ${err.message}`);
      setLoading(false);
    }
  }, [projectId, canAttempt, API_BASE_URL, getAuthHeaders, handleApiResponse, submittedCode]);

  // Initial load (SAME AS WORKING VERSION)
  useEffect(() => {
    console.log('Component mounted, starting checks...');
    console.log('Project ID:', projectId);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Token exists:', !!localStorage.getItem('token'));
    
    const initializeChallenge = async () => {
      setLoading(true);
      setError(null);
      
      // First check if user can attempt
      await checkCanAttempt();
    };
    
    initializeChallenge();
  }, [projectId, checkCanAttempt, API_BASE_URL]);

  // Fetch challenge when can attempt status is confirmed (SAME AS WORKING VERSION)
  useEffect(() => {
    if (canAttempt?.canAttempt === true && !challenge) {
      fetchChallenge();
    }
  }, [canAttempt, challenge, fetchChallenge]);

  // Handle starting the challenge (SAME AS WORKING VERSION)
  const handleStartChallenge = useCallback(() => {
    const now = new Date();
    setStartedAt(now.toISOString());
    
    // Set timer if challenge has time limit
    if (challenge?.challenge?.time_limit_minutes) {
      setTimeRemaining(challenge.challenge.time_limit_minutes);
    }
    
    console.log('Challenge started at:', now.toISOString());
  }, [challenge]);

  // Handle challenge submission (SAME AS WORKING VERSION)
  const handleSubmit = useCallback(async () => {
    if (!submittedCode.trim()) {
      alert('Please write your solution before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log('Submitting challenge attempt...');
      
      const payload = {
        submittedCode: submittedCode.trim(),
        startedAt
      };

      // Add challengeId for real challenges (not temporary ones)
      if (challenge?.challenge?.id && !challenge.challenge.isTemporary) {
        payload.challengeId = challenge.challenge.id;
      }

      console.log('Submit payload:', {
        ...payload,
        submittedCode: `${payload.submittedCode.substring(0, 100)}...`
      });

      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/attempt`;
      console.log('Submit URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await handleApiResponse(response, 'Submit attempt');
      console.log('Submit result:', data);
      
      setResult(data.data);
      
      // Show success/failure message
      if (data.data.projectJoined) {
        setTimeout(() => {
          alert('🎉 Congratulations! You passed the challenge and joined the project!');
          if (onClose) onClose();
        }, 1000);
      } else if (data.data.passed) {
        alert('✅ Great! You passed the challenge!');
      } else {
        alert(`❌ Challenge not passed. Score: ${data.data.score}%. Keep practicing!`);
      }
      
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setError(`Error submitting challenge: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [submittedCode, startedAt, challenge, projectId, API_BASE_URL, getAuthHeaders, handleApiResponse, onClose]);

  // Update ref for timer callback (SAME AS WORKING VERSION)
  handleSubmitRef.current = handleSubmit;

  // Timer countdown effect (SAME AS WORKING VERSION)
  useEffect(() => {
    if (!startedAt || !challenge?.challenge?.time_limit_minutes || result) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          alert('Time is up! Your current code will be submitted automatically.');
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [startedAt, challenge, result]);

  // Format time helper (SAME AS WORKING VERSION)
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return 'No limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107', 
      hard: '#fd7e14',
      expert: '#dc3545'
    };
    return colors[difficulty?.toLowerCase()] || '#6c757d';
  };

  // Loading state - CLEAN DESIGN
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.spinner}></div>
          <h3 style={styles.loadingTitle}>Loading Challenge</h3>
          <p style={styles.loadingText}>Please wait while we prepare your coding challenge...</p>
        </div>
      </div>
    );
  }

  // Error state - CLEAN DESIGN  
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Error Loading Challenge</h3>
          <p style={styles.errorMessage}>{error}</p>
          <div style={styles.debugInfo}>
            <p><strong>Project ID:</strong> {projectId}</p>
            <p><strong>API Base URL:</strong> {API_BASE_URL || 'Using proxy'}</p>
            <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          </div>
          
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              checkCanAttempt();
            }}
            style={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Cannot attempt state - CLEAN DESIGN
  if (canAttempt && !canAttempt.canAttempt) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.warningIcon}>⚠️</div>
          <h3 style={styles.warningTitle}>Cannot Attempt Challenge</h3>
          <p style={styles.warningMessage}>{canAttempt.reason}</p>
          {canAttempt.nextAttemptAt && (
            <p style={styles.nextAttemptText}>
              Next attempt available: {new Date(canAttempt.nextAttemptAt).toLocaleString()}
            </p>
          )}
          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>Close</button>
          )}
        </div>
      </div>
    );
  }

  // No challenge available - CLEAN DESIGN
  if (!challenge) {
    return (
      <div style={styles.container}>
        <div style={styles.centerContent}>
          <div style={styles.emptyIcon}>💻</div>
          <h3 style={styles.emptyTitle}>No Challenge Available</h3>
          <p style={styles.emptyMessage}>This project doesn't have an active coding challenge.</p>
          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>Close</button>
          )}
        </div>
      </div>
    );
  }

  // Main challenge interface - CLEAN DESIGN
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>Join "{challenge.project?.title || 'Project'}"</h1>
          <p style={styles.subtitle}>Complete this coding challenge to join the project</p>
        </div>
        {onClose && (
          <button onClick={onClose} style={styles.closeIcon}>×</button>
        )}
      </div>

      <div style={styles.content}>
        {/* Challenge Info Cards */}
        <div style={styles.infoGrid}>
          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>Difficulty</div>
            <div style={{
              ...styles.infoValue, 
              color: getDifficultyColor(challenge.challenge?.difficulty_level)
            }}>
              {challenge.challenge?.difficulty_level || 'Medium'}
            </div>
          </div>
          
          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>Language</div>
            <div style={styles.infoValue}>
              {challenge.challenge?.programming_languages?.name || challenge.project?.primaryLanguage || 'JavaScript'}
            </div>
          </div>
          
          <div style={styles.infoCard}>
            <div style={styles.infoLabel}>Time Limit</div>
            <div style={styles.infoValue}>
              {formatTime(challenge.challenge?.time_limit_minutes)}
            </div>
          </div>
        </div>

        {/* Timer */}
        {startedAt && timeRemaining !== null && (
          <div style={styles.timerContainer}>
            <div style={styles.timerContent}>
              <span style={styles.timerLabel}>Time Remaining:</span>
              <span style={{
                ...styles.timerValue,
                color: timeRemaining <= 10 ? '#dc3545' : '#28a745'
              }}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Challenge Description */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Challenge Description</h3>
          <div style={styles.descriptionBox}>
            <pre style={styles.descriptionText}>
              {challenge.challenge?.description || 'No description available.'}
            </pre>
          </div>
        </div>

        {/* Test Cases */}
        {challenge.challenge?.test_cases && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Test Cases</h3>
            <div style={styles.testCasesBox}>
              <pre style={styles.codeText}>
                {typeof challenge.challenge.test_cases === 'string' 
                  ? challenge.challenge.test_cases 
                  : JSON.stringify(challenge.challenge.test_cases, null, 2)
                }
              </pre>
            </div>
          </div>
        )}

        {/* Code Editor */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Your Solution</h3>
          <textarea
            value={submittedCode}
            onChange={(e) => setSubmittedCode(e.target.value)}
            style={styles.codeEditor}
            placeholder="Write your solution here..."
            disabled={isSubmitting || (result && result.evaluation)}
          />
          <div style={styles.characterCount}>
            Character count: {submittedCode.length}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        {/* Result Display */}
        {result && (
          <div style={{
            ...styles.resultBox,
            backgroundColor: result.passed ? '#d4edda' : '#f8d7da',
            borderColor: result.passed ? '#c3e6cb' : '#f5c6cb',
            color: result.passed ? '#155724' : '#721c24'
          }}>
            <div style={styles.resultHeader}>
              <span style={styles.resultTitle}>
                {result.passed ? '✅ Challenge Passed!' : '❌ Challenge Not Passed'}
              </span>
              <span style={{
                ...styles.resultScore,
                color: result.passed ? '#155724' : '#721c24'
              }}>
                {result.score}%
              </span>
            </div>
            
            {result.feedback && (
              <p style={styles.resultFeedback}>{result.feedback}</p>
            )}
            
            {result.projectJoined && (
              <div style={styles.joinedNotice}>
                <p style={styles.joinedText}>
                  🎉 Congratulations! You have been added to the project as a member.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          {!startedAt && !result && (
            <button
              onClick={handleStartChallenge}
              disabled={loading || isSubmitting}
              style={{
                ...styles.startButton,
                opacity: (loading || isSubmitting) ? 0.6 : 1
              }}
            >
              Start Challenge
            </button>
          )}

          {startedAt && !result && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                ...styles.submitButton,
                opacity: isSubmitting ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          )}

          {result && (
            <>
              {onClose && (
                <button onClick={onClose} style={styles.closeButton}>Close</button>
              )}
              
              {!result.projectJoined && (
                <button
                  onClick={() => window.location.reload()}
                  style={styles.retryLaterButton}
                >
                  Try Again Later
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },

  centerContent: {
    textAlign: 'center',
    padding: '60px 20px'
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },

  loadingTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 8px 0'
  },

  loadingText: {
    color: '#6b7280',
    fontSize: '16px'
  },

  errorIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },

  errorTitle: {
    color: '#dc2626',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  },

  errorMessage: {
    color: '#6b7280',
    marginBottom: '20px',
    fontSize: '14px'
  },

  debugInfo: {
    backgroundColor: '#f9fafb',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    fontSize: '12px',
    color: '#6b7280',
    textAlign: 'left'
  },

  retryButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  warningIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#f59e0b'
  },

  warningTitle: {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  },

  warningMessage: {
    color: '#6b7280',
    marginBottom: '12px'
  },

  nextAttemptText: {
    color: '#6b7280',
    fontSize: '12px',
    marginBottom: '20px'
  },

  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#6b7280'
  },

  emptyTitle: {
    color: '#1f2937',
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px'
  },

  emptyMessage: {
    color: '#6b7280',
    marginBottom: '20px'
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e5e7eb'
  },

  headerContent: {
    flex: 1
  },

  title: {
    color: '#1f2937',
    fontSize: '28px',
    fontWeight: '700',
    marginBottom: '8px'
  },

  subtitle: {
    color: '#6b7280',
    fontSize: '16px'
  },

  closeIcon: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px'
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },

  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },

  infoCard: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e5e7eb'
  },

  infoLabel: {
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '8px'
  },

  infoValue: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },

  timerContainer: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '8px',
    padding: '16px'
  },

  timerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  timerLabel: {
    color: '#92400e',
    fontWeight: '500'
  },

  timerValue: {
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: 'monospace'
  },

  section: {
    marginBottom: '8px'
  },

  sectionTitle: {
    color: '#1f2937',
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px'
  },

  descriptionBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px'
  },

  descriptionText: {
    color: '#1f2937',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
    fontFamily: 'inherit'
  },

  testCasesBox: {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '20px',
    overflow: 'auto'
  },

  codeText: {
    color: '#1f2937',
    fontSize: '13px',
    lineHeight: '1.5',
    margin: 0,
    fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace'
  },

  codeEditor: {
    width: '100%',
    minHeight: '300px',
    padding: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace',
    lineHeight: '1.5',
    resize: 'vertical',
    outline: 'none',
    backgroundColor: '#fff'
  },

  characterCount: {
    color: '#6b7280',
    fontSize: '12px',
    marginTop: '8px',
    textAlign: 'right'
  },

  errorBox: {
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #fecaca'
  },

  resultBox: {
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid'
  },

  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },

  resultTitle: {
    fontSize: '16px',
    fontWeight: '600'
  },

  resultScore: {
    fontSize: '20px',
    fontWeight: '700'
  },

  resultFeedback: {
    fontSize: '14px',
    margin: '8px 0'
  },

  joinedNotice: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#dbeafe',
    border: '1px solid #bfdbfe',
    borderRadius: '6px'
  },

  joinedText: {
    color: '#1e40af',
    fontWeight: '500',
    margin: 0
  },

  actionButtons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '20px',
    borderTop: '1px solid #e5e7eb'
  },

  startButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  submitButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  closeButton: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },

  retryLaterButton: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

// Add CSS for spinner animation
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  textarea:focus {
    border-color: #3b82f6 !important;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  }
  
  button:hover {
    opacity: 0.9 !important;
    transform: translateY(-1px);
    transition: all 0.2s ease;
  }
  
  button:disabled {
    cursor: not-allowed !important;
    transform: none !important;
  }
`;
document.head.appendChild(styleSheet);

export default ProjectChallengeInterface;