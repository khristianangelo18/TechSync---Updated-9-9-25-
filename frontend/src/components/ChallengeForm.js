// frontend/src/components/ChallengeForm.js
import React, { useState, useEffect } from 'react';
import ChallengeAPI from '../services/challengeAPI';

const ChallengeForm = ({ onSuccess, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'easy',
    time_limit_minutes: 30,
    programming_language_id: '',
    project_id: '',
    starter_code: '',
    expected_solution: '',
    test_cases: ''
  });

  const [languages, setLanguages] = useState([]);
  const [testCaseFields, setTestCaseFields] = useState([{ input: '', expected_output: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        difficulty_level: initialData.difficulty_level || 'easy',
        time_limit_minutes: initialData.time_limit_minutes || 30,
        programming_language_id: initialData.programming_language_id || '',
        project_id: initialData.project_id || '',
        starter_code: initialData.starter_code || '',
        expected_solution: initialData.expected_solution || '',
        test_cases: initialData.test_cases || ''
      });

      // Parse existing test cases
      if (initialData.test_cases) {
        try {
          const existingTestCases = Array.isArray(initialData.test_cases) 
            ? initialData.test_cases 
            : JSON.parse(initialData.test_cases);
          
          setTestCaseFields(existingTestCases.map(tc => ({
            input: JSON.stringify(tc.input, null, 2),
            expected_output: JSON.stringify(tc.expected_output, null, 2)
          })));
        } catch (error) {
          console.error('Error parsing test cases:', error);
        }
      }
    }
  }, [initialData]);

  // Load programming languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await ChallengeAPI.getProgrammingLanguages();
        setLanguages(response.data || []);
      } catch (error) {
        console.error('Error loading languages:', error);
        setError('Failed to load programming languages');
      }
    };

    loadLanguages();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...testCaseFields];
    newTestCases[index][field] = value;
    setTestCaseFields(newTestCases);
  };

  const addTestCase = () => {
    setTestCaseFields([...testCaseFields, { input: '', expected_output: '' }]);
  };

  const removeTestCase = (index) => {
    if (testCaseFields.length > 1) {
      setTestCaseFields(testCaseFields.filter((_, i) => i !== index));
    }
  };

  const generateTestCasesJSON = () => {
    return testCaseFields
      .filter(tc => tc.input.trim() && tc.expected_output.trim()) // Only include non-empty test cases
      .map(testCase => {
        try {
          return {
            input: JSON.parse(testCase.input),
            expected_output: JSON.parse(testCase.expected_output)
          };
        } catch (error) {
          // If JSON parsing fails, use as string
          return {
            input: testCase.input,
            expected_output: testCase.expected_output
          };
        }
      });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.programming_language_id) {
      setError('Programming language is required');
      return false;
    }
    if (formData.time_limit_minutes < 5 || formData.time_limit_minutes > 300) {
      setError('Time limit must be between 5 and 300 minutes');
      return false;
    }

    // Validate test cases JSON
    const hasValidTestCase = testCaseFields.some(tc => tc.input.trim() && tc.expected_output.trim());
    if (!hasValidTestCase) {
      setError('At least one test case is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const challengeData = {
        ...formData,
        test_cases: JSON.stringify(generateTestCasesJSON()),
        programming_language_id: parseInt(formData.programming_language_id),
        project_id: formData.project_id || null
      };

      let response;
      if (initialData) {
        // Update existing challenge
        response = await ChallengeAPI.updateChallenge(initialData.id, challengeData);
      } else {
        // Create new challenge
        response = await ChallengeAPI.createChallenge(challengeData);
      }

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.challenge);
        }
        
        // Reset form if creating new challenge
        if (!initialData) {
          setFormData({
            title: '',
            description: '',
            difficulty_level: 'easy',
            time_limit_minutes: 30,
            programming_language_id: '',
            project_id: '',
            starter_code: '',
            expected_solution: '',
            test_cases: ''
          });
          setTestCaseFields([{ input: '', expected_output: '' }]);
        }
      }
      
    } catch (error) {
      console.error('Error submitting challenge:', error);
      setError(error.response?.data?.message || 'Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    form: {
      backgroundColor: '#f9f9f9',
      padding: '30px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    title: {
      textAlign: 'center',
      color: '#333',
      marginBottom: '30px'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#555'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'Monaco, Consolas, monospace',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box'
    },
    testCaseContainer: {
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '10px',
      backgroundColor: '#fafafa'
    },
    testCaseHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '10px'
    },
    button: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      marginRight: '10px'
    },
    buttonSecondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    buttonDanger: {
      backgroundColor: '#dc3545',
      color: 'white',
      padding: '5px 10px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px'
    },
    submitButton: {
      backgroundColor: '#28a745',
      color: 'white',
      padding: '12px 30px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      width: '100%',
      marginTop: '20px',
      opacity: loading ? 0.7 : 1
    },
    cancelButton: {
      backgroundColor: '#6c757d',
      color: 'white',
      padding: '12px 30px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      width: '100%',
      marginTop: '10px'
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px'
    },
    error: {
      color: '#dc3545',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      padding: '10px',
      marginBottom: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2 style={styles.title}>
          {initialData ? 'Edit' : 'Create New'} Coding Challenge
        </h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Challenge Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            style={styles.input}
            placeholder="e.g., Two Sum Problem"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            style={styles.textarea}
            placeholder="Detailed description of the challenge..."
          />
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Difficulty Level *</label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              required
              style={styles.select}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Time Limit (minutes) *</label>
            <input
              type="number"
              name="time_limit_minutes"
              value={formData.time_limit_minutes}
              onChange={handleInputChange}
              required
              min="5"
              max="300"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Programming Language *</label>
          <select
            name="programming_language_id"
            value={formData.programming_language_id}
            onChange={handleInputChange}
            required
            style={styles.select}
          >
            <option value="">Select a language...</option>
            {languages.map(lang => (
              <option key={lang.id} value={lang.id}>{lang.name}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Project (Optional)</label>
          <input
            type="text"
            name="project_id"
            value={formData.project_id}
            onChange={handleInputChange}
            style={styles.input}
            placeholder="Project ID (leave blank for general challenges)"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Starter Code</label>
          <textarea
            name="starter_code"
            value={formData.starter_code}
            onChange={handleInputChange}
            style={styles.textarea}
            placeholder="Initial code template for users..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Expected Solution</label>
          <textarea
            name="expected_solution"
            value={formData.expected_solution}
            onChange={handleInputChange}
            style={styles.textarea}
            placeholder="Complete working solution..."
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Test Cases *</label>
          {testCaseFields.map((testCase, index) => (
            <div key={index} style={styles.testCaseContainer}>
              <div style={styles.testCaseHeader}>
                <strong>Test Case {index + 1}</strong>
                {testCaseFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    style={styles.buttonDanger}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div style={styles.row}>
                <div>
                  <label style={styles.label}>Input (JSON format)</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    style={{...styles.textarea, minHeight: '60px'}}
                    placeholder='{"nums": [1, 2, 3], "target": 4}'
                  />
                </div>
                <div>
                  <label style={styles.label}>Expected Output (JSON format)</label>
                  <textarea
                    value={testCase.expected_output}
                    onChange={(e) => handleTestCaseChange(index, 'expected_output', e.target.value)}
                    style={{...styles.textarea, minHeight: '60px'}}
                    placeholder='[0, 2]'
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTestCase}
            style={styles.buttonSecondary}
          >
            Add Test Case
          </button>
        </div>

        <button 
          onClick={handleSubmit} 
          style={styles.submitButton}
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Challenge' : 'Create Challenge')}
        </button>

        {onCancel && (
          <button onClick={onCancel} style={styles.cancelButton}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default ChallengeForm;