import React, { useState, useEffect, useCallback } from 'react';

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

  // Use empty string for proxy - let the proxy handle routing
  const API_BASE_URL = '';
  
  // Debug logging
  console.log('Using proxy mode - API_BASE_URL is empty, proxy will handle routing');

  const checkCanAttempt = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Multiple cache busters
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/can-attempt?t=${timestamp}&r=${randomId}&bust=true`;
      
      console.log('Calling can-attempt URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Can-attempt response status:', response.status);
      console.log('Can-attempt response headers:', [...response.headers.entries()]);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Expected JSON, got:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Backend might not be running properly.');
      }

      const data = await response.json();
      
      if (response.ok) {
        setCanAttempt(data.data);
      } else {
        console.error('Error checking attempt eligibility:', data.message);
        setError(data.message || 'Failed to check attempt eligibility');
      }
    } catch (error) {
      console.error('Error checking attempt eligibility:', error);
      setError(error.message);
    }
  }, [projectId, API_BASE_URL]);

  const fetchChallenge = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      // Multiple cache busters
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/challenge?t=${timestamp}&r=${randomId}&bust=true`;
      
      console.log('Calling challenge URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      console.log('Challenge response status:', response.status);
      console.log('Challenge response headers:', [...response.headers.entries()]);
      
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Expected JSON, got:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Backend might not be running properly.');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch challenge');
      }

      console.log('Challenge data received:', data);
      
      setChallenge(data.data);
      setSubmittedCode(data.data.challenge.starter_code || '');
      setTimeRemaining(data.data.challenge.time_limit_minutes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      setError(error.message);
      setLoading(false);
    }
  }, [projectId, API_BASE_URL]);

  useEffect(() => {
    if (projectId) {
      console.log('Starting challenge fetch for project:', projectId);
      checkCanAttempt();
      fetchChallenge();
    }
  }, [projectId, checkCanAttempt, fetchChallenge]);

  useEffect(() => {
    let timer;
    if (challenge && challenge.time_limit_minutes && timeRemaining > 0 && !result) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Handle time up directly using ref to avoid circular dependency
            alert('Time is up! Your current code will be submitted automatically.');
            handleSubmitRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [challenge, timeRemaining, result]);

  const handleSubmit = useCallback(async () => {
    if (!submittedCode.trim()) {
      alert('Please write your solution before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        submittedCode,
        startedAt
      };

      // Add challengeId for temporary challenges
      if (challenge?.challenge?.isTemporary) {
        payload.challengeId = challenge.challenge.id;
      }

      const url = `${API_BASE_URL}/api/challenges/project/${projectId}/attempt`;
      
      console.log('Submitting to URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        body: JSON.stringify(payload)
      });

      console.log('Submit response status:', response.status);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Expected JSON, got:', textResponse.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setResult(data.data);
      
      // Show success/failure message
      if (data.data.projectJoined) {
        setTimeout(() => {
          alert('🎉 Congratulations! You passed the challenge and joined the project!');
          if (onClose) onClose();
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [submittedCode, startedAt, challenge, projectId, onClose, API_BASE_URL]);

  // Add a ref to handle auto-submit on time up
  const handleSubmitRef = React.useRef();
  handleSubmitRef.current = handleSubmit;

  const handleStartChallenge = () => {
    setStartedAt(new Date().toISOString());
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⚠️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    }
  };

  // Debug info display
  if (process.env.NODE_ENV === 'development') {
    console.log('Component state:', {
      loading,
      error,
      canAttempt,
      challenge: !!challenge,
      projectId
    });
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="ml-4">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Challenge</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          
          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs">
            <p><strong>Project ID:</strong> {projectId}</p>
            <p><strong>API Base URL:</strong> {API_BASE_URL}</p>
            <p><strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
          </div>
          
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              checkCanAttempt();
              fetchChallenge();
            }} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

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
          {/* Challenge Info */}
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
              <div className={`p-4 rounded-lg ${timeRemaining <= 10 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${timeRemaining <= 10 ? 'text-red-800' : 'text-yellow-800'}`}>
                    Time Remaining:
                  </span>
                  <span className={`text-xl font-bold ${timeRemaining <= 10 ? 'text-red-600' : 'text-yellow-600'}`}>
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
              <pre className="whitespace-pre-wrap text-sm">
                {challenge.challenge.description || challenge.challenge.problem_statement}
              </pre>
            </div>
          </div>

          {/* Code Editor */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Your Solution</h3>
            <textarea
              value={submittedCode}
              onChange={(e) => setSubmittedCode(e.target.value)}
              className="w-full h-64 p-4 font-mono text-sm border border-gray-300 rounded-lg resize-y"
              placeholder="Write your solution here..."
              disabled={isSubmitting || (result && result.evaluation)}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!startedAt && !result && (
            <div className="flex gap-3">
              <button
                onClick={handleStartChallenge}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
          )}

          {/* Results */}
          {result && result.evaluation && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Results</h3>
              
              <div className="space-y-4">
                {/* Overall Status */}
                <div className={`p-4 rounded-lg border ${getStatusColor(result.evaluation.status)}`}>
                  <div className="flex items-center">
                    <span className="mr-3 text-2xl">{getStatusIcon(result.evaluation.status)}</span>
                    <div>
                      <h4 className="font-semibold capitalize">{result.evaluation.status}</h4>
                      <p>Score: {result.evaluation.score}% ({result.evaluation.passed_tests}/{result.evaluation.total_tests} tests passed)</p>
                    </div>
                  </div>
                </div>

                {/* Project Join Status */}
                {result.projectJoined ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3 text-2xl">✅</span>
                      <div>
                        <h3 className="font-semibold text-green-800">🎉 Welcome to the Project!</h3>
                        <p className="text-green-700">You successfully joined "{challenge.project.title}"!</p>
                      </div>
                    </div>
                  </div>
                ) : result.evaluation.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <span className="text-red-500 mr-3 text-2xl">❌</span>
                      <div>
                        <h3 className="font-semibold text-red-800">Challenge Not Passed</h3>
                        <p className="text-red-700">You need at least 70% to join the project. You can try again in 1 hour.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectChallengeInterface;