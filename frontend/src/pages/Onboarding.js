// frontend/src/pages/Onboarding.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onboardingService } from '../services/onboardingService';

function Onboarding() {
  const { user, token, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Data state
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [yearsExperience, setYearsExperience] = useState(0);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError('');

        // Load programming languages and topics in parallel
        const [languagesResponse, topicsResponse] = await Promise.all([
          onboardingService.getProgrammingLanguages(),
          onboardingService.getTopics()
        ]);

        if (languagesResponse.success) {
          setProgrammingLanguages(languagesResponse.data);
        } else {
          throw new Error('Failed to load programming languages');
        }

        if (topicsResponse.success) {
          setTopics(topicsResponse.data);
        } else {
          throw new Error('Failed to load topics');
        }

      } catch (error) {
        console.error('Error loading onboarding data:', error);
        setError('Failed to load onboarding data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Handle language selection
  const handleLanguageToggle = (language) => {
    const isSelected = selectedLanguages.find(l => l.language_id === language.id);
    
    if (isSelected) {
      setSelectedLanguages(selectedLanguages.filter(l => l.language_id !== language.id));
    } else {
      setSelectedLanguages([...selectedLanguages, {
        language_id: language.id,
        name: language.name,
        proficiency_level: 'intermediate' // default
      }]);
    }
  };

  // Handle proficiency change
  const handleProficiencyChange = (languageId, level) => {
    setSelectedLanguages(selectedLanguages.map(lang => 
      lang.language_id === languageId 
        ? { ...lang, proficiency_level: level }
        : lang
    ));
  };

  // Handle topic selection
  const handleTopicToggle = (topic) => {
    const isSelected = selectedTopics.find(t => t.topic_id === topic.id);
    
    if (isSelected) {
      setSelectedTopics(selectedTopics.filter(t => t.topic_id !== topic.id));
    } else {
      setSelectedTopics([...selectedTopics, {
        topic_id: topic.id,
        name: topic.name,
        interest_level: 'high', // default
        experience_level: 'intermediate' // default
      }]);
    }
  };

  // Handle interest level change for a topic
  const handleInterestChange = (topicId, level) => {
    setSelectedTopics(selectedTopics.map(topic => 
      topic.topic_id === topicId 
        ? { ...topic, interest_level: level }
        : topic
    ));
  };

  // Handle experience level change for a topic
  const handleTopicExperienceChange = (topicId, level) => {
    setSelectedTopics(selectedTopics.map(topic => 
      topic.topic_id === topicId 
        ? { ...topic, experience_level: level }
        : topic
    ));
  };

  // FIXED: Complete onboarding with proper error handling
  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      // Validate selections before submission
      if (selectedLanguages.length === 0) {
        setError('Please select at least one programming language.');
        return;
      }

      if (selectedTopics.length === 0) {
        setError('Please select at least one topic of interest.');
        return;
      }

      console.log('Starting onboarding completion with:', {
        languages: selectedLanguages,
        topics: selectedTopics,
        years_experience: yearsExperience
      });

      // Complete onboarding with all data
      const result = await onboardingService.completeOnboarding({
        languages: selectedLanguages,
        topics: selectedTopics,
        years_experience: yearsExperience
      }, token);

      console.log('Onboarding completion result:', result);

      if (result.success) {
        setSuccessMessage('Onboarding completed successfully!');
        
        // Update user context with the returned user data
        if (result.data?.user) {
          console.log('Updating user context with:', result.data.user);
          
          // Use complete replacement to ensure needsOnboarding is updated
          await updateUser(result.data.user, true);
          
          console.log('User context updated successfully');
        } else {
          console.log('No user data in response, refreshing user profile');
          // Fallback: refresh user profile
          await refreshUser();
        }
        
        // Redirect to dashboard after success
        setTimeout(() => {
          console.log('Navigating to dashboard...');
          navigate('/');
        }, 1500);
      } else {
        const errorMsg = result.message || 'Failed to complete onboarding. Please try again.';
        console.error('Onboarding completion failed:', errorMsg);
        setError(errorMsg);
      }

    } catch (error) {
      console.error('Onboarding completion error:', error);
      const errorMessage = error.message || 'Failed to complete onboarding. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Styles (keeping existing styles)
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      color: '#333',
      marginBottom: '10px'
    },
    subtitle: {
      color: '#666',
      marginBottom: '20px'
    },
    stepContainer: {
      marginBottom: '30px'
    },
    stepTitle: {
      color: '#333',
      marginBottom: '20px'
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '10px',
      marginBottom: '20px'
    },
    button: {
      padding: '10px 15px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      backgroundColor: '#fff',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    selectedButton: {
      backgroundColor: '#007bff',
      color: 'white',
      borderColor: '#007bff'
    },
    proficiencyContainer: {
      marginTop: '20px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      borderRadius: '6px'
    },
    topicItem: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    },
    experienceContainer: {
      textAlign: 'center',
      padding: '20px'
    },
    experienceInput: {
      fontSize: '24px',
      padding: '15px',
      border: '2px solid #ddd',
      borderRadius: '8px',
      textAlign: 'center',
      width: '150px',
      margin: '0 auto'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '30px'
    },
    navButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'background-color 0.2s ease'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    buttonDisabled: {
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed'
    },
    error: {
      color: 'red',
      textAlign: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px'
    },
    success: {
      color: 'green',
      textAlign: 'center',
      marginBottom: '15px',
      padding: '10px',
      backgroundColor: '#d4edda',
      border: '1px solid #c3e6cb',
      borderRadius: '4px'
    },
    progressBar: {
      width: '100%',
      height: '6px',
      backgroundColor: '#e9ecef',
      borderRadius: '3px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease',
      width: `${(currentStep / 4) * 100}%`
    }
  };

  // Loading state
  if (loading && programmingLanguages.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Loading onboarding...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to the Platform, {user?.full_name}!</h1>
        <p style={styles.subtitle}>Let's get to know you better to provide the best experience</p>
        
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {successMessage && <div style={styles.success}>{successMessage}</div>}

      {/* Step 1: Programming Languages */}
      {currentStep === 1 && (
        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>What Programming Languages are you most skilled at?</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>Choose three or more languages</p>
          
          <div style={styles.buttonGrid}>
            {programmingLanguages.map(language => (
              <button
                key={language.id}
                onClick={() => handleLanguageToggle(language)}
                style={{
                  ...styles.button,
                  ...(selectedLanguages.find(l => l.language_id === language.id) ? styles.selectedButton : {})
                }}
              >
                {language.name}
              </button>
            ))}
          </div>

          {/* Proficiency Selection */}
          {selectedLanguages.length > 0 && (
            <div style={styles.proficiencyContainer}>
              <h3>Set your proficiency level:</h3>
              {selectedLanguages.map(lang => (
                <div key={lang.language_id} style={{ marginBottom: '15px' }}>
                  <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>{lang.name}:</div>
                  <div>
                    {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                      <label key={level} style={{ marginRight: '15px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`proficiency-${lang.language_id}`}
                          value={level}
                          checked={lang.proficiency_level === level}
                          onChange={() => handleProficiencyChange(lang.language_id, level)}
                          style={{ marginRight: '5px' }}
                        />
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Topics */}
      {currentStep === 2 && (
        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>What topics interest you?</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>Select your areas of interest</p>
          
          <div style={styles.buttonGrid}>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicToggle(topic)}
                style={{
                  ...styles.button,
                  ...(selectedTopics.find(t => t.topic_id === topic.id) ? styles.selectedButton : {})
                }}
              >
                <div>{topic.name}</div>
                <small style={{ opacity: 0.8 }}>{topic.category}</small>
              </button>
            ))}
          </div>

          {/* Topic Interest and Experience Levels */}
          {selectedTopics.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Customize your selections:</h3>
              {selectedTopics.map(topic => (
                <div key={topic.topic_id} style={styles.topicItem}>
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{topic.name}</div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ marginRight: '10px' }}>Interest Level:</span>
                    {['low', 'medium', 'high'].map(level => (
                      <label key={level} style={{ marginRight: '10px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`interest-${topic.topic_id}`}
                          value={level}
                          checked={topic.interest_level === level}
                          onChange={() => handleInterestChange(topic.topic_id, level)}
                          style={{ marginRight: '3px' }}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                  
                  <div>
                    <span style={{ marginRight: '10px' }}>Experience:</span>
                    {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                      <label key={level} style={{ marginRight: '10px', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`experience-${topic.topic_id}`}
                          value={level}
                          checked={topic.experience_level === level}
                          onChange={() => handleTopicExperienceChange(topic.topic_id, level)}
                          style={{ marginRight: '3px' }}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Years of Experience */}
      {currentStep === 3 && (
        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>How many years of programming experience do you have?</h2>
          
          <div style={styles.experienceContainer}>
            <input
              type="number"
              min="0"
              max="50"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
              style={styles.experienceInput}
            />
            <p style={{ marginTop: '15px', color: '#666' }}>
              You have {yearsExperience === 0 ? 'Just getting started' : 
               yearsExperience === 1 ? '1 year' : 
               `${yearsExperience} years`} of experience
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {currentStep === 4 && (
        <div style={styles.stepContainer}>
          <h2 style={styles.stepTitle}>Review Your Information</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Programming Languages ({selectedLanguages.length}):</h3>
            {selectedLanguages.map(lang => (
              <div key={lang.language_id} style={{ marginBottom: '5px' }}>
                <strong>{lang.name}</strong> - {lang.proficiency_level}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Topics of Interest ({selectedTopics.length}):</h3>
            {selectedTopics.map(topic => (
              <div key={topic.topic_id} style={{ marginBottom: '5px' }}>
                <strong>{topic.name}</strong> - Interest: {topic.interest_level}, Experience: {topic.experience_level}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Years of Experience:</h3>
            <div>{yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}</div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={styles.navigationButtons}>
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          style={{
            ...styles.navButton,
            ...styles.secondaryButton,
            ...(currentStep === 1 ? styles.buttonDisabled : {})
          }}
        >
          Previous
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => {
              if (currentStep === 1 && selectedLanguages.length < 3) {
                setError('Please select at least 3 programming languages.');
                return;
              }
              if (currentStep === 2 && selectedTopics.length === 0) {
                setError('Please select at least one topic.');
                return;
              }
              setError('');
              setCurrentStep(currentStep + 1);
            }}
            style={{
              ...styles.navButton,
              ...styles.primaryButton
            }}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleCompleteOnboarding}
            disabled={loading}
            style={{
              ...styles.navButton,
              ...styles.primaryButton,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'Completing...' : 'Complete Onboarding'}
          </button>
        )}
      </div>
    </div>
  );
}

export default Onboarding;