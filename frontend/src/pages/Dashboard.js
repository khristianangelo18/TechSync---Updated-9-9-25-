// frontend/src/pages/Dashboard.js - MINIMAL AI CHAT INTEGRATION
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import SkillMatchingAPI from '../services/skillMatchingAPI';
import CreateProject from './CreateProject';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';
import AIChatInterface from '../components/AIChat/AIChatInterface'; // NEW: Only addition

// Enhanced Project Card Component (FULLY PRESERVED with all original features)
const EnhancedProjectCard = ({
  project,
  styles,
  getDifficultyStyle,
  handleProjectClick,
  handleJoinProject
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // DEBUG: Log project data to see what we're getting
  React.useEffect(() => {
    if (project) {
      console.log('🎯 Project Card - Project data:', project.title);
      console.log('🎯 Project Card - Match factors:', project.matchFactors);
      console.log('🎯 Project Card - Highlights:', project.matchFactors?.highlights);
      console.log('🎯 Project Card - Suggestions:', project.matchFactors?.suggestions);
    }
  }, [project]);

  return (
    <div
      style={{
        ...styles.projectCard,
        ...(isHovered ? styles.projectCardHover : {})
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleProjectClick(project)}
    >
      {/* Enhanced match score with tooltip - RESTORED */}
      <div 
        style={{
          ...styles.matchScore,
          cursor: 'help'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to see why this matches you"
      >
        {Math.round(project.score || 0)}% match
        
        {/* Tooltip for match explanation - RESTORED */}
        {showTooltip && (project.matchFactors?.highlights?.length > 0 || project.matchFactors?.suggestions?.length > 0) && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            backgroundColor: '#333',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            maxWidth: '200px',
            whiteSpace: 'normal'
          }}>
            {/* Show highlights if available */}
            {project.matchFactors?.highlights?.length > 0 ? 
              project.matchFactors.highlights.slice(0, 2).join(', ') :
              'Match details loading...'
            }
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '8px',
              width: '0',
              height: '0',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '4px solid #333'
            }} />
          </div>
        )}
      </div>
      
      {/* Highlight chips - RESTORED */}
      {project.matchFactors?.highlights && project.matchFactors.highlights.length > 0 && (
        <div style={{
          marginBottom: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px'
        }}>
          {project.matchFactors.highlights.slice(0, 2).map((highlight, idx) => (
            <span key={idx} style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500',
              border: '1px solid #bbdefb'
            }}>
              ✨ {highlight}
            </span>
          ))}
        </div>
      )}
      
      {/* Project title and description (preserved) */}
      <h4 style={styles.projectTitle}>{project.title}</h4>
      <p style={styles.projectDescription}>
        {project.description}
      </p>
      
      {/* Improvement suggestions - RESTORED */}
      {project.matchFactors?.suggestions && project.matchFactors.suggestions.length > 0 && (
        <div style={{
          marginBottom: '12px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffeaa7'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 'bold',
            color: '#856404',
            marginBottom: '4px'
          }}>
            💡 To boost your match:
          </div>
          {project.matchFactors.suggestions.slice(0, 1).map((suggestion, idx) => (
            <div key={idx} style={{
              fontSize: '11px',
              color: '#856404',
              lineHeight: '1.3'
            }}>
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      {/* Project metadata (preserved) */}
      <div style={styles.projectMeta}>
        <span style={getDifficultyStyle(project.difficulty_level)}>
          {project.difficulty_level?.toUpperCase() || 'MEDIUM'}
        </span>
        <span style={styles.memberCount}>
          {project.current_members || 0}/{project.maximum_members || 10} members
        </span>
      </div>
      
      {/* Technologies (preserved) */}
      {project.technologies && project.technologies.length > 0 && (
        <div style={styles.tagsContainer}>
          {project.technologies.slice(0, 3).map((tech, techIndex) => (
            <span key={techIndex} style={styles.tag}>
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span style={styles.tag}>
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
      )}
      
      {/* Join button (preserved) */}
      <button
        style={styles.joinButton}
        onClick={(e) => handleJoinProject(project, e)}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#0056b3';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#007bff';
        }}
      >
        Join Project
      </button>
    </div>
  );
};

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  
  // Tab state for toggle functionality
  const [activeTab, setActiveTab] = useState('recommended'); // 'recommended' or 'forYou'
  
  // Filter and Sort States (preserved from original)
  const [sortBy, setSortBy] = useState('match');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Real notifications from context (preserved)
  const { 
    unreadCount, 
    notifications, 
    fetchNotifications 
  } = useNotifications();

  // Fetch recommended projects when component mounts (with debugging)
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingRecommendations(true);
        const response = await SkillMatchingAPI.getEnhancedRecommendations(user.id);
        const recommendations = response.data.recommendations;
        
        // DEBUG: Log the first project to see if matchFactors exist
        if (recommendations?.length > 0) {
          console.log('🔍 First project data:', recommendations[0]);
          console.log('🔍 Match factors:', recommendations[0].matchFactors);
          console.log('🔍 Highlights:', recommendations[0].matchFactors?.highlights);
          console.log('🔍 Suggestions:', recommendations[0].matchFactors?.suggestions);
        }
        
        setRecommendedProjects(recommendations.slice(0, 12));
        setFilteredProjects(recommendations.slice(0, 12));
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendedProjects([]);
        setFilteredProjects([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [user?.id]);

  // Filter and Sort Effect (preserved)
  useEffect(() => {
    let filtered = [...recommendedProjects];

    // Apply language filter
    if (filterLanguage !== 'all') {
      filtered = filtered.filter(project => 
        project.technologies?.some(tech => 
          tech.toLowerCase().includes(filterLanguage.toLowerCase())
        )
      );
    }

    // Apply difficulty filter
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(project => 
        project.difficulty_level?.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'match':
          aValue = a.score || 0;
          bValue = b.score || 0;
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          aValue = difficultyOrder[a.difficulty_level?.toLowerCase()] || 2;
          bValue = difficultyOrder[b.difficulty_level?.toLowerCase()] || 2;
          break;
        case 'members':
          aValue = a.current_members || 0;
          bValue = b.current_members || 0;
          break;
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProjects(filtered);
  }, [recommendedProjects, sortBy, sortOrder, filterLanguage, filterDifficulty]);

  // Get unique languages from projects (preserved)
  const getAvailableLanguages = () => {
    const languages = new Set();
    recommendedProjects.forEach(project => {
      project.technologies?.forEach(tech => languages.add(tech));
    });
    return Array.from(languages).sort();
  };

  // Handle sort change (preserved)
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'title' ? 'asc' : 'desc');
    }
  };

  // Reset filters (preserved)
  const resetFilters = () => {
    setSortBy('match');
    setSortOrder('desc');
    setFilterLanguage('all');
    setFilterDifficulty('all');
  };

  const getDifficultyStyle = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107', 
      hard: '#dc3545'
    };
    
    return {
      backgroundColor: colors[difficulty?.toLowerCase()] || colors.medium,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold'
    };
  };

  // Close dropdowns when clicking outside (preserved)
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

  // Event handlers (preserved)
  const handleCreateClick = () => {
    setShowCreateProject(true);
  };

  const handleCloseCreate = () => {
    setShowCreateProject(false);
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔔 Dashboard: Notification bell clicked!');
    console.log('🔔 Dashboard: Current showNotifications:', showNotifications);
    console.log('🔔 Dashboard: Unread count:', unreadCount);
    console.log('🔔 Dashboard: Notifications length:', notifications.length);
    
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    console.log('🔔 Dashboard: Setting showNotifications to:', newState);
    
    // Fetch notifications when opening dropdown if empty
    if (newState && notifications.length === 0) {
      console.log('🔔 Dashboard: Fetching notifications...');
      fetchNotifications();
    }
  };

  const handleProjectClick = async (project) => {
    try {
      // Update recommendation feedback
      await SkillMatchingAPI.updateRecommendationFeedback(
        project.recommendationId,
        'viewed',
        null,
        project.projectId
      );
      
      // Navigate to project details or join page
      navigate(`/projects/${project.projectId}`);
    } catch (error) {
      console.error('Error updating recommendation feedback:', error);
      // Still navigate even if feedback update fails
      navigate(`/projects/${project.projectId}`);
    }
  };

  const handleJoinProject = async (project, event) => {
    event.stopPropagation(); // Prevent triggering the card click

    try {
      console.log('🚀 Navigating to project challenge:', project);
      
      // Update recommendation feedback for analytics
      try {
        await SkillMatchingAPI.updateRecommendationFeedback(
          project.recommendationId,
          'applied',
          null,
          project.projectId
        );
        console.log('✅ Updated recommendation feedback');
      } catch (feedbackError) {
        console.warn('⚠️ Failed to update recommendation feedback:', feedbackError);
        // Continue with navigation even if feedback fails
      }
      
      // Navigate directly to the challenge/join page
      console.log('🎯 Navigating to:', `/projects/${project.projectId}/join`);
      navigate(`/projects/${project.projectId}/join`);
      
    } catch (error) {
      console.error('Error joining project:', error);
      // Show user feedback about the error if needed
    }
  };

  // ALL ORIGINAL STYLES PRESERVED
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid #e9ecef'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px'
    },
    createButton: {
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease',
      ':hover': {
        backgroundColor: '#0056b3'
      }
    },
    notificationContainer: {
      position: 'relative'
    },
    notificationButton: {
      backgroundColor: 'transparent',
      border: '2px solid #dee2e6',
      borderRadius: '6px',
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '16px',
      position: 'relative',
      transition: 'all 0.2s ease'
    },
    notificationBadge: {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      width: '18px',
      height: '18px',
      backgroundColor: '#dc3545',
      color: 'white',
      borderRadius: '50%',
      fontSize: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '0',
      maxWidth: '90%',
      maxHeight: '90%',
      overflow: 'auto'
    },
    welcomeCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px'
    },
    
    // Tab Navigation Styles
    tabNavigation: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    tabHeader: {
      display: 'flex',
      borderBottom: '1px solid #dee2e6'
    },
    tabButton: {
      flex: 1,
      padding: '15px 20px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      color: '#666',
      transition: 'all 0.2s ease',
      borderBottom: '3px solid transparent',
      position: 'relative'
    },
    activeTabButton: {
      color: '#007bff',
      backgroundColor: '#f8f9fa',
      borderBottom: '3px solid #007bff'
    },
    tabContent: {
      padding: '20px'
    },
    
    // Preserved Profile Section Styles
    profileSection: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    },
    sectionTitle: {
      color: '#333',
      marginBottom: '15px',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    recommendationsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    projectCard: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative'
    },
    projectCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid #007bff'
    },
    matchScore: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    projectTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
      paddingRight: '60px' // Make room for match score
    },
    projectDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.4',
      marginBottom: '12px',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    projectMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
      fontSize: '12px'
    },
    memberCount: {
      color: '#666',
      fontSize: '12px'
    },
    tagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginBottom: '15px'
    },
    tag: {
      backgroundColor: '#e9ecef',
      color: '#495057',
      padding: '3px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500'
    },
    joinButton: {
      width: '100%',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s ease'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: '#666'
    },
    emptyState: {
      textAlign: 'center',
      color: '#666',
      fontSize: '14px',
      padding: '40px 20px'
    },
    
    // Filter and Sort Styles (preserved)
    filterSection: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px'
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    filterToggle: {
      backgroundColor: 'transparent',
      border: '1px solid #007bff',
      color: '#007bff',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
      transition: 'all 0.2s ease'
    },
    filterControls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#333'
    },
    filterSelect: {
      padding: '6px 8px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '13px',
      backgroundColor: 'white'
    },
    sortButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    sortButton: {
      padding: '4px 8px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: 'white'
    },
    sortButtonActive: {
      backgroundColor: '#007bff',
      color: 'white',
      borderColor: '#007bff'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#666',
      textAlign: 'center',
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '1px solid #e9ecef'
    },
    resetButton: {
      padding: '6px 12px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500'
    },

    // For You Tab Styles (preserved)
    forYouGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    forYouSection: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px'
    },
    forYouSectionTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    forYouSectionDesc: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '15px',
      lineHeight: '1.4'
    },

    // Trending Projects Styles (preserved)
    trendingList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    trendingItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    trendingRank: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
      backgroundColor: '#007bff',
      color: 'white',
      borderRadius: '50%',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    trendingInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    trendingMeta: {
      fontSize: '12px',
      color: '#666'
    },
    trendingMembers: {
      fontSize: '12px',
      color: '#28a745',
      fontWeight: '500'
    },

    // Learning Resources Styles (preserved)
    learningList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    learningItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e9ecef',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    learningIcon: {
      fontSize: '24px',
      minWidth: '24px'
    },
    learningContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    learningDesc: {
      fontSize: '12px',
      color: '#666',
      lineHeight: '1.3'
    },

    // Career Insights Styles (preserved)
    insightsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    insightItem: {
      padding: '15px',
      backgroundColor: 'white',
      borderRadius: '6px',
      border: '1px solid #e9ecef'
    },
    insightHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    insightTitle: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#333'
    },
    insightTrend: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#28a745'
    },
    insightDesc: {
      fontSize: '13px',
      color: '#666',
      lineHeight: '1.4',
      margin: 0
    },

    // Quick Actions Styles (preserved)
    quickActionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    },
    quickActionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: 'white',
      border: '1px solid #e9ecef',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    },
    quickActionIcon: {
      fontSize: '20px',
      minWidth: '20px'
    },
    quickActionContent: {
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },

    // NEW: AI Chat Section Styles (only addition)
    aiChatSection: {
      gridColumn: '1 / -1', // Span full width
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section (COMPLETELY PRESERVED) */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Dashboard</h1>
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.createButton}
            onClick={handleCreateClick}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#0056b3';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#007bff';
            }}
          >
            + Create Project
          </button>
          
          <div style={styles.notificationContainer}>
            <button 
              style={{
                ...styles.notificationButton,
                color: unreadCount > 0 ? '#3498db' : '#6c757d'
              }} 
              onClick={handleNotificationClick}
            >
              🔔
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div 
                className="notification-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '5px',
                  zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <NotificationDropdown onClose={() => setShowNotifications(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Create Project Modal (COMPLETELY PRESERVED) */}
      {showCreateProject && (
        <div style={styles.modal} onClick={handleCloseCreate}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <CreateProject onClose={handleCloseCreate} />
          </div>
        </div>
      )}

      {/* Welcome Section (COMPLETELY PRESERVED) */}
      <div style={styles.welcomeCard}>
        <h2>🎉 Welcome Back!</h2>
        <p>
          Great to see you back! Ready to start or continue working on your projects? 
          Check out our personalized recommendations below.
        </p>
      </div>

      {/* Tab Navigation (COMPLETELY PRESERVED) */}
      <div style={styles.tabNavigation}>
        <div style={styles.tabHeader}>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'recommended' ? styles.activeTabButton : {})
            }}
            onClick={() => setActiveTab('recommended')}
            onMouseEnter={(e) => {
              if (activeTab !== 'recommended') {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'recommended') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            🚀 Recommended Projects
          </button>
          <button
            style={{
              ...styles.tabButton,
              ...(activeTab === 'forYou' ? styles.activeTabButton : {})
            }}
            onClick={() => setActiveTab('forYou')}
            onMouseEnter={(e) => {
              if (activeTab !== 'forYou') {
                e.target.style.backgroundColor = '#f8f9fa';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'forYou') {
                e.target.style.backgroundColor = 'transparent';
              }
            }}
          >
            ✨ Solo Project
          </button>
        </div>

        <div style={styles.tabContent}>
          {/* RECOMMENDED PROJECTS TAB (COMPLETELY PRESERVED) */}
          {activeTab === 'recommended' && (
            <div>
              <h3 style={styles.sectionTitle}>🚀 Recommended Projects</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                Based on your skills in {user?.programming_languages?.slice(0, 2).map(l => l.programming_languages?.name || l.name).join(', ')} and your interest in {user?.topics?.slice(0, 2).map(t => t.topics?.name || t.name).join(', ')}, here are some projects you might like.
              </p>

              {/* Filter and Sort Section (COMPLETELY PRESERVED) */}
              {!loadingRecommendations && recommendedProjects.length > 0 && (
                <div style={styles.filterSection}>
                  <div style={styles.filterHeader}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                      Filter & Sort Projects
                    </h4>
                    <button
                      style={styles.filterToggle}
                      onClick={() => setShowFilters(!showFilters)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#007bff';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#007bff';
                      }}
                    >
                      {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                  </div>

                  {showFilters && (
                    <>
                      <div style={styles.filterControls}>
                        {/* Language Filter */}
                        <div style={styles.filterGroup}>
                          <label style={styles.filterLabel}>Filter by Language</label>
                          <select
                            style={styles.filterSelect}
                            value={filterLanguage}
                            onChange={(e) => setFilterLanguage(e.target.value)}
                          >
                            <option value="all">All Languages</option>
                            {getAvailableLanguages().map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div style={styles.filterGroup}>
                          <label style={styles.filterLabel}>Filter by Difficulty</label>
                          <select
                            style={styles.filterSelect}
                            value={filterDifficulty}
                            onChange={(e) => setFilterDifficulty(e.target.value)}
                          >
                            <option value="all">All Difficulties</option>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>

                        {/* Sort Options */}
                        <div style={styles.filterGroup}>
                          <label style={styles.filterLabel}>Sort by</label>
                          <div style={styles.sortButtons}>
                            <button
                              style={{
                                ...styles.sortButton,
                                ...(sortBy === 'match' ? styles.sortButtonActive : {})
                              }}
                              onClick={() => handleSortChange('match')}
                            >
                              Match Rate {sortBy === 'match' && (sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                            <button
                              style={{
                                ...styles.sortButton,
                                ...(sortBy === 'difficulty' ? styles.sortButtonActive : {})
                              }}
                              onClick={() => handleSortChange('difficulty')}
                            >
                              Difficulty {sortBy === 'difficulty' && (sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                            <button
                              style={{
                                ...styles.sortButton,
                                ...(sortBy === 'members' ? styles.sortButtonActive : {})
                              }}
                              onClick={() => handleSortChange('members')}
                            >
                              Team Size {sortBy === 'members' && (sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                            <button
                              style={{
                                ...styles.sortButton,
                                ...(sortBy === 'title' ? styles.sortButtonActive : {})
                              }}
                              onClick={() => handleSortChange('title')}
                            >
                              Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div style={{ textAlign: 'right' }}>
                        <button
                          style={styles.resetButton}
                          onClick={resetFilters}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#5a6268';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#6c757d';
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </>
                  )}

                  {/* Results Count */}
                  <div style={styles.resultsCount}>
                    Showing {filteredProjects.length} of {recommendedProjects.length} projects
                    {(filterLanguage !== 'all' || filterDifficulty !== 'all') && (
                      <span style={{ color: '#007bff', fontWeight: '500' }}> (filtered)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Project Grid (COMPLETELY PRESERVED) */}
              {loadingRecommendations ? (
                <div style={styles.loadingSpinner}>
                  Loading personalized recommendations...
                </div>
              ) : filteredProjects.length > 0 ? (
                <div style={styles.recommendationsGrid}>
                  {filteredProjects.map((project, index) => (
                    <EnhancedProjectCard
                      key={project.projectId || project.id || index}
                      project={project}
                      styles={styles}
                      getDifficultyStyle={getDifficultyStyle}
                      handleProjectClick={handleProjectClick}
                      handleJoinProject={handleJoinProject}
                    />
                  ))}
                </div>
              ) : recommendedProjects.length > 0 ? (
                <div style={styles.emptyState}>
                  No projects match your current filters.
                  <br />
                  <button
                    style={{
                      ...styles.resetButton,
                      marginTop: '10px'
                    }}
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div style={styles.emptyState}>
                  No project recommendations available yet.
                  Complete more of your profile to get personalized recommendations!
                </div>
              )}
            </div>
          )}

          {/* FOR YOU TAB - SOLO PROJECT WITH AI CHAT ONLY */}
          {activeTab === 'forYou' && (
            <div>
              <h3 style={styles.sectionTitle}>✨ Solo Project</h3>
              <p style={{ color: '#666', marginBottom: '15px' }}>
                Sync is your personal AI-powered workspace for generating and planning coding projects.
              </p>

              {/* AI Chat Interface - Direct without extra containers */}
              <AIChatInterface />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;