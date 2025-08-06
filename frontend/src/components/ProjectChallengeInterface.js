import React, { useState, useEffect } from 'react';
import { Play, Clock, Code, CheckCircle, XCircle, AlertCircle, Users, Trophy, Target } from 'lucide-react';

const ProjectChallengeInterface = ({ projectId }) => {
  const [challenge, setChallenge] = useState(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAttempt, setCanAttempt] = useState(null);

  useEffect(() => {
    if (projectId) {
      checkCanAttempt();
      fetchChallenge();
    }
  }, [projectId]);

  useEffect(() => {
    let timer;
    if (challenge && challenge.time_limit_minutes && timeRemaining > 0 && !result) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
    }
    return () => clearInterval(timer);
  }, [challenge, timeRemaining, result]);

  const checkCanAttempt = async () => {
    try {
      const response = await fetch(`/api/challenges/project/${projectId}/can-attempt`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCanAttempt(data.data);
    } catch (error) {
      console.error('Error checking attempt eligibility:', error);
    }
  };

  const fetchChallenge = async () => {
    try {
      const response = await fetch(`/api/challenges/project/${projectId}/challenge`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      setChallenge(data.data);
      setSubmittedCode(data.data.challenge.starter_code || '');
      setTimeRemaining(data.data.challenge.time_limit_minutes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenge:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleStartChallenge = () => {
    setStartedAt(new Date().toISOString());
  };

  const handleSubmit = async () => {
    if (!submittedCode.trim()) {
      alert('Please write your solution before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/challenges/project/${projectId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          submittedCode,
          startedAt
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setResult(data.data);
      
      // Show success/failure message
      if (data.data.projectJoined) {
        alert('🎉 Congratulations! You passed the challenge and joined the project!');
      }
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    if (!result) {
      alert('Time is up! Your current code will be submitted automatically.');
      handleSubmit();
    }
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
        return <CheckCircle className="text-green-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return <AlertCircle className="text-yellow-500" size={20} />;
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error Loading Challenge</h3>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
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
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Cannot Attempt Challenge</h3>
          <p className="mt-1 text-sm text-gray-500">{canAttempt.reason}</p>
          {canAttempt.nextAttemptAt && (
            <p className="mt-2 text-xs text-gray-400">
              Next attempt available: {new Date(canAttempt.nextAttemptAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <Code className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Challenge Available</h3>
          <p className="mt-1 text-sm text-gray-500">
            This project doesn't have an active coding challenge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Join {challenge.project.title}</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`px-3 py-1 rounded-full font-medium ${
                challenge.challenge.difficulty_level === 'easy' ? 'bg-green-100 text-green-800' :
                challenge.challenge.difficulty_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                challenge.challenge.difficulty_level === 'hard' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {challenge.challenge.difficulty_level.toUpperCase()}
              </span>
              <span className="flex items-center">
                <Code size={16} className="mr-1" />
                {challenge.project.primaryLanguage}
              </span>
              <span className="flex items-center">
                <Users size={16} className="mr-1" />
                {challenge.project.spotsRemaining} spots remaining
              </span>
            </div>
          </div>
          {timeRemaining !== null && startedAt && !result && (
            <div className="text-right">
              <div className="flex items-center text-lg font-semibold text-orange-600">
                <Clock size={20} className="mr-2" />
                {formatTime(timeRemaining)} remaining
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Target className="text-blue-500 mr-3 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900">Challenge Requirement</h3>
            <p className="text-blue-700 text-sm mt-1">
              Complete this coding challenge with a score of 70% or higher to automatically join the project.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Problem Description */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">{challenge.challenge.title}</h2>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-gray-700">
                {challenge.challenge.description}
              </div>
            </div>
          </div>

          {/* Test Cases Preview */}
          {challenge.challenge.test_cases && challenge.challenge.test_cases.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
              <div className="space-y-3">
                {challenge.challenge.test_cases.slice(0, 3).map((testCase, index) => (
                  <div key={index} className="bg-gray-50 rounded-md p-3">
                    <div className="text-sm text-gray-600 mb-1">
                      {testCase.description || `Test Case ${index + 1}`}
                    </div>
                    <code className="text-sm">
                      {testCase.function_call} → {JSON.stringify(testCase.expected)}
                    </code>
                  </div>
                ))}
                {challenge.challenge.test_cases.length > 3 && (
                  <div className="text-sm text-gray-500 italic">
                    + {challenge.challenge.test_cases.length - 3} more test cases (hidden)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">About the Project</h2>
            <p className="text-gray-700 mb-4">{challenge.project.description}</p>
            <div className="flex items-center text-sm text-gray-600">
              <Users size={16} className="mr-2" />
              <span>{challenge.project.spotsRemaining} spots remaining</span>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Your Solution</h2>
              {!startedAt && !result && (
                <button
                  onClick={handleStartChallenge}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Start Challenge
                </button>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={submittedCode}
                onChange={(e) => setSubmittedCode(e.target.value)}
                className="w-full h-96 font-mono text-sm border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Write your solution here..."
                disabled={!startedAt || result?.projectJoined}
              />
            </div>
            {startedAt && !result && (
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Evaluating Solution...
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-2" />
                      Submit Solution
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Results</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.evaluation.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(result.evaluation.status)}`}>
                      {result.evaluation.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Score:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold">{result.evaluation.score}%</span>
                    {result.evaluation.score >= 70 && <Trophy className="text-yellow-500" size={20} />}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Test Cases:</span>
                  <span className="font-medium">
                    {result.evaluation.passedTests}/{result.evaluation.totalTests} passed
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Code Quality:</span>
                  <span className="font-medium">{result.evaluation.codeQuality}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Execution Time:</span>
                  <span className="font-medium">{result.evaluation.executionTime}ms</span>
                </div>
                
                {result.evaluation.feedback && (
                  <div>
                    <div className="text-gray-600 mb-2">Feedback:</div>
                    <div className="bg-gray-50 rounded-md p-3 font-mono text-sm whitespace-pre-line border">
                      {result.evaluation.feedback}
                    </div>
                  </div>
                )}

                {result.projectJoined ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-500 mr-3" size={24} />
                      <div>
                        <h3 className="font-semibold text-green-800">🎉 Welcome to the Project!</h3>
                        <p className="text-green-700">You successfully passed the coding challenge and joined "{challenge.project.title}"!</p>
                      </div>
                    </div>
                  </div>
                ) : result.evaluation.status === 'failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <XCircle className="text-red-500 mr-3" size={24} />
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