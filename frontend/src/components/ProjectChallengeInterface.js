// Enhanced Project Challenge Interface - Based on Working Reference + Alert System
// frontend/src/components/ProjectChallengeInterface.js

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChallengeFailureAlert from './ChallengeFailureAlert';

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
  const [showHints, setShowHints] = useState(false);
  const [codeValidation, setCodeValidation] = useState(null);

  // NEW: Alert system state
  const [alertData, setAlertData] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

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

  // Real-time code validation (SAME AS WORKING VERSION)
  const validateCodeRealTime = useCallback((code) => {
    const validation = {
      length: code.trim().length,
      hasFunction: /function\s+\w+|def\s+\w+|=>\s*{?|public\s+\w+\s+\w+\s*\(/i.test(code),
      hasLogic: /if\s*\(|for\s*\(|while\s*\(|switch\s*\(/i.test(code),
      hasReturn: /return\s+\w/i.test(code),
      hasComments: /\/\/[^\n]+|\/\*[\s\S]*?\*\/|#[^\n]+/i.test(code),
      isPlaceholder: /todo|placeholder|your code here|implement/i.test(code),
      estimatedScore: 0
    };

    let score = 0;
    if (validation.length > 20) score += 10;
    if (validation.hasFunction) score += 25;
    if (validation.hasLogic) score += 20;
    if (validation.hasReturn) score += 15;
    if (validation.hasComments) score += 10;
    if (validation.length > 100) score += 10;
    if (validation.isPlaceholder && validation.length < 100) score = Math.min(score, 20);

    validation.estimatedScore = Math.min(100, score);
    setCodeValidation(validation);
  }, []);

  // Check if user can attempt challenge (ENHANCED WITH ALERT DETECTION)
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
      
      // NEW: Check for alert data in response
      if (data.alertData && data.alertData.shouldShow) {
        setAlertData(data.alertData);
        setShowAlert(true);
      }
      
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

  // Handle starting the challenge - UPDATED: Convert to seconds for countdown
  const handleStartChallenge = useCallback(() => {
    const now = new Date();
    setStartedAt(now.toISOString());
    
    // Set timer in seconds for precise countdown (UPDATED)
    if (challenge?.challenge?.time_limit_minutes) {
      setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
    }
    
    console.log('Challenge started at:', now.toISOString());
  }, [challenge]);

  // Handle challenge submission (ENHANCED WITH ALERT DETECTION)
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
      
      // NEW: Check for alert data in failed attempts
      if (data.data.alertData && data.data.alertData.shouldShow && !data.data.passed) {
        setAlertData(data.data.alertData);
        setShowAlert(true);
      }
      
      // Show success/failure message
      if (data.data.projectJoined) {
        // Store success event for other tabs to detect
        try {
          localStorage.setItem('projectJoined', Date.now().toString());
        } catch (e) {
          console.warn('Could not save to localStorage:', e);
        }
        
        setTimeout(() => {
          alert('🎉 Congratulations! You passed the challenge and joined the project!');
          if (onSuccess) {
            onSuccess({
              score: data.data.score,
              projectJoined: true,
              projectId: projectId
            });
          }
          if (onClose) onClose();
        }, 1000);
      } else if (data.data.passed) {
        alert('✅ Great! You passed the challenge!');
      } else {
        // Don't show alert here if alert system will handle it
        if (!data.data.alertData || !data.data.alertData.shouldShow) {
          alert(`❌ Challenge not passed. Score: ${data.data.score}%. Keep practicing!`);
        }
      }
      
    } catch (err) {
      console.error('Error submitting challenge:', err);
      setError(`Error submitting challenge: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [submittedCode, startedAt, challenge, projectId, API_BASE_URL, getAuthHeaders, handleApiResponse, onClose, onSuccess]);

  // Update ref for timer callback (SAME AS WORKING VERSION)
  handleSubmitRef.current = handleSubmit;

  // Timer countdown effect - UPDATED: Use seconds instead of minutes
  useEffect(() => {
    if (!startedAt || !challenge?.challenge?.time_limit_minutes || result) {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          alert('Time is up! Your current code will be submitted automatically.');
          handleSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Update every second instead of every minute

    return () => clearInterval(timer);
  }, [startedAt, challenge, result]);

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

  // Handle code change - UPDATED: Only allow changes when challenge started
  const handleCodeChange = (e) => {
    // Only allow code changes if challenge has started
    if (!startedAt) return;
    
    const newCode = e.target.value;
    setSubmittedCode(newCode);
    validateCodeRealTime(newCode);
  };

  // NEW: Alert system handlers
  const handleAlertClose = () => {
    setShowAlert(false);
    setAlertData(null);
  };

  const handleAlertContinue = () => {
    setShowAlert(false);
    // Reset the form for another attempt
    setResult(null);
    setError(null);
    if (challenge?.challenge?.time_limit_minutes && !startedAt) {
      setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
    }
  };

  // Format time helper - UPDATED: Handle both minutes and seconds
  const formatTime = (timeValue) => {
    if (timeValue === null || timeValue === undefined) return 'No limit';
    
    // If challenge started and timeValue is in seconds (less than original minutes)
    if (startedAt && timeValue < (challenge?.challenge?.time_limit_minutes || 0) * 60) {
      // Format as MM:SS
      const totalSeconds = Math.max(0, Math.floor(timeValue));
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Original format for initial display (before challenge starts)
    const hours = Math.floor(timeValue / 60);
    const mins = timeValue % 60;
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

  const getValidationScoreColor = () => {
    if (!codeValidation) return '#6c757d';
    if (codeValidation.estimatedScore >= 70) return '#28a745';
    if (codeValidation.estimatedScore >= 50) return '#ffc107';
    return '#dc3545';
  };

  // Styles (SAME AS WORKING VERSION)
  const styles = {
    container: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '1000px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    },
    centerContent: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#6b7280'
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
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerContent: {
      flex: 1
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 0 8px 0'
    },
    subtitle: {
      fontSize: '16px',
      opacity: 0.9,
      margin: 0
    },
    closeIcon: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    content: {
      flex: 1,
      padding: '24px',
      overflowY: 'auto'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    },
    infoCard: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      textAlign: 'center',
      border: '1px solid #e9ecef'
    },
    infoLabel: {
      color: '#6b7280',
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '8px',
      textTransform: 'uppercase'
    },
    infoValue: {
      fontSize: '16px',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    timerContainer: {
      backgroundColor: '#fef3c7',
      border: '1px solid #fde68a',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
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
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    descriptionBox: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px'
    },
    testCasesBox: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '16px',
      overflow: 'auto'
    },
    codeEditor: {
      width: '100%',
      minHeight: '300px',
      padding: '16px',
      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
      fontSize: '14px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      resize: 'vertical',
      outline: 'none'
    },
    disabledOverlay: {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(248, 249, 250, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      zIndex: 1,
      backdropFilter: 'blur(2px)'
    },
    disabledMessage: {
      textAlign: 'center',
      color: '#6c757d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontSize: '16px',
      fontWeight: '500'
    },
    validationPanel: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px',
      marginTop: '8px',
      fontSize: '14px'
    },
    validationLeft: {
      display: 'flex',
      gap: '16px'
    },
    validationItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    validationScore: {
      fontWeight: 'bold',
      padding: '4px 8px',
      borderRadius: '4px',
      color: 'white'
    },
    characterCount: {
      fontSize: '12px',
      color: '#6c757d',
      marginTop: '8px',
      textAlign: 'right'
    },
    hintSection: {
      backgroundColor: '#e7f3ff',
      border: '1px solid #b8daff',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    },
    hintToggle: {
      background: 'none',
      border: 'none',
      color: '#0066cc',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    hintContent: {
      marginTop: '12px',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    errorBox: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #f5c6cb',
      marginBottom: '20px'
    },
    resultBox: {
      padding: '20px',
      borderRadius: '8px',
      border: '2px solid',
      marginBottom: '20px'
    },
    resultHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    resultTitle: {
      fontSize: '18px',
      fontWeight: 'bold'
    },
    resultScore: {
      fontSize: '24px',
      fontWeight: 'bold'
    },
    resultFeedback: {
      fontSize: '14px',
      marginBottom: '12px'
    },
    joinedNotice: {
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid rgba(40, 167, 69, 0.3)'
    },
    joinedText: {
      color: '#155724',
      fontWeight: 'bold',
      margin: 0
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      paddingTop: '20px',
      borderTop: '1px solid #e9ecef'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      backgroundColor: '#667eea',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    retryButton: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    disabledButton: {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  };

  // Loading state (SAME AS WORKING VERSION)
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.centerContent}>
            <div style={styles.spinner}></div>
            <h3>Loading Challenge</h3>
            <p>Please wait while we prepare your coding challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state (SAME AS WORKING VERSION)
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.centerContent}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ color: '#dc2626' }}>Error Loading Challenge</h3>
            <p>{error}</p>
            <div style={{ marginBottom: '20px', fontSize: '12px', color: '#6b7280' }}>
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
              style={{ ...styles.button, ...styles.retryButton }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Cannot attempt state (ENHANCED WITH ALERT SUPPORT)
  if (canAttempt && !canAttempt.canAttempt) {
    return (
      <>
        <div style={styles.container}>
          <div style={styles.modal}>
            <div style={styles.centerContent}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3>Cannot Attempt Challenge</h3>
              <p>{canAttempt.reason}</p>
              {canAttempt.nextAttemptAt && (
                <p style={{ fontSize: '12px' }}>
                  Next attempt available: {new Date(canAttempt.nextAttemptAt).toLocaleString()}
                </p>
              )}
              {onClose && (
                <button onClick={onClose} style={{ ...styles.button, ...styles.secondaryButton }}>
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* NEW: Show alert even when cannot attempt */}
        {showAlert && alertData && (
          <ChallengeFailureAlert
            alertData={alertData}
            onClose={handleAlertClose}
            onContinue={handleAlertContinue}
            projectTitle={challenge?.project?.title || 'this project'}
          />
        )}
      </>
    );
  }

  // No challenge available (SAME AS WORKING VERSION)
  if (!challenge) {
    return (
      <div style={styles.container}>
        <div style={styles.modal}>
          <div style={styles.centerContent}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💻</div>
            <h3>No Challenge Available</h3>
            <p>This project doesn't have an active coding challenge.</p>
            {onClose && (
              <button onClick={onClose} style={{ ...styles.button, ...styles.secondaryButton }}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main challenge interface (ENHANCED WITH ALERT SUPPORT)
  return (
    <>
      <div style={styles.container}>
        <div style={styles.modal}>
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
                  {challenge.challenge?.programming_languages?.name || 
                   challenge.project?.primaryLanguage || 
                   'JavaScript'}
                </div>
              </div>
              
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Time Limit</div>
                <div style={styles.infoValue}>
                  {formatTime(challenge.challenge?.time_limit_minutes)}
                </div>
              </div>
            </div>

            {/* Timer - UPDATED: Color warning at 5 minutes (300 seconds) */}
            {startedAt && timeRemaining !== null && (
              <div style={styles.timerContainer}>
                <div style={styles.timerContent}>
                  <span style={styles.timerLabel}>Time Remaining:</span>
                  <span style={{
                    ...styles.timerValue,
                    color: timeRemaining <= 300 ? '#dc3545' : '#28a745'
                  }}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            )}

            {/* Challenge Description */}
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>📋 Challenge Description</h3>
              <div style={styles.descriptionBox}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {challenge.challenge?.description || 'No description available.'}
                </pre>
              </div>
            </div>

            {/* Test Cases */}
            {challenge.challenge?.test_cases && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>🧪 Test Cases</h3>
                <div style={styles.testCasesBox}>
                  <pre style={{ margin: 0, fontSize: '13px', fontFamily: 'Monaco, Consolas, monospace' }}>
                    {typeof challenge.challenge.test_cases === 'string' 
                      ? challenge.challenge.test_cases 
                      : JSON.stringify(challenge.challenge.test_cases, null, 2)
                    }
                  </pre>
                </div>
              </div>
            )}

            {/* Hints */}
            <div style={styles.hintSection}>
              <button 
                onClick={() => setShowHints(!showHints)}
                style={styles.hintToggle}
              >
                💡 {showHints ? 'Hide' : 'Show'} Hints
                <span>{showHints ? '▲' : '▼'}</span>
              </button>
              {showHints && (
                <div style={styles.hintContent}>
                  <ul>
                    <li>Read the requirements carefully before starting</li>
                    <li>Make sure your solution handles all test cases</li>
                    <li>Include proper function definitions and logic</li>
                    <li>Add comments to explain your approach</li>
                    <li>Test your solution with the provided examples</li>
                    <li>Use appropriate variable names and code structure</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Code Editor - UPDATED: Disabled until challenge starts with overlay */}
            <div style={{ ...styles.section, position: 'relative' }}>
              <h3 style={styles.sectionTitle}>💻 Your Solution</h3>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={submittedCode}
                  onChange={handleCodeChange}
                  style={{
                    ...styles.codeEditor,
                    ...((!startedAt || isSubmitting || (result && result.passed)) ? {
                      backgroundColor: '#f8f9fa',
                      cursor: 'not-allowed',
                      color: '#6c757d'
                    } : {})
                  }}
                  placeholder={!startedAt ? "Click 'Start Challenge' to begin coding..." : "Write your solution here..."}
                  disabled={!startedAt || isSubmitting || (result && result.passed)}
                />
                
                {/* Disabled overlay when challenge hasn't started */}
                {!startedAt && (
                  <div style={styles.disabledOverlay}>
                    <div style={styles.disabledMessage}>
                      <span style={{ fontSize: '24px', marginBottom: '8px' }}>🔒</span>
                      <p>Start the challenge to begin coding</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Real-time Code Validation - Only show when challenge started */}
              {startedAt && codeValidation && (
                <div style={styles.validationPanel}>
                  <div style={styles.validationLeft}>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasFunction ? '✅' : '❌'}</span>
                      <span>Function</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasLogic ? '✅' : '❌'}</span>
                      <span>Logic</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasReturn ? '✅' : '❌'}</span>
                      <span>Return</span>
                    </div>
                    <div style={styles.validationItem}>
                      <span>{codeValidation.hasComments ? '✅' : '❌'}</span>
                      <span>Comments</span>
                    </div>
                    {codeValidation.isPlaceholder && (
                      <div style={styles.validationItem}>
                        <span>⚠️</span>
                        <span>Placeholder detected</span>
                      </div>
                    )}
                  </div>
                  <div style={{
                    ...styles.validationScore,
                    backgroundColor: getValidationScoreColor()
                  }}>
                    ~{codeValidation.estimatedScore}%
                  </div>
                </div>
              )}
              
              <div style={styles.characterCount}>
                Characters: {submittedCode.length} | Lines: {submittedCode.split('\n').length}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div style={styles.errorBox}>
                <strong>⚠️ Error:</strong> {error}
              </div>
            )}

            {/* Result Display (SAME AS WORKING VERSION) */}
            {result && (
              <div style={{
                ...styles.resultBox,
                backgroundColor: result.passed ? '#d4edda' : '#f8d7da',
                borderColor: result.passed ? '#c3e6cb' : '#f5c6cb',
                color: result.passed ? '#155724' : '#721c24'
              }}>
                <div style={styles.resultHeader}>
                  <span style={styles.resultTitle}>
                    {result.passed ? '🎉 Challenge Passed!' : '❌ Challenge Not Passed'}
                  </span>
                  <span style={styles.resultScore}>
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
                      You can now access the project workspace and collaborate with the team.
                    </p>
                  </div>
                )}

                {result.evaluation && result.evaluation.details && (
                  <div style={{
                    marginTop: '16px',
                    padding: '16px',
                    backgroundColor: 'rgba(0,0,0,0.05)',
                    borderRadius: '8px'
                  }}>
                    <p style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
                      📊 Evaluation Breakdown:
                    </p>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        {result.evaluation.details.hasFunction ? '✅' : '❌'} 
                        Function Definition (25 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        {result.evaluation.details.hasLogic ? '✅' : '❌'} 
                        Control Structures & Logic (20 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        {result.evaluation.details.languageMatch ? '✅' : '❌'} 
                        Language Syntax Match (20 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        {result.evaluation.details.properStructure ? '✅' : '❌'} 
                        Code Structure (10 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        {result.evaluation.details.hasComments ? '✅' : '❌'} 
                        Comments & Documentation (10 pts)
                      </li>
                      <li style={{ fontSize: '14px', margin: '6px 0' }}>
                        📈 Complexity Score: {result.evaluation.details.complexity * 3}/15 pts
                      </li>
                    </ul>
                  </div>
                )}

                {!result.passed && (
                  <div style={{ marginTop: '16px', textAlign: 'center' }}>
                    <button 
                      onClick={() => {
                        setResult(null);
                        setError(null);
                        // Reset timer if needed
                        if (challenge?.challenge?.time_limit_minutes && !startedAt) {
                          setTimeRemaining(challenge.challenge.time_limit_minutes * 60);
                        }
                      }}
                      style={{ ...styles.button, ...styles.retryButton }}
                    >
                      🔄 Try Again
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons (SAME AS WORKING VERSION) */}
            <div style={styles.actionButtons}>
              {!startedAt && !result && (
                <>
                  <button 
                    onClick={onClose}
                    style={{ ...styles.button, ...styles.secondaryButton }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartChallenge}
                    disabled={loading || isSubmitting}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      ...(loading || isSubmitting ? styles.disabledButton : {})
                    }}
                  >
                    🚀 Start Challenge
                  </button>
                </>
              )}

              {startedAt && !result && (
                <>
                  <button 
                    onClick={onClose}
                    style={{ ...styles.button, ...styles.secondaryButton }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !submittedCode.trim() || submittedCode.trim().length < 10}
                    style={{
                      ...styles.button,
                      ...styles.primaryButton,
                      ...(isSubmitting || !submittedCode.trim() || submittedCode.trim().length < 10 ? styles.disabledButton : {})
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <span style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '8px'
                        }}></span>
                        Submitting...
                      </>
                    ) : (
                      '📤 Submit Solution'
                    )}
                  </button>
                </>
              )}

              {result && (
                <button 
                  onClick={onClose}
                  style={{ ...styles.button, ...styles.primaryButton }}
                >
                  {result.projectJoined ? '🎉 Go to Project' : 'Close'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CSS Animations (SAME AS WORKING VERSION) */}
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          textarea:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
          }
          
          button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          button:disabled {
            cursor: not-allowed !important;
            transform: none !important;
          }
          
          .result-box {
            animation: slideIn 0.3s ease-out;
          }
          
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* NEW: Challenge Failure Alert */}
      {showAlert && alertData && (
        <ChallengeFailureAlert
          alertData={alertData}
          onClose={handleAlertClose}
          onContinue={handleAlertContinue}
          projectTitle={challenge?.project?.title || 'this project'}
        />
      )}
    </>
  );
};

export default ProjectChallengeInterface;