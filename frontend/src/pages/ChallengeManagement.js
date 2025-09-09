// frontend/src/pages/ChallengeManagement.js - DARK THEME ALIGNED WITH DASHBOARD
import React, { useState, useEffect, useCallback } from 'react';
import ChallengeForm from '../components/ChallengeForm';
import ChallengeAPI from '../services/challengeAPI';
import { Plus, Search, Filter, X, Edit3, Trash2, Clock, Users, Code } from 'lucide-react';

// Background symbols component - EXACT MATCH with Projects.js and Friends.js
const BackgroundSymbols = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 1,
    pointerEvents: 'none'
  }}>
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
      left: '72.84%', top: '4.42%', color: '#2E3344', transform: 'rotate(-19.68deg)'
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
      left: '9.6%', top: '0%', color: '#1F232E', transform: 'rotate(-6.83deg)'
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
      left: '31.54%', top: '54.31%', color: '#6C758E', transform: 'rotate(25.29deg)'
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
      left: '25.28%', top: '15.89%', color: '#1F232E', transform: 'rotate(-6.83deg)'
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
      left: '48.55%', top: '82.45%', color: '#292A2E', transform: 'rotate(-10.79deg)'
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
      left: '24.41%', top: '92.02%', color: '#2E3344', transform: 'rotate(18.2deg)'
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
      left: '0%', top: '12.8%', color: '#ABB5CE', transform: 'rotate(37.85deg)'
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
      left: '81.02%', top: '94.27%', color: '#6C758E', transform: 'rotate(-37.99deg)'
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
      left: '96.02%', top: '0%', color: '#2E3344', transform: 'rotate(-37.99deg)'
    }}>&#60;/&#62;</div>
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segue UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '0.07%', top: '41.2%', color: '#6C758E', transform: 'rotate(-10.79deg)'
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
    <div style={{
      position: 'absolute',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontStyle: 'normal',
      fontWeight: 900,
      fontSize: '24px',
      lineHeight: '29px',
      userSelect: 'none',
      pointerEvents: 'none',
      left: '85%', top: '65%', color: '#2B2F3E', transform: 'rotate(30deg)'
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
      left: '42%', top: '35%', color: '#4F5A7A', transform: 'rotate(-20deg)'
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
      left: '12%', top: '60%', color: '#8A94B8', transform: 'rotate(40deg)'
    }}>&#60;/&#62;</div>
  </div>
);

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
  const [showFilters, setShowFilters] = useState(false);

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
      easy: '#22c55e',
      medium: '#f59e0b', 
      hard: '#ef4444',
      expert: '#8b5cf6'
    };
    return colors[difficulty?.toLowerCase()] || colors.medium;
  };

  const styles = {
    container: {
      minHeight: 'calc(100vh - 40px)',
      backgroundColor: '#0F1116',
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      paddingLeft: '270px',
      marginLeft: '-150px'
    },
    header: {
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px',
      padding: '0 0 20px 0',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: 'white',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    createButton: {
      background: 'linear-gradient(to right, #3b82f6, #2563eb)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    cancelButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#cbd5e1',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      padding: '12px 24px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    filterSection: {
      position: 'relative',
      zIndex: 10,
      background: 'rgba(26, 28, 32, 0.8)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '24px'
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    filterToggle: {
      backgroundColor: 'transparent',
      border: '1px solid #3b82f6',
      color: '#3b82f6',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    filterControls: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    filterLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#d1d5db'
    },
    filterSelect: {
      padding: '10px 14px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      transition: 'all 0.3s ease'
    },
    searchInput: {
      padding: '10px 14px 10px 44px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      fontSize: '14px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      color: 'white',
      backdropFilter: 'blur(8px)',
      flexGrow: 1,
      minWidth: '250px',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    searchContainer: {
      position: 'relative',
      flexGrow: 1
    },
    searchIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9ca3af',
      zIndex: 2
    },
    clearButton: {
      padding: '10px 20px',
      backgroundColor: '#6b7280',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    error: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.1))',
      color: '#fca5a5',
      padding: '16px 20px',
      borderRadius: '12px',
      marginBottom: '20px',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      zIndex: 10
    },
    dismissButton: {
      background: 'none',
      border: 'none',
      color: '#fca5a5',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '0 5px',
      transition: 'all 0.3s ease'
    },
    loading: {
      textAlign: 'center',
      padding: '60px',
      fontSize: '16px',
      color: '#9ca3af',
      position: 'relative',
      zIndex: 10
    },
    empty: {
      textAlign: 'center',
      padding: '80px 20px',
      color: '#9ca3af',
      fontSize: '16px',
      background: 'rgba(26, 28, 32, 0.8)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
      zIndex: 10
    },
    challengeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
      gap: '24px',
      position: 'relative',
      zIndex: 10
    },
    challengeCard: {
      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.12), rgba(30, 41, 59, 0.08))',
      border: '1px solid rgba(51, 65, 85, 0.25)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '24px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative'
    },
    challengeCardHover: {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 30px rgba(51, 65, 85, 0.25)',
      border: '1px solid rgba(51, 65, 85, 0.4)',
      background: 'linear-gradient(135deg, rgba(51, 65, 85, 0.18), rgba(30, 41, 59, 0.12))'
    },
    challengeTitle: {
      margin: '0 0 12px 0',
      fontSize: '20px',
      fontWeight: '700',
      color: 'white',
      lineHeight: '1.3',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    challengeDescription: {
      color: '#d1d5db',
      fontSize: '14px',
      lineHeight: '1.6',
      margin: '0 0 20px 0',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    },
    challengeMeta: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      alignItems: 'center'
    },
    difficultyBadge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      color: 'white',
      fontWeight: '600',
      textTransform: 'capitalize',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    languageBadge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      color: '#93c5fd',
      fontWeight: '500',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    timeBadge: {
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      backgroundColor: 'rgba(147, 51, 234, 0.15)',
      color: '#c4b5fd',
      fontWeight: '500',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    challengeActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    editButton: {
      padding: '10px 18px',
      backgroundColor: '#f59e0b',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    deleteButton: {
      padding: '10px 18px',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    resultsCount: {
      fontSize: '14px',
      color: '#9ca3af',
      textAlign: 'center',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    },
    modalContent: {
      backgroundColor: '#1a1c20',
      borderRadius: '16px',
      padding: '0',
      maxWidth: '95%',
      maxHeight: '95%',
      overflow: 'auto',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
    }
  };

  // Show create form
  if (showCreateForm) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Plus size={28} style={{ color: '#3b82f6' }} />
            Create New Challenge
          </h1>
          <button
            onClick={() => setShowCreateForm(false)}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ChallengeForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
            languages={languages}
          />
        </div>
      </div>
    );
  }

  // Show edit form
  if (editingChallenge) {
    return (
      <div style={styles.container}>
        <BackgroundSymbols />
        <div style={styles.header}>
          <h1 style={styles.title}>
            <Edit3 size={28} style={{ color: '#f59e0b' }} />
            Edit Challenge
          </h1>
          <button
            onClick={() => setEditingChallenge(null)}
            style={styles.cancelButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Cancel
          </button>
        </div>
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ChallengeForm
            initialData={editingChallenge}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingChallenge(null)}
            languages={languages}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <BackgroundSymbols />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            <Code size={28} style={{ color: '#3b82f6' }} />
            Challenge Management
          </h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={styles.createButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
          }}
        >
          <Plus size={18} />
          Create New Challenge
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={styles.error}>
          {error}
          <button 
            onClick={() => setError('')}
            style={styles.dismissButton}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter Section */}
      {!loading && challenges.length > 0 && (
        <div style={styles.filterSection}>
          <div style={styles.filterHeader}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
              Filter & Search Challenges
            </h3>
            <button
              style={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#3b82f6';
              }}
            >
              <Filter size={16} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>

          {showFilters && (
            <>
              <div style={styles.filterControls}>
                {/* Search Input */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Search Challenges</label>
                  <div style={styles.searchContainer}>
                    <Search size={16} style={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="Search by title or description..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      style={styles.searchInput}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Difficulty Level</label>
                  <select
                    value={filters.difficulty_level}
                    onChange={(e) => handleFilterChange('difficulty_level', e.target.value)}
                    style={styles.filterSelect}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">All Difficulties</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Language Filter */}
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Programming Language</label>
                  <select
                    value={filters.programming_language_id}
                    onChange={(e) => handleFilterChange('programming_language_id', e.target.value)}
                    style={styles.filterSelect}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    <option value="">All Languages</option>
                    {languages.map(lang => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={clearFilters}
                  style={styles.clearButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  <X size={16} />
                  Clear Filters
                </button>
              </div>
            </>
          )}

          {/* Results Count */}
          <div style={styles.resultsCount}>
            Showing {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
            {(filters.difficulty_level || filters.programming_language_id || filters.search) && (
              <span style={{ color: '#60a5fa', fontWeight: '500' }}> (filtered)</span>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div style={styles.loading}>
          Loading challenges...
        </div>
      ) : challenges.length === 0 ? (
        <div style={styles.empty}>
          No challenges found. Create your first challenge!
        </div>
      ) : (
        <div style={styles.challengeGrid}>
          {challenges.map((challenge, index) => (
            <div 
              key={challenge.id} 
              style={styles.challengeCard}
              onMouseEnter={(e) => {
                Object.assign(e.currentTarget.style, styles.challengeCardHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.currentTarget.style, styles.challengeCard);
              }}
            >
              <h3 style={styles.challengeTitle}>
                <Code size={20} style={{ color: '#3b82f6' }} />
                {challenge.title}
              </h3>
              
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
                  {challenge.difficulty_level?.toUpperCase() || 'MEDIUM'}
                </span>
                
                {challenge.programming_language && (
                  <span style={styles.languageBadge}>
                    <Code size={14} />
                    {challenge.programming_language.name || challenge.programming_language}
                  </span>
                )}
                
                {challenge.time_limit_minutes && (
                  <span style={styles.timeBadge}>
                    <Clock size={14} />
                    {challenge.time_limit_minutes} min
                  </span>
                )}
              </div>

              <div style={styles.challengeActions}>
                <button
                  onClick={() => setEditingChallenge(challenge)}
                  style={styles.editButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(challenge.id)}
                  style={styles.deleteButton}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <Trash2 size={14} />
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

export default ChallengeManagement;