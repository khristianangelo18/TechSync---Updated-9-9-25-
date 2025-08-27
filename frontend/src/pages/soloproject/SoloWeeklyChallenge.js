// frontend/src/pages/soloproject/SoloWeeklyChallenge.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Removed unused import

function SoloWeeklyChallenge() {
  const { projectId } = useParams();
  // const { user } = useAuth(); // Removed unused variable
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

  // Mock current challenge data
  useEffect(() => {
    const mockCurrentChallenge = {
      id: 1,
      title: "Array Manipulation Challenge",
      description: "Given an array of integers, implement a function that finds the two numbers that sum up to a specific target. Return the indices of these two numbers.",
      difficulty: "medium",
      points: 150,
      timeLimit: "30 minutes",
      category: "algorithms",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      requirements: [
        "Function should handle edge cases (empty array, no solution)",
        "Time complexity should be O(n) or better",
        "Include proper error handling",
        "Write clean, readable code with comments"
      ],
      examples: [
        {
          input: "nums = [2,7,11,15], target = 9",
          output: "[0,1]",
          explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]"
        },
        {
          input: "nums = [3,2,4], target = 6",
          output: "[1,2]",
          explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]"
        }
      ],
      hints: [
        "Consider using a hash map to store numbers you've seen",
        "Think about what you need to look for as you iterate",
        "Remember to check if the complement exists before the current element"
      ],
      submitted: false,
      userSubmission: null
    };

    const mockPastChallenges = [
      {
        id: 2,
        title: "String Palindrome Checker",
        difficulty: "easy",
        points: 100,
        category: "strings",
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        score: 95,
        timeSpent: "15 minutes",
        status: "completed"
      },
      {
        id: 3,
        title: "Binary Tree Traversal",
        difficulty: "hard",
        points: 250,
        category: "data-structures",
        completedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
        score: 78,
        timeSpent: "45 minutes",
        status: "completed"
      },
      {
        id: 4,
        title: "API Rate Limiter",
        difficulty: "medium",
        points: 180,
        category: "system-design",
        completedAt: null,
        score: 0,
        timeSpent: "0 minutes",
        status: "missed"
      }
    ];

    setCurrentChallenge(mockCurrentChallenge);
    setPastChallenges(mockPastChallenges);
    setLoading(false);
  }, [projectId]);

  const handleSubmitChallenge = async (e) => {
    e.preventDefault();
    if (!submission.code.trim()) return;

    try {
      setSubmitting(true);
      
      // Mock submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update challenge as submitted
      setCurrentChallenge(prev => ({
        ...prev,
        submitted: true,
        userSubmission: {
          ...submission,
          submittedAt: new Date(),
          score: Math.floor(Math.random() * 30) + 70, // Random score 70-100
          feedback: "Great solution! Your implementation handles edge cases well and has optimal time complexity."
        }
      }));

      setShowSubmission(false);
      setSubmission({ code: '', description: '', language: 'javascript' });
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#28a745';
      case 'medium': return '#ffc107';
      case 'hard': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'algorithms': return '🧮';
      case 'data-structures': return '🗂️';
      case 'strings': return '📝';
      case 'system-design': return '🏗️';
      case 'database': return '🗄️';
      default: return '💻';
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Less than 1 hour left';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      fontSize: '28px',
      margin: '0 0 8px 0',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#6c757d',
      fontSize: '16px',
      margin: 0
    },
    tabsContainer: {
      display: 'flex',
      gap: '4px',
      marginBottom: '30px',
      borderBottom: '1px solid #e9ecef'
    },
    tab: {
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#6c757d',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      borderBottom: '2px solid transparent',
      transition: 'all 0.2s ease'
    },
    tabActive: {
      color: '#6f42c1',
      borderBottomColor: '#6f42c1'
    },
    challengeCard: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      padding: '30px',
      marginBottom: '30px'
    },
    challengeHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px'
    },
    challengeTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 8px 0',
      flex: 1
    },
    challengeMeta: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    difficultyBadge: {
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white',
      textTransform: 'capitalize'
    },
    pointsBadge: {
      backgroundColor: '#6f42c1',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    categoryBadge: {
      backgroundColor: '#f8f9fa',
      color: '#6c757d',
      padding: '6px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: '500'
    },
    timeRemaining: {
      fontSize: '14px',
      color: '#dc3545',
      fontWeight: '500',
      marginLeft: '16px'
    },
    challengeDescription: {
      fontSize: '16px',
      color: '#333',
      lineHeight: '1.6',
      marginBottom: '24px'
    },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 16px 0'
    },
    requirementsList: {
      margin: 0,
      paddingLeft: '20px'
    },
    requirementItem: {
      marginBottom: '8px',
      color: '#333',
      lineHeight: '1.5'
    },
    examplesGrid: {
      display: 'grid',
      gap: '16px'
    },
    exampleCard: {
      backgroundColor: '#f8f9fa',
      padding: '16px',
      borderRadius: '8px',
      borderLeft: '4px solid #6f42c1'
    },
    exampleLabel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '8px'
    },
    exampleCode: {
      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
      fontSize: '14px',
      color: '#333',
      backgroundColor: 'white',
      padding: '8px 12px',
      borderRadius: '4px',
      marginBottom: '8px'
    },
    exampleExplanation: {
      fontSize: '13px',
      color: '#6c757d',
      fontStyle: 'italic'
    },
    hintsList: {
      margin: 0,
      paddingLeft: '20px'
    },
    hintItem: {
      marginBottom: '8px',
      color: '#6c757d',
      lineHeight: '1.5'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #e9ecef'
    },
    submitButton: {
      backgroundColor: '#6f42c1',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    submittedBadge: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      border: 'none',
      cursor: 'default'
    },
    submissionCard: {
      backgroundColor: '#e8f5e8',
      border: '1px solid #28a745',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px'
    },
    submissionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#28a745',
      margin: '0 0 12px 0'
    },
    submissionMeta: {
      fontSize: '14px',
      color: '#6c757d',
      marginBottom: '12px'
    },
    submissionFeedback: {
      fontSize: '14px',
      color: '#333',
      lineHeight: '1.5'
    },
    pastChallengesGrid: {
      display: 'grid',
      gap: '16px'
    },
    pastChallengeCard: {
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      transition: 'all 0.2s ease'
    },
    pastChallengeTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 12px 0'
    },
    pastChallengeMeta: {
      display: 'flex',
      gap: '16px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    scoreDisplay: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#6f42c1'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      color: 'white'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      width: '90%',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 24px 0'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '8px',
      display: 'block'
    },
    formSelect: {
      width: '200px',
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    codeTextarea: {
      width: '100%',
      height: '300px',
      padding: '16px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
      resize: 'vertical'
    },
    descriptionTextarea: {
      width: '100%',
      height: '100px',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical'
    },
    modalActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '20px',
      borderTop: '1px solid #e9ecef'
    },
    cancelButton: {
      padding: '12px 24px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#6c757d',
      fontSize: '14px',
      cursor: 'pointer'
    },
    modalSubmitButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#6f42c1',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500'
    },
    loadingState: {
      textAlign: 'center',
      padding: '60px',
      color: '#6c757d'
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px',
      color: '#6c757d'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>Loading challenge...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Weekly Challenge</h1>
        <p style={styles.subtitle}>Test your skills with curated programming challenges</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
        {[
          { key: 'current', label: 'Current Challenge' },
          { key: 'past', label: 'Past Challenges' }
        ].map(tab => (
          <button
            key={tab.key}
            style={{
              ...styles.tab,
              ...(activeTab === tab.key ? styles.tabActive : {})
            }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Current Challenge Tab */}
      {activeTab === 'current' && currentChallenge && (
        <div style={styles.challengeCard}>
          <div style={styles.challengeHeader}>
            <div style={{ flex: 1 }}>
              <h2 style={styles.challengeTitle}>{currentChallenge.title}</h2>
              <div style={styles.challengeMeta}>
                <span style={{
                  ...styles.difficultyBadge,
                  backgroundColor: getDifficultyColor(currentChallenge.difficulty)
                }}>
                  {currentChallenge.difficulty}
                </span>
                <span style={styles.pointsBadge}>
                  {currentChallenge.points} points
                </span>
                <span style={styles.categoryBadge}>
                  {getCategoryIcon(currentChallenge.category)} {currentChallenge.category}
                </span>
                <span style={styles.timeRemaining}>
                  ⏰ {getTimeRemaining(currentChallenge.endDate)}
                </span>
              </div>
            </div>
          </div>

          <p style={styles.challengeDescription}>{currentChallenge.description}</p>

          {/* Requirements */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Requirements</h3>
            <ul style={styles.requirementsList}>
              {currentChallenge.requirements.map((req, index) => (
                <li key={index} style={styles.requirementItem}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Examples */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Examples</h3>
            <div style={styles.examplesGrid}>
              {currentChallenge.examples.map((example, index) => (
                <div key={index} style={styles.exampleCard}>
                  <div style={styles.exampleLabel}>Example {index + 1}:</div>
                  <div style={styles.exampleCode}>
                    <strong>Input:</strong> {example.input}<br/>
                    <strong>Output:</strong> {example.output}
                  </div>
                  <div style={styles.exampleExplanation}>{example.explanation}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hints */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Hints</h3>
            <ul style={styles.hintsList}>
              {currentChallenge.hints.map((hint, index) => (
                <li key={index} style={styles.hintItem}>{hint}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={styles.actionButtons}>
            {currentChallenge.submitted ? (
              <div style={styles.submittedBadge}>
                ✅ Challenge Completed
              </div>
            ) : (
              <button
                style={styles.submitButton}
                onClick={() => setShowSubmission(true)}
              >
                Submit Solution
              </button>
            )}
          </div>

          {/* User Submission Display */}
          {currentChallenge.userSubmission && (
            <div style={styles.submissionCard}>
              <h4 style={styles.submissionTitle}>Your Submission</h4>
              <div style={styles.submissionMeta}>
                Score: <strong>{currentChallenge.userSubmission.score}/100</strong> • 
                Submitted on {formatDate(currentChallenge.userSubmission.submittedAt)} •
                Language: {currentChallenge.userSubmission.language}
              </div>
              <div style={styles.submissionFeedback}>
                <strong>Feedback:</strong> {currentChallenge.userSubmission.feedback}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past Challenges Tab */}
      {activeTab === 'past' && (
        <div style={styles.pastChallengesGrid}>
          {pastChallenges.map((challenge) => (
            <div key={challenge.id} style={styles.pastChallengeCard}>
              <h3 style={styles.pastChallengeTitle}>{challenge.title}</h3>
              <div style={styles.pastChallengeMeta}>
                <span style={{
                  ...styles.difficultyBadge,
                  backgroundColor: getDifficultyColor(challenge.difficulty)
                }}>
                  {challenge.difficulty}
                </span>
                
                <span style={styles.pointsBadge}>
                  {challenge.points} points
                </span>
                
                <span style={styles.categoryBadge}>
                  {getCategoryIcon(challenge.category)} {challenge.category}
                </span>
                
                {challenge.status === 'completed' ? (
                  <>
                    <span style={styles.scoreDisplay}>
                      Score: {challenge.score}/100
                    </span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: '#28a745'
                    }}>
                      Completed
                    </span>
                    <span style={{ fontSize: '14px', color: '#6c757d' }}>
                      {formatDate(challenge.completedAt)} • {challenge.timeSpent}
                    </span>
                  </>
                ) : (
                  <span style={{
                    ...styles.statusBadge,
                    backgroundColor: '#dc3545'
                  }}>
                    Missed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Solution Modal */}
      {showSubmission && (
        <div style={styles.modal} onClick={() => setShowSubmission(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Submit Your Solution</h2>
            
            <form onSubmit={handleSubmitChallenge}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Programming Language</label>
                <select
                  style={styles.formSelect}
                  value={submission.language}
                  onChange={(e) => setSubmission({
                    ...submission,
                    language: e.target.value
                  })}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="csharp">C#</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Your Solution *</label>
                <textarea
                  style={styles.codeTextarea}
                  value={submission.code}
                  onChange={(e) => setSubmission({
                    ...submission,
                    code: e.target.value
                  })}
                  placeholder="Paste your solution code here..."
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Explanation (Optional)</label>
                <textarea
                  style={styles.descriptionTextarea}
                  value={submission.description}
                  onChange={(e) => setSubmission({
                    ...submission,
                    description: e.target.value
                  })}
                  placeholder="Explain your approach and reasoning..."
                />
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowSubmission(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={styles.modalSubmitButton}
                  disabled={submitting || !submission.code.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Solution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoloWeeklyChallenge;