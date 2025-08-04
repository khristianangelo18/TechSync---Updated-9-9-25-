import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onboardingService } from '../services/onboardingService';

function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Available data from API
  const [programmingLanguages, setProgrammingLanguages] = useState([]);
  const [topics, setTopics] = useState([]);
  
  // User selections
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [yearsExperience, setYearsExperience] = useState(0);
  
  const { user, token, updateUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Fetch programming languages and topics on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [languagesResponse, topicsResponse] = await Promise.all([
          onboardingService.getProgrammingLanguages(),
          onboardingService.getTopics()
        ]);
        
        if (languagesResponse.success) {
          setProgrammingLanguages(languagesResponse.data);
        }
        
        if (topicsResponse.success) {
          setTopics(topicsResponse.data);
        }
        
      } catch (error) {
        setError('Failed to load onboarding data. Please refresh the page.');
        console.error('Fetch onboarding data error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
        proficiency_level: 'intermediate', // default
        years_experience: 1 // default
      }]);
    }
  };

  // Handle proficiency level change for a language
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

  // Complete onboarding
  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate selections
      if (selectedLanguages.length === 0) {
        setError('Please select at least one programming language.');
        return;
      }

      if (selectedTopics.length === 0) {
        setError('Please select at least one topic of interest.');
        return;
      }

      // Complete onboarding
      const result = await onboardingService.completeOnboarding({
        languages: selectedLanguages,
        topics: selectedTopics,
        years_experience: yearsExperience
      }, token);

      if (result.success) {
        setSuccessMessage('Onboarding completed successfully!');
        
        // Update user context with the returned user data (includes languages and topics)
        if (result.data && result.data.user) {
          await updateUser(result.data.user, true); // true for complete replacement
        } else {
          // Fallback: refresh user profile if data not returned
          await refreshUser();
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.message || 'Failed to complete onboarding');
      }

    } catch (error) {
      setError('Failed to complete onboarding. Please try again.');
      console.error('Complete onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
      fontSize: '16px'
    },
    stepContainer: {
      marginBottom: '30px'
    },
    stepTitle: {
      fontSize: '20px',
      color: '#333',
      marginBottom: '15px',
      borderBottom: '2px solid #007bff',
      paddingBottom: '5px'
    },
    buttonGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: '10px',
      marginBottom: '20px'
    },
    button: {
      padding: '10px 15px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      backgroundColor: 'white',
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s ease',
      fontSize: '14px'
    },
    buttonSelected: {
      borderColor: '#007bff',
      backgroundColor: '#007bff',
      color: 'white'
    },
    languageItem: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    },
    languageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    languageName: {
      fontWeight: 'bold',
      color: '#333'
    },
    selectContainer: {
      display: 'flex',
      gap: '10px',
      alignItems: 'center'
    },
    select: {
      padding: '5px 10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    topicItem: {
      border: '1px solid #ddd',
      borderRadius: '6px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#f9f9f9'
    },
    topicHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    topicName: {
      fontWeight: 'bold',
      color: '#333'
    },
    topicCategory: {
      fontSize: '12px',
      color: '#666',
      backgroundColor: '#e9ecef',
      padding: '2px 6px',
      borderRadius: '3px'
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
                  ...(selectedLanguages.find(l => l.language_id === language.id) ? styles.buttonSelected : {})
                }}
              >
                {language.name}
              </button>
            ))}
          </div>

          {selectedLanguages.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Set your proficiency levels:</h3>
              {selectedLanguages.map(lang => (
                <div key={lang.language_id} style={styles.languageItem}>
                  <div style={styles.languageHeader}>
                    <span style={styles.languageName}>{lang.name}</span>
                    <div style={styles.selectContainer}>
                      <label>Proficiency:</label>
                      <select
                        value={lang.proficiency_level}
                        onChange={(e) => handleProficiencyChange(lang.language_id, e.target.value)}
                        style={styles.select}
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                    </div>
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
          <h2 style={styles.stepTitle}>What technology topics are you most interested in?</h2>
          <p style={{ marginBottom: '20px', color: '#666' }}>Choose your areas of interest</p>
          
          <div style={styles.buttonGrid}>
            {topics.map(topic => (
              <button
                key={topic.id}
                onClick={() => handleTopicToggle(topic)}
                style={{
                  ...styles.button,
                  ...(selectedTopics.find(t => t.topic_id === topic.id) ? styles.buttonSelected : {})
                }}
              >
                {topic.name}
              </button>
            ))}
          </div>

          {selectedTopics.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>Set your interest and experience levels:</h3>
              {selectedTopics.map(topic => (
                <div key={topic.topic_id} style={styles.topicItem}>
                  <div style={styles.topicHeader}>
                    <div>
                      <span style={styles.topicName}>{topic.name}</span>
                      {topics.find(t => t.id === topic.topic_id)?.category && (
                        <span style={styles.topicCategory}>
                          {topics.find(t => t.id === topic.topic_id).category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={styles.selectContainer}>
                    <label>Interest:</label>
                    <select
                      value={topic.interest_level}
                      onChange={(e) => handleInterestChange(topic.topic_id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    
                    <label>Experience:</label>
                    <select
                      value={topic.experience_level}
                      onChange={(e) => handleTopicExperienceChange(topic.topic_id, e.target.value)}
                      style={styles.select}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
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
              value={yearsExperience}
              onChange={(e) => setYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
              style={styles.experienceInput}
              min="0"
              max="50"
            />
            <p style={{ marginTop: '15px', color: '#666' }}>
              {yearsExperience === 0 ? 'Just getting started' : 
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