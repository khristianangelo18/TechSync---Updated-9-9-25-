// frontend/src/components/ChallengeFailureAlert.js
// Comforting alert component for users who have failed multiple times

import React from 'react';

const ChallengeFailureAlert = ({ alertData, onClose, onContinue, projectTitle }) => {
  if (!alertData || !alertData.shouldShow) {
    return null;
  }

  const { attemptCount, message } = alertData;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      fontFamily: 'Arial, sans-serif'
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '0',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      animation: 'slideIn 0.3s ease-out'
    },
    header: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '24px',
      borderRadius: '12px 12px 0 0',
      textAlign: 'center',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '16px',
      right: '20px',
      background: 'none',
      border: 'none',
      color: 'white',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      opacity: 0.8,
      transition: 'opacity 0.2s ease'
    },
    icon: {
      fontSize: '48px',
      marginBottom: '12px',
      display: 'block'
    },
    title: {
      margin: '0 0 8px 0',
      fontSize: '24px',
      fontWeight: 'bold'
    },
    subtitle: {
      margin: 0,
      fontSize: '16px',
      opacity: 0.9,
      fontWeight: 'normal'
    },
    content: {
      padding: '32px 24px'
    },
    attemptBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#ffeeba',
      color: '#856404',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 'bold',
      marginBottom: '20px'
    },
    message: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#333',
      marginBottom: '24px',
      textAlign: 'left'
    },
    suggestions: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px'
    },
    suggestionsTitle: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#495057',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    suggestionsList: {
      margin: 0,
      paddingLeft: '20px',
      color: '#6c757d'
    },
    suggestionItem: {
      marginBottom: '8px',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    buttonContainer: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      marginTop: '24px'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '120px'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white',
    },
    tertiaryButton: {
      backgroundColor: 'white',
      color: '#007bff',
      border: '2px solid #007bff'
    }
  };

  const getSuggestions = (count) => {
    const baseSuggestions = [
      "Review the challenge requirements carefully",
      "Break down the problem into smaller steps",
      "Look for coding examples in the same programming language",
      "Check your syntax and logic flow"
    ];

    const advancedSuggestions = [
      "Consider taking a coding tutorial or course",
      "Practice with simpler coding challenges first",
      "Join coding communities for help and support",
      "Try pair programming with a more experienced developer"
    ];

    if (count >= 15) {
      return [...baseSuggestions, ...advancedSuggestions];
    } else if (count >= 10) {
      return [...baseSuggestions, ...advancedSuggestions.slice(0, 2)];
    } else {
      return baseSuggestions;
    }
  };

  const suggestions = getSuggestions(attemptCount);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
      <div style={styles.overlay} onClick={handleOverlayClick}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <button 
              style={styles.closeButton}
              onClick={onClose}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
            <span style={styles.icon}>💪</span>
            <h2 style={styles.title}>Keep Going!</h2>
            <p style={styles.subtitle}>Every expert was once a beginner</p>
          </div>
          
          <div style={styles.content}>
            <div style={styles.attemptBadge}>
              📊 {attemptCount} attempts made
            </div>
            
            <div style={styles.message}>
              {message}
            </div>
            
            <div style={styles.suggestions}>
              <h4 style={styles.suggestionsTitle}>
                💡 Helpful Tips
              </h4>
              <ul style={styles.suggestionsList}>
                {suggestions.map((suggestion, index) => (
                  <li key={index} style={styles.suggestionItem}>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            
            <div style={styles.buttonContainer}>
              <button 
                style={{ ...styles.button, ...styles.tertiaryButton }}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#007bff';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#007bff';
                }}
              >
                Take a Break
              </button>
              <button 
                style={{ ...styles.button, ...styles.primaryButton }}
                onClick={onContinue}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChallengeFailureAlert;