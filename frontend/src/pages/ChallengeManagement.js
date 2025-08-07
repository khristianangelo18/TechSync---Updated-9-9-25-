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

  // FIXED: Properly sanitize filters before sending to API
  const sanitizeFilters = (filters) => {
    const sanitized = {};
    
    // Only include non-empty values
    if (filters.difficulty_level && filters.difficulty_level !== '') {
      sanitized.difficulty_level = filters.difficulty_level;
    }
    
    if (filters.programming_language_id && filters.programming_language_id !== '') {
      // Ensure it's a valid integer
      const langId = parseInt(filters.programming_language_id);
      if (!isNaN(langId) && langId > 0) {
        sanitized.programming_language_id = langId;
      }
    }
    
    if (filters.search && filters.search.trim() !== '') {
      sanitized.search = filters.search.trim();
    }

    return sanitized;
  };

  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user role safely
      const userData = localStorage.getItem('user');
      let user = { role: 'user' }; // Default to regular user
      
      try {
        if (userData) {
          user = JSON.parse(userData);
        }
      } catch (parseError) {
        console.warn('Failed to parse user data, using default role');
      }

      const isAdmin = user.role === 'admin' || user.role === 'moderator';
      
      // Sanitize filters to prevent validation errors
      const cleanFilters = sanitizeFilters(filters);
      
      let response;
      try {
        if (isAdmin) {
          // Try admin endpoint first
          response = await ChallengeAPI.getAdminChallenges(cleanFilters);
        } else {
          // Use regular endpoint for regular users
          response = await ChallengeAPI.getChallenges(cleanFilters);
        }
      } catch (adminError) {
        // If admin endpoint fails, fall back to regular endpoint
        if (isAdmin && adminError.response?.status === 403) {
          console.log('Admin endpoint failed, trying regular endpoint');
          response = await ChallengeAPI.getChallenges(cleanFilters);
        } else {
          throw adminError;
        }
      }
      
      // Handle different response structures
      const challengeList = response?.data?.challenges || response?.data || response || [];
      setChallenges(Array.isArray(challengeList) ? challengeList : []);
      
    } catch (error) {
      console.error('Error loading challenges:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to load challenges';
      
      if (error.response?.data?.message) {
        errorMessage += ': ' + error.response.data.message;
      } else if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        if (Array.isArray(validationErrors)) {
          errorMessage += ': ' + validationErrors.map(e => e.msg || e.message).join(', ');
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      setError(errorMessage);
      setChallenges([]); // Clear challenges on error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadLanguages = useCallback(async () => {
    try {
      // Try different endpoints for languages
      let response;
      try {
        response = await ChallengeAPI.getProgrammingLanguages();
      } catch (error) {
        // If the main endpoint fails, try the suggestions endpoint
        console.log('Trying alternative endpoint for languages');
        response = await fetch('/api/suggestions/programming-languages').then(r => r.json());
      }
      
      const languageList = response?.data || response?.languages || response || [];
      setLanguages(Array.isArray(languageList) ? languageList : []);
    } catch (error) {
      console.error('Error loading languages:', error);
      // Don't show error for languages - it's not critical for viewing challenges
      setLanguages([]);
    }
  }, []);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  useEffect(() => {
    loadLanguages();
  }, [loadLanguages]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      difficulty_level: '',
      programming_language_id: '',
      search: ''
    });
  };

  const handleCreateSuccess = (challenge) => {
    setChallenges([challenge, ...challenges]);
    setShowCreateForm(false);
    setError('');
    // Reload to get fresh data
    loadChallenges();
  };

  const handleEditSuccess = (updatedChallenge) => {
    setChallenges(challenges.map(c => 
      c.id === updatedChallenge.id ? updatedChallenge : c
    ));
    setEditingChallenge(null);
    setError('');
    // Reload to get fresh data
    loadChallenges();
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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#28a745',
      medium: '#ffc107',
      hard: '#fd7e14',
      expert: '#dc3545'
    };
    return colors[difficulty] || '#6c757d';
  };

  // Show create form
  if (showCreateForm) {
    return (
      <div>
        <div style={styles.header}>
          <h1>Create New Challenge</h1>
          <button
            onClick={() => setShowCreateForm(false)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
        <ChallengeForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
          languages={languages}
        />
      </div>
    );
  }

  // Show edit form
  if (editingChallenge) {
    return (
      <div>
        <div style={styles.header}>
          <h1>Edit Challenge</h1>
          <button
            onClick={() => setEditingChallenge(null)}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
        <ChallengeForm
          initialData={editingChallenge}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingChallenge(null)}
          languages={languages}
        />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Challenge Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          style={styles.createButton}
        >
          Create New Challenge
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
          <button 
            onClick={() => setError('')}
            style={styles.dismissButton}
          >
            ×
          </button>
        </div>
      )}

      <div style={styles.filters}>
        <select
          value={filters.difficulty_level}
          onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>

        <select
          value={filters.programming_language_id}
          onChange={(e) => handleFilterChange('programming_language_id', e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Languages</option>
          {languages.map(lang => (
            <option key={lang.id} value={lang.id}>
              {lang.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by title or description..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={styles.searchInput}
        />

        <button onClick={clearFilters} style={styles.clearButton}>
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div style={styles.loading}>Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>
          No challenges found. Create your first challenge!
        </div>
      ) : (
        <div style={styles.challengeGrid}>
          {challenges.map(challenge => (
            <div key={challenge.id} style={styles.challengeCard}>
              <h3 style={styles.challengeTitle}>{challenge.title}</h3>
              <p style={styles.challengeDescription}>{challenge.description}</p>
              
              <div style={styles.challengeMeta}>
                <span 
                  style={{
                    ...styles.difficultyBadge,
                    backgroundColor: getDifficultyColor(challenge.difficulty_level)
                  }}
                >
                  {challenge.difficulty_level}
                </span>
                
                {challenge.programming_language && (
                  <span style={styles.languageBadge}>
                    {challenge.programming_language.name || challenge.programming_language}
                  </span>
                )}
                
                {challenge.time_limit_minutes && (
                  <span style={styles.languageBadge}>
                    {challenge.time_limit_minutes} min
                  </span>
                )}
              </div>

              <div style={styles.challengeActions}>
                <button
                  onClick={() => setEditingChallenge(challenge)}
                  style={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(challenge.id)}
                  style={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  createButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  filters: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  },
  searchInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    flexGrow: 1,
    minWidth: '200px'
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px 16px',
    borderRadius: '4px',
    marginBottom: '20px',
    border: '1px solid #f5c6cb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dismissButton: {
    background: 'none',
    border: 'none',
    color: '#721c24',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 5px'
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
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer'
  }
};

export default ChallengeManagement;