// frontend/src/pages/ChallengeManagement.js - FIXED
import React, { useState, useEffect, useCallback } from 'react';
import ChallengeForm from '../components/ChallengeForm';
import ChallengeAPI from '../services/challengeAPI';

const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    difficulty_level: '',
    programming_language_id: '',
    search: ''
  });
  const [languages, setLanguages] = useState([]);

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // FIXED: Use the correct method based on user role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const isAdmin = user.role === 'admin' || user.role === 'moderator';
      
      let response;
      if (isAdmin) {
        // Use admin endpoint for admins/moderators
        response = await ChallengeAPI.getAdminChallenges(filters);
      } else {
        // Use regular endpoint for regular users
        response = await ChallengeAPI.getChallenges(filters);
      }
      
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setError('Failed to load challenges: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadLanguages = useCallback(async () => {
    try {
      const response = await ChallengeAPI.getProgrammingLanguages();
      setLanguages(response.data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
      setError('Failed to load programming languages: ' + (error.response?.data?.message || error.message));
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const handleCreateSuccess = (challenge) => {
    setChallenges([challenge, ...challenges]);
    setShowCreateForm(false);
    setError('');
  };

  const handleEditSuccess = (updatedChallenge) => {
    setChallenges(challenges.map(c => 
      c.id === updatedChallenge.id ? updatedChallenge : c
    ));
    setEditingChallenge(null);
    setError('');
  };

  const handleDelete = async (challengeId) => {
    if (window.confirm('Are you sure you want to delete this challenge?')) {
      try {
        await ChallengeAPI.deleteChallenge(challengeId);
        setChallenges(challenges.filter(c => c.id !== challengeId));
        setError('');
      } catch (error) {
        console.error('Error deleting challenge:', error);
        setError('Failed to delete challenge: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107',
      hard: '#fd7e14',
      expert: '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      paddingBottom: '20px',
      borderBottom: '1px solid #ddd'
    },
    title: {
      color: '#333',
      margin: 0,
      fontSize: '28px'
    },
    createButton: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    filters: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '5px',
      fontWeight: '600',
      color: '#555'
    },
    select: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    input: {
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px 16px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '18px',
      color: '#666'
    },
    empty: {
      textAlign: 'center',
      padding: '60px',
      color: '#666',
      fontSize: '16px'
    },
    challengeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    challengeCard: {
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    },
    challengeTitle: {
      margin: '0 0 10px 0',
      fontSize: '18px',
      fontWeight: '600',
      color: '#333'
    },
    challengeDescription: {
      color: '#666',
      fontSize: '14px',
      lineHeight: '1.5',
      margin: '0 0 15px 0',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    challengeMeta: {
      display: 'flex',
      gap: '10px',
      marginBottom: '15px',
      flexWrap: 'wrap'
    },
    difficultyBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      color: 'white',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    languageBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      backgroundColor: '#e9ecef',
      color: '#495057',
      fontWeight: '500'
    },
    challengeActions: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'flex-end'
    },
    editButton: {
      padding: '6px 12px',
      backgroundColor: '#ffc107',
      color: '#212529',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    deleteButton: {
      padding: '6px 12px',
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    viewButton: {
      padding: '6px 12px',
      backgroundColor: '#17a2b8',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }
  };

  if (showCreateForm) {
    return (
      <ChallengeForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
        languages={languages}
      />
    );
  }

  if (editingChallenge) {
    return (
      <ChallengeForm
        challenge={editingChallenge}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingChallenge(null)}
        languages={languages}
      />
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Challenge Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={styles.createButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#007bff';
          }}
        >
          Create New Challenge
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button 
            onClick={() => setError('')}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              color: '#721c24'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>Difficulty</label>
          <select
            name="difficulty_level"
            value={filters.difficulty_level}
            onChange={handleFilterChange}
            style={styles.select}
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Programming Language</label>
          <select
            name="programming_language_id"
            value={filters.programming_language_id}
            onChange={handleFilterChange}
            style={styles.select}
          >
            <option value="">All Languages</option>
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by title or description..."
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>&nbsp;</label>
          <button
            onClick={() => setFilters({ difficulty_level: '', programming_language_id: '', search: '' })}
            style={{
              padding: '8px 12px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div style={styles.loading}>
          <div>Loading challenges...</div>
          <div style={{ marginTop: '10px', fontSize: '14px' }}>
            This may take a moment while we fetch your challenges.
          </div>
        </div>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>
          {filters.difficulty_level || filters.programming_language_id || filters.search ? 
            'No challenges match your current filters. Try adjusting your search criteria.' :
            'No challenges found. Create your first challenge!'
          }
        </div>
      ) : (
        <div style={styles.challengeGrid}>
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              style={styles.challengeCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <h3 style={styles.challengeTitle}>{challenge.title}</h3>
              <p style={styles.challengeDescription}>
                {challenge.description}
              </p>
              
              <div style={styles.challengeMeta}>
                <span 
                  style={{
                    ...styles.difficultyBadge,
                    backgroundColor: getDifficultyColor(challenge.difficulty_level)
                  }}
                >
                  {challenge.difficulty_level}
                </span>
                <span style={styles.languageBadge}>
                  {challenge.programming_languages?.name || 'Unknown'}
                </span>
                {challenge.time_limit_minutes && (
                  <span style={styles.languageBadge}>
                    {challenge.time_limit_minutes}min
                  </span>
                )}
              </div>

              <div style={styles.challengeActions}>
                <button
                  onClick={() => setEditingChallenge(challenge)}
                  style={styles.editButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#e0a800';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ffc107';
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(challenge.id)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#c82333';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#dc3545';
                  }}
                >
                  Delete
                </button>
                <button
                  onClick={() => console.log('View challenge:', challenge)}
                  style={styles.viewButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#138496';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#17a2b8';
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;