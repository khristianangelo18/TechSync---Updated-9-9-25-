// frontend/src/pages/ChallengeManagement.js
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

  const loadChallenges = async () => {
  const loadChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ChallengeAPI.getChallenges(filters);
      setChallenges(response.data.challenges || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
      setError('Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadLanguages = async () => {
    try {
      const response = await ChallengeAPI.getProgrammingLanguages();
      setLanguages(response.data || []);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };

  useEffect(() => {
    loadChallenges();
    loadLanguages();
  }, [loadChallenges]);

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
      } catch (error) {
        console.error('Error deleting challenge:', error);
        setError('Failed to delete challenge');
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
      fontWeight: '500'
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
      fontWeight: '500',
      color: '#555'
    },
    select: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    input: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    challengeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px'
    },
    challengeCard: {
      backgroundColor: 'white',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    challengeCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    challengeTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#333',
      marginBottom: '10px'
    },
    challengeDescription: {
      color: '#666',
      fontSize: '14px',
      marginBottom: '15px',
      lineHeight: '1.4',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    challengeMeta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    difficultyBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    languageBadge: {
      padding: '4px 8px',
      backgroundColor: '#e9ecef',
      color: '#495057',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '500'
    },
    challengeActions: {
      display: 'flex',
      gap: '10px'
    },
    editButton: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    viewButton: {
      backgroundColor: '#17a2b8',
      color: 'white',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    loading: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    },
    error: {
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '20px'
    },
    empty: {
      textAlign: 'center',
      padding: '40px',
      fontSize: '16px',
      color: '#666'
    }
  };

  if (showCreateForm) {
    return (
      <ChallengeForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingChallenge) {
    return (
      <ChallengeForm
        initialData={editingChallenge}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditingChallenge(null)}
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
        >
          Create New Challenge
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
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
      </div>

      {loading ? (
        <div style={styles.loading}>Loading challenges...</div>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>
          No challenges found. Create your first challenge!
        </div>
      ) : (
        <div style={styles.challengeGrid}>
          {challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              style={styles.challengeCard}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
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
                  {challenge.programming_languages?.name}
                </span>
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
                <button
                  onClick={() => console.log('View challenge:', challenge)}
                  style={styles.viewButton}
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
}
export default ChallengeManagement;