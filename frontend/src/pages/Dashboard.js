// frontend/src/pages/Dashboard.js - SIMPLIFIED VERSION - Only Welcome & Recommendations
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import CreateProject from './CreateProject';
import SkillMatchingAPI from '../services/skillMatchingAPI';
import NotificationDropdown from '../components/Notifications/NotificationDropdown';

const EnhancedProjectCard = ({ project, styles, getDifficultyStyle, handleProjectClick, handleJoinProject }) => {
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  return (
    <div
      style={styles.projectCard}
      onClick={() => handleProjectClick(project)}
      onMouseEnter={(e) => {
        Object.assign(e.target.style, styles.projectCardHover);
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'none';
        e.target.style.boxShadow = 'none';
        e.target.style.border = '1px solid #dee2e6';
      }}
    >
      {/* Enhanced match score with tooltip */}
      <div 
        style={{
          ...styles.matchScore,
          cursor: 'help'
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        title="Click to see why this matches you"
      >
        {Math.round(project.score)}% match
        
        {/* Tooltip for match explanation */}
        {showTooltip && project.matchFactors?.highlights && (
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
            {project.matchFactors.highlights.slice(0, 2).join(', ')}
            <div style={{
              position: 'absolute',
              top: '-4px',
              right: '8px',
              width: '0',
              height: '0',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderBottom: '4px solid #333'
            }}></div>
          </div>
        )}
      </div>
      
      {/* Existing title */}
      <div style={styles.projectTitle}>
        {project.title}
      </div>
      
      {/* NEW: Highlight chips */}
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
      
      {/* Existing description */}
      <div style={styles.projectDescription}>
        {project.description}
      </div>
      
      {/* NEW: Improvement suggestions */}
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
      
      {/* Existing project meta */}
      <div style={styles.projectMeta}>
        <span style={getDifficultyStyle(project.difficulty_level)}>
          {project.difficulty_level?.toUpperCase() || 'MEDIUM'}
        </span>
        <span style={styles.memberCount}>
          {project.current_members || 0}/{project.maximum_members || 10} members
        </span>
      </div>
      
      {/* Existing technologies */}
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
      
      {/* Existing join button */}
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
  
  // NEW: Filter and Sort States
  const [sortBy, setSortBy] = useState('match'); // 'match', 'difficulty', 'members', 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [filterLanguage, setFilterLanguage] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Real notifications from context
  const { 
    unreadCount, 
    notifications, 
    fetchNotifications 
  } = useNotifications();

  // Fetch recommended projects when component mounts
  useEffect(() => {
  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingRecommendations(true);
      const response = await SkillMatchingAPI.getEnhancedRecommendations(user.id);
      const recommendations = response.data.recommendations;
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

  // NEW: Filter and Sort Effect
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

  // NEW: Get unique languages from projects
  const getAvailableLanguages = () => {
    const languages = new Set();
    recommendedProjects.forEach(project => {
      project.technologies?.forEach(tech => languages.add(tech));
    });
    return Array.from(languages).sort();
  };

  // NEW: Handle sort change
  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder(newSortBy === 'title' ? 'asc' : 'desc');
    }
  };

  // NEW: Reset filters
  const resetFilters = () => {
    setSortBy('match');
    setSortOrder('desc');
    setFilterLanguage('all');
    setFilterDifficulty('all');
  };

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
        'viewed'
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
          'applied'
        );
        console.log('✅ Updated recommendation feedback');
      } catch (feedbackError) {
        console.warn('⚠️ Failed to update recommendation feedback:', feedbackError);
        // Continue with navigation even if feedback fails
      }
      
      // Navigate directly to the challenge/join page
      // This will show the coding challenge interface
      console.log('🎯 Navigating to:', `/projects/${project.projectId}/join`);
      navigate(`/projects/${project.projectId}/join`);
      
    } catch (error) {
      console.error('Error joining project:', error);
      // Show user feedback about the error if needed
    }
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications]);

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
    // NEW: Filter and Sort Styles
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
      gap: '6px'
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '500',
      color: '#333',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    filterSelect: {
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    sortButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    sortButton: {
      padding: '6px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    sortButtonActive: {
      backgroundColor: '#007bff',
      color: 'white',
      borderColor: '#007bff'
    },
    resetButton: {
      padding: '6px 12px',
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '16px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>Home</h1>
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
          
          {/* Notification Bell */}
          <div style={styles.notificationContainer}>
            <button 
              style={{
                ...styles.notificationButton,
                color: unreadCount > 0 ? '#3498db' : '#6c757d' // Change color when has notifications
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
            
            {/* UPDATED: Use real NotificationDropdown component */}
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

      {/* Create Project Modal */}
      {showCreateProject && (
        <div style={styles.modal} onClick={handleCloseCreate}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <CreateProject onClose={handleCloseCreate} />
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div style={styles.welcomeCard}>
        <h2>🎉 Welcome Back!</h2>
        <p>
          Great to see you back! Ready to start or continue working on your projects? 
          Check out our personalized recommendations below.
        </p>
      </div>

      {/* Recommended Projects Section */}
      <div style={styles.profileSection}>
        <h3 style={styles.sectionTitle}>🚀 Recommended Projects</h3>
        <p style={{ color: '#666', marginBottom: '15px' }}>
          Based on your skills in {user?.programming_languages?.slice(0, 2).map(l => l.programming_languages?.name || l.name).join(', ')} and your interest in {user?.topics?.slice(0, 2).map(t => t.topics?.name || t.name).join(', ')}, here are some projects you might like.
        </p>

        {/* NEW: Filter and Sort Section */}
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
        
        {loadingRecommendations ? (
          <div style={styles.loadingSpinner}>
            <div>Loading recommendations...</div>
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
    </div>
  );
}

export default Dashboard;