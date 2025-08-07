// frontend/src/components/ProjectChallengeInterface.js
import React, { useState, useEffect, useCallback, useRef } from 'react';

const ProjectChallengeInterface = ({ projectId, onClose }) => {
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

  // API Configuration - use proxy for development
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL || ''
    : '';

  // Helper function to get auth headers
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

  // Helper function to handle API responses
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

  // Check if user can attempt challenge
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

  // Fetch challenge data
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

  // Initial load
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

  // Fetch challenge when can attempt status is confirmed
  useEffect(() => {
    if (canAttempt?.canAttempt === true && !challenge) {
      fetchChallenge();
    }
  }, [canAttempt, challenge, fetchChallenge]);

  // Handle starting the challenge
  const handleStartChallenge = useCallback(() => {
    const now = new Date();
    setStartedAt(now.toISOString());
    
    // Set timer if challenge has time limit
    if (challenge?.challenge?.time_limit_minutes) {
      setTimeRemaining(challenge.challenge.time_limit_minutes);
    }
    
    console.log('Challenge started at:', now.toISOString());
  }, [challenge]);

  // Handle challenge submission
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

  // Update ref for timer callback
  handleSubmitRef.current = handleSubmit;

  // Timer countdown effect
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

  // Format time helper
  const formatTime = (minutes) => {
    if (minutes === null || minutes === undefined) return 'No limit';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900">Loading Challenge</h3>
          <p className="text-gray-500">Please wait while we prepare your coding challenge...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Challenge</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-4 text-xs text-gray-400">
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Cannot attempt state
  if (canAttempt && !canAttempt.canAttempt) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Cannot Attempt Challenge</h3>
          <p className="mt-1 text-sm text-gray-500">{canAttempt.reason}</p>
          {canAttempt.nextAttemptAt && (
            <p className="mt-2 text-xs text-gray-400">
              Next attempt available: {new Date(canAttempt.nextAttemptAt).toLocaleString()}
            </p>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // No challenge available
  if (!challenge) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">💻</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Challenge Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            This project doesn't have an active coding challenge.
          </p>
          {onClose && (
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Join "{challenge.project.title}"
              </h1>
              <p className="text-gray-600 mt-1">
                Complete this coding challenge to join the project
              </p>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Challenge Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 text-sm font-medium">Difficulty</div>
              <div className="text-lg font-semibold capitalize">
                {challenge.challenge.difficulty_level}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 text-sm font-medium">Language</div>
              <div className="text-lg font-semibold">
                {challenge.challenge.programming_languages?.name || challenge.project.primaryLanguage}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 text-sm font-medium">Time Limit</div>
              <div className="text-lg font-semibold">
                {challenge.challenge.time_limit_minutes ? 
                  formatTime(challenge.challenge.time_limit_minutes) : 
                  'No limit'
                }
              </div>
            </div>
          </div>

          {/* Timer */}
          {startedAt && timeRemaining !== null && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg ${
                timeRemaining <= 10 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    timeRemaining <= 10 ? 'text-red-800' : 'text-yellow-800'
                  }`}>
                    Time Remaining:
                  </span>
                  <span className={`text-xl font-bold ${
                    timeRemaining <= 10 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Challenge Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Challenge Description</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {challenge.challenge.description}
              </pre>
            </div>
          </div>

          {/* Test Cases (if available) */}
          {challenge.challenge.test_cases && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Test Cases</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {typeof challenge.challenge.test_cases === 'string' 
                    ? challenge.challenge.test_cases 
                    : JSON.stringify(challenge.challenge.test_cases, null, 2)
                  }
                </pre>
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Solution</h3>
            <textarea
              value={submittedCode}
              onChange={(e) => setSubmittedCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-lg resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write your solution here..."
              disabled={isSubmitting || (result && result.evaluation)}
            />
            <div className="mt-2 text-sm text-gray-500">
              Character count: {submittedCode.length}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mb-6">
              <div className={`p-4 rounded-lg border ${
                result.passed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">
                    {result.passed ? '✅ Challenge Passed!' : '❌ Challenge Not Passed'}
                  </span>
                  <span className={`text-lg font-bold ${
                    result.passed ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.score}%
                  </span>
                </div>
                
                {result.feedback && (
                  <p className={`text-sm ${
                    result.passed ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.feedback}
                  </p>
                )}
                
                {result.projectJoined && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-blue-700 font-medium">
                      🎉 Congratulations! You have been added to the project as a member.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!startedAt && !result && (
            <div className="flex gap-3">
              <button
                onClick={handleStartChallenge}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || isSubmitting}
              >
                Start Challenge
              </button>
            </div>
          )}

          {startedAt && !result && (
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          )}

          {result && (
            <div className="flex gap-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              )}
              
              {!result.projectJoined && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again Later
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectChallengeInterface;