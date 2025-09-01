// frontend/src/pages/Onboarding.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { onboardingService } from '../services/onboardingService';
import { ArrowLeft } from 'lucide-react';

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

  // Themed Loading Component matching App.js
  const ThemedOnboardingLoadingScreen = () => {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F1116',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <style>
          {`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: 0.5;
              }
            }
            
            @keyframes rotate {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
            
            @keyframes slideProgress {
              0% {
                transform: translateX(-100px);
              }
              50% {
                transform: translateX(140px);
              }
              100% {
                transform: translateX(-100px);
              }
            }
            
            .loading-spinner {
              animation: rotate 2s linear infinite;
            }
            
            .loading-text {
              animation: pulse 1.5s ease-in-out infinite;
            }
          `}
        </style>

        {/* Background Elements */}
        <svg 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
          viewBox="0 0 1440 1024"
          preserveAspectRatio="none"
        >
          <path
            d="M0,400 Q200,300 400,350 T800,320 Q1000,280 1200,340 L1440,360 L1440,1024 L0,1024 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            opacity={0.02}
          />
          <path
            d="M0,600 Q300,500 600,550 T1200,520 L1440,540 L1440,1024 L0,1024 Z"
            fill="rgba(255,255,255,0.02)"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
            opacity={0.015}
          />
        </svg>

        {/* Code symbols background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '15%', top: '35%', color: '#3A4158', transform: 'rotate(15deg)'
            }}>&#60;/&#62;</div>
            <div style={{
              position: 'absolute',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontStyle: 'normal',
              fontWeight: 900,
              fontSize: '24px',
              lineHeight: '29px',
              userSelect: 'none',
              pointerEvents: 'none',
              left: '65%', top: '25%', color: '#5A6B8C', transform: 'rotate(-45deg)'
            }}>&#60;/&#62;</div>
          </div>
        </div>

        {/* Main Loading Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center'
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
              borderRadius: '6px',
              transform: 'rotate(45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }} className="loading-spinner">
              <div style={{
                width: '24px',
                height: '24px',
                background: 'white',
                borderRadius: '3px',
                transform: 'rotate(-45deg)'
              }} />
            </div>
            <span style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              letterSpacing: '-0.025em'
            }}>TechSync</span>
          </div>

          {/* Loading Text */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '500',
            color: '#d1d5db',
            margin: '0 0 1rem 0'
          }} className="loading-text">
            Loading onboarding...
          </h2>

          {/* Progress Bar */}
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            margin: '0 auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '60px',
              height: '100%',
              backgroundColor: '#60a5fa',
              borderRadius: '2px',
              animation: 'slideProgress 1.5s ease-in-out infinite',
              background: 'linear-gradient(to right, #60a5fa, #3b82f6)'
            }} />
          </div>
        </div>
      </div>
    );
  };

  // Dark theme styles matching your design
  const styles = {
    pageContainer: {
      minHeight: '100vh',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    backgroundLayer: {
      position: 'fixed',
      inset: 0,
      zIndex: 1
    },
    figmaBackground: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      overflow: 'hidden'
    },
    codeSymbol: {
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none'
    },
    container: {
      position: 'relative',
      zIndex: 10,
      maxWidth: '800px',
      width: '100%',
      padding: '0.5rem'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    title: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.75rem',
      letterSpacing: '-0.025em'
    },
    subtitle: {
      fontSize: '1.125rem',
      color: '#9ca3af',
      marginBottom: '1.5rem',
      fontWeight: '400'
    },
    stepContainer: {
      marginBottom: '2rem',
      textAlign: 'center'
    },
    stepTitle: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      lineHeight: '1.2'
    },
    stepSubtitle: {
      fontSize: '1rem',
      color: '#9ca3af',
      marginBottom: '2rem'
    },
    buttonGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '0.6rem',
      marginBottom: '1.5rem',
      width: '100%',
      margin: '0 auto 1.5rem auto'
    },
    pillButton: {
      padding: '0.7rem 1.2rem',
      border: 'none',
      borderRadius: '50px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '0.85rem',
      fontWeight: '600',
      textAlign: 'center',
      flex: '0 0 auto',
      whiteSpace: 'nowrap'
    },
    selectedPillButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      transform: 'scale(1.05)'
    },
    proficiencyContainer: {
      marginTop: '2rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      maxWidth: '600px',
      margin: '2rem auto 0 auto'
    },
    proficiencyTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.5rem',
      textAlign: 'center'
    },
    languageItem: {
      marginBottom: '1.25rem',
      padding: '1.25rem',
      backgroundColor: 'rgba(55, 65, 81, 0.3)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    },
    languageName: {
      fontSize: '1rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.75rem'
    },
    radioGroup: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
      color: '#e5e7eb',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    radioInput: {
      width: '18px',
      height: '18px',
      accentColor: '#3b82f6'
    },
    topicItem: {
      marginBottom: '1.25rem',
      padding: '1.5rem',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px'
    },
    topicName: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1.25rem',
      textAlign: 'center'
    },
    topicSection: {
      marginBottom: '1.25rem'
    },
    topicSectionTitle: {
      fontSize: '1rem',
      fontWeight: '600',
      color: '#e5e7eb',
      marginBottom: '0.75rem'
    },
    experienceContainer: {
      textAlign: 'center',
      padding: '1rem'
    },
    experienceTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '0.5rem',
      lineHeight: '1.1'
    },
    experienceSubtitle: {
      fontSize: '0.95rem',
      color: '#9ca3af',
      marginBottom: '1rem'
    },
    experienceInputContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    },
    experienceInput: {
      fontSize: '1.25rem',
      padding: '0.75rem 1.25rem',
      background: 'rgba(26, 28, 32, 0.8)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      textAlign: 'center',
      width: '200px',
      color: 'white',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    experienceText: {
      fontSize: '0.9rem',
      color: '#9ca3af',
      fontWeight: '500'
    },
    navigationButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1.5rem',
      marginTop: '1.5rem'
    },
    navButton: {
      padding: '1rem 3rem',
      border: 'none',
      borderRadius: '50px',
      cursor: 'pointer',
      fontSize: '1.125rem',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      minWidth: '150px'
    },
    primaryButton: {
      backgroundColor: '#22c55e',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    buttonDisabled: {
      backgroundColor: 'rgba(107, 114, 128, 0.5)',
      color: '#9ca3af',
      cursor: 'not-allowed'
    },
    error: {
      color: '#ef4444',
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem 2rem',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      borderRadius: '20px',
      fontSize: '1rem',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto 2rem auto'
    },
    success: {
      color: '#22c55e',
      textAlign: 'center',
      marginBottom: '2rem',
      padding: '1rem 2rem',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      borderRadius: '20px',
      fontSize: '1rem',
      fontWeight: '500',
      maxWidth: '600px',
      margin: '0 auto 2rem auto'
    },
    reviewSection: {
      maxWidth: '600px',
      margin: '0 auto'
    },
    reviewContainer: {
      padding: '2rem',
      backgroundColor: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, rgba(26, 28, 32, 0.9), rgba(55, 65, 81, 0.3))'
    },
    reviewItem: {
      marginBottom: '2rem',
      position: 'relative'
    },
    reviewTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '1rem',
      paddingBottom: '0.75rem',
      borderBottom: '2px solid rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    reviewIcon: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white'
    },
    reviewList: {
      color: '#e5e7eb',
      display: 'grid',
      gap: '0.75rem'
    },
    reviewListItem: {
      fontSize: '0.95rem',
      padding: '0.75rem 1rem',
      background: 'rgba(55, 65, 81, 0.3)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    reviewListItemIcon: {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: '#60a5fa',
      flexShrink: 0
    }
  };

  const hoverStyles = `
    .pill-button:hover:not(.selected) {
      background-color: rgba(255, 255, 255, 0.8) !important;
      transform: translateY(-2px) !important;
    }
    
    .pill-button.selected:hover {
      background-color: #2563eb !important;
      transform: scale(1.05) translateY(-2px) !important;
    }
    
    .nav-button:hover:not(:disabled) {
      transform: translateY(-2px) !important;
    }
    
    .primary-button:hover:not(:disabled) {
      background-color: #16a34a !important;
    }
    
    .secondary-button:hover:not(:disabled) {
      background-color: rgba(255, 255, 255, 0.2) !important;
    }
    
    .back-button:hover {
      background: rgba(15, 17, 22, 1) !important;
      border-color: rgba(59, 130, 246, 0.6) !important;
      color: #ffffff !important;
      transform: translateY(-3px) !important;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 1px rgba(59, 130, 246, 0.3) !important;
    }
    
    .experience-input:focus {
      outline: none !important;
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
    }
  `;

  // Loading state with themed loading screen
  if (loading && programmingLanguages.length === 0) {
    return <ThemedOnboardingLoadingScreen />;
  }

  return (
    <div style={styles.pageContainer}>
      <style>{hoverStyles}</style>
      
      {/* Back to Login Button - Outside Container */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 50
      }}>
        <button
          onClick={() => {
            if (window.confirm('This will log you out. Are you sure you want to go back to login?')) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }
          }}
          style={{
            padding: '1rem 1.5rem',
            background: 'rgba(15, 17, 22, 0.95)',
            backdropFilter: 'blur(24px)',
            color: '#e5e7eb',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            letterSpacing: '0.025em'
          }}
          className="back-button"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Back to Login
        </button>
      </div>
      
      {/* Background Layer with Code Symbols */}
      <div style={styles.backgroundLayer}>
        <div style={styles.figmaBackground}>
          <div style={{...styles.codeSymbol, left: '52.81%', top: '48.12%', color: '#2E3344', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '28.19%', top: '71.22%', color: '#292A2E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '95.09%', top: '48.12%', color: '#ABB5CE', transform: 'rotate(34.77deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '86.46%', top: '15.33%', color: '#2E3344', transform: 'rotate(28.16deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '7.11%', top: '80.91%', color: '#ABB5CE', transform: 'rotate(24.5deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '48.06%', top: '8.5%', color: '#ABB5CE', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'}}>&#60;/&#62;</div>
          <div style={{...styles.codeSymbol, left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'}}>&#60;/&#62;</div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Removed Back to Login Button from here */}

        {currentStep === 1 && (
          <div style={styles.header}>
            <h1 style={styles.title}>Welcome to TechSync, {user?.full_name}!</h1>
            <p style={styles.subtitle}>Let's get to know you better to provide the best experience</p>
          </div>
        )}

        {error && <div style={styles.error}>{error}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        {/* Step 1: Programming Languages */}
        {currentStep === 1 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>What Programming Languages are you most skilled at?</h2>
            <p style={styles.stepSubtitle}>Choose three or more</p>
            
            <div style={styles.buttonGrid}>
              {programmingLanguages.map(language => {
                const isSelected = selectedLanguages.find(l => l.language_id === language.id);
                return (
                  <button
                    key={language.id}
                    onClick={() => handleLanguageToggle(language)}
                    className={`pill-button ${isSelected ? 'selected' : ''}`}
                    style={{
                      ...styles.pillButton,
                      ...(isSelected ? styles.selectedPillButton : {})
                    }}
                  >
                    {language.name}
                  </button>
                );
              })}
            </div>

            {/* Proficiency Selection */}
            {selectedLanguages.length > 0 && (
              <div style={styles.proficiencyContainer}>
                <h3 style={styles.proficiencyTitle}>Set your proficiency level</h3>
                {selectedLanguages.map(lang => (
                  <div key={lang.language_id} style={styles.languageItem}>
                    <div style={styles.languageName}>{lang.name}</div>
                    <div style={styles.radioGroup}>
                      {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                        <label key={level} style={styles.radioLabel}>
                          <input
                            type="radio"
                            name={`proficiency-${lang.language_id}`}
                            value={level}
                            checked={lang.proficiency_level === level}
                            onChange={() => handleProficiencyChange(lang.language_id, level)}
                            style={styles.radioInput}
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
            <h2 style={styles.stepTitle}>What topics are you most interested in?</h2>
            <p style={styles.stepSubtitle}>Choose three or more</p>
            
            <div style={styles.buttonGrid}>
              {topics.map(topic => {
                const isSelected = selectedTopics.find(t => t.topic_id === topic.id);
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicToggle(topic)}
                    className={`pill-button ${isSelected ? 'selected' : ''}`}
                    style={{
                      ...styles.pillButton,
                      ...(isSelected ? styles.selectedPillButton : {})
                    }}
                  >
                    {topic.name}
                  </button>
                );
              })}
            </div>

            {/* Topic Interest and Experience Levels */}
            {selectedTopics.length > 0 && (
              <div style={styles.proficiencyContainer}>
                <h3 style={styles.proficiencyTitle}>Customize your selections</h3>
                {selectedTopics.map(topic => (
                  <div key={topic.topic_id} style={styles.languageItem}>
                    <div style={styles.languageName}>{topic.name}</div>
                    
                    <div style={{marginBottom: '1rem'}}>
                      <div style={{...styles.topicSectionTitle, textAlign: 'center', marginBottom: '0.5rem'}}>Interest Level:</div>
                      <div style={styles.radioGroup}>
                        {['low', 'medium', 'high'].map(level => (
                          <label key={level} style={styles.radioLabel}>
                            <input
                              type="radio"
                              name={`interest-${topic.topic_id}`}
                              value={level}
                              checked={topic.interest_level === level}
                              onChange={() => handleInterestChange(topic.topic_id, level)}
                              style={styles.radioInput}
                            />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{...styles.topicSectionTitle, textAlign: 'center', marginBottom: '0.5rem'}}>Experience:</div>
                      <div style={styles.radioGroup}>
                        {['beginner', 'intermediate', 'advanced', 'expert'].map(level => (
                          <label key={level} style={styles.radioLabel}>
                            <input
                              type="radio"
                              name={`experience-${topic.topic_id}`}
                              value={level}
                              checked={topic.experience_level === level}
                              onChange={() => handleTopicExperienceChange(topic.topic_id, level)}
                              style={styles.radioInput}
                            />
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </label>
                        ))}
                      </div>
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
            <h2 style={styles.experienceTitle}>Enter your years of programming experience.</h2>
            <p style={styles.experienceSubtitle}>We need a little more information to find suitable projects for you.</p>
            
            <div style={styles.experienceInputContainer}>
              <input
                type="number"
                min="0"
                max="50"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value) || 0)}
                style={styles.experienceInput}
                className="experience-input"
              />
              <p style={styles.experienceText}>
                {yearsExperience === 0 ? 'Just getting started' : 
                 yearsExperience === 1 ? '1 year of experience' : 
                 `${yearsExperience} years of experience`}
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div style={styles.stepContainer}>
            <h2 style={styles.stepTitle}>Review Your Information</h2>
            
            <div style={styles.reviewSection}>
              <div style={styles.reviewContainer}>
                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>💻</div>
                    Programming Languages ({selectedLanguages.length})
                  </div>
                  <div style={styles.reviewList}>
                    {selectedLanguages.map(lang => (
                      <div key={lang.language_id} style={styles.reviewListItem}>
                        <div style={styles.reviewListItemIcon}></div>
                        <strong>{lang.name}</strong> - {lang.proficiency_level.charAt(0).toUpperCase() + lang.proficiency_level.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>🎯</div>
                    Topics of Interest ({selectedTopics.length})
                  </div>
                  <div style={styles.reviewList}>
                    {selectedTopics.map(topic => (
                      <div key={topic.topic_id} style={styles.reviewListItem}>
                        <div style={styles.reviewListItemIcon}></div>
                        <strong>{topic.name}</strong> - Interest: {topic.interest_level.charAt(0).toUpperCase() + topic.interest_level.slice(1)}, Experience: {topic.experience_level.charAt(0).toUpperCase() + topic.experience_level.slice(1)}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={styles.reviewItem}>
                  <div style={styles.reviewTitle}>
                    <div style={styles.reviewIcon}>⏱️</div>
                    Years of Experience
                  </div>
                  <div style={styles.reviewList}>
                    <div style={styles.reviewListItem}>
                      <div style={styles.reviewListItemIcon}></div>
                      {yearsExperience} {yearsExperience === 1 ? 'year' : 'years'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={styles.navigationButtons}>
          {currentStep > 1 && (
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className="nav-button secondary-button"
              style={{
                ...styles.navButton,
                ...styles.secondaryButton
              }}
            >
              Previous
            </button>
          )}

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
              className="nav-button primary-button"
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
              className="nav-button primary-button"
              style={{
                ...styles.navButton,
                ...styles.primaryButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? 'Completing...' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Onboarding;