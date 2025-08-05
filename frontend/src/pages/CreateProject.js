import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { suggestionsService } from '../services/suggestionsService';

// Multi-select component for programming languages and topics
function MultiSelectInput({ label, selectedItems, onSelectionChange, suggestions, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(item => 
        item && 
        item.name && 
        typeof item.name === 'string' &&
        item.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedItems.some(selected => selected && selected.name === item.name)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, suggestions, selectedItems]);

  const handleAddItem = (item) => {
    if (item && item.name && !selectedItems.some(selected => selected && selected.name === item.name)) {
      onSelectionChange([...selectedItems, item]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    onSelectionChange(selectedItems.filter(item => item && itemToRemove && item.name !== itemToRemove.name));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Add custom item if it doesn't exist
      const customItem = { name: inputValue.trim(), id: `custom_${Date.now()}` };
      handleAddItem(customItem);
    }
  };

  const styles = {
    container: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    selectedItems: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px',
      marginBottom: '8px'
    },
    selectedItem: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '16px',
      fontSize: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '0',
      marginLeft: '4px'
    },
    suggestions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderTop: 'none',
      borderRadius: '0 0 4px 4px',
      maxHeight: '200px',
      overflowY: 'auto',
      zIndex: 1000
    },
    suggestion: {
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '14px',
      borderBottom: '1px solid #f0f0f0'
    },
    suggestionHover: {
      backgroundColor: '#f8f9fa'
    },
    helper: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>
      
      {/* Selected Items */}
      {selectedItems.length > 0 && (
        <div style={styles.selectedItems}>
          {selectedItems.filter(item => item && item.name).map((item, index) => (
            <span key={item.id || index} style={styles.selectedItem}>
              {item.name}
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => handleRemoveItem(item)}
                title="Remove"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={selectedItems.length === 0 ? placeholder : "Add more..."}
          onFocus={() => inputValue && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={styles.suggestions}>
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                style={styles.suggestion}
                onClick={() => handleAddItem(suggestion)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {suggestion.name || 'Unnamed item'}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={styles.helper}>
        Type to search or press Enter to add custom items. Selected: {selectedItems.filter(item => item && item.name).length}
      </div>
    </div>
  );
}

function CreateProject({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [topicSuggestions, setTopicSuggestions] = useState([]);
  const [languageSuggestions, setLanguageSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    selectedTopics: [], // Changed to array
    selectedLanguages: [], // Changed to array
    required_experience_level: '',
    maximum_members: '',
    estimated_duration_weeks: '',
    difficulty_level: '',
    github_repo_url: '',
    deadline: '',
    termsAccepted: null
  });

  // Load suggestions when component mounts
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const [topics, languages] = await Promise.all([
          suggestionsService.getTopics(),
          suggestionsService.getProgrammingLanguages()
        ]);
        setTopicSuggestions(topics);
        setLanguageSuggestions(languages);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }
    };

    loadSuggestions();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors([]);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
      // Prepare data for API
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        detailed_description: formData.detailed_description?.trim() || null,
        required_experience_level: formData.required_experience_level || null,
        maximum_members: formData.maximum_members ? parseInt(formData.maximum_members) : null,
        estimated_duration_weeks: formData.estimated_duration_weeks ? parseInt(formData.estimated_duration_weeks) : null,
        difficulty_level: formData.difficulty_level || null,
        github_repo_url: formData.github_repo_url?.trim() || undefined,
        deadline: formData.deadline || undefined,
        programming_languages: formData.selectedLanguages.filter(lang => lang && lang.name).map(lang => lang.name), // Convert to array of names
        topics: formData.selectedTopics.filter(topic => topic && topic.name).map(topic => topic.name) // Convert to array of names
      };

      console.log('Submitting project data:', projectData);

      const response = await projectService.createProject(projectData);
      
      if (response.success) {
        onClose();
        window.location.reload(); // Refresh to show new project
      }
    } catch (error) {
      console.error('Project creation error:', error);
      
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors.map(err => err.msg));
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]);
      } else {
        setErrors(['Failed to create project. Please try again.']);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '500px',
      margin: '0 auto'
    },
    header: {
      textAlign: 'center',
      marginBottom: '20px'
    },
    step: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '10px'
    },
    title: {
      margin: '0 0 20px 0',
      color: '#333'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    input: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    textarea: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '100px',
      resize: 'vertical'
    },
    select: {
      padding: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '20px'
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    disabledButton: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    },
    errorContainer: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '15px'
    }
  };

  // Step 1: Basic Info
  if (currentStep === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.step}>Step 1 of 3</div>
          <h2 style={styles.title}>Basic Information</h2>
        </div>

        {errors.length > 0 && (
          <div style={styles.errorContainer}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Project Title *</label>
            <input
              type="text"
              style={styles.input}
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Give your project a catchy title"
              maxLength="255"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Short Description *</label>
            <textarea
              style={styles.textarea}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Briefly describe what your project is about"
              maxLength="500"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Detailed Description (Optional)</label>
            <textarea
              style={styles.textarea}
              value={formData.detailed_description}
              onChange={(e) => handleInputChange('detailed_description', e.target.value)}
              placeholder="Provide more details about goals, requirements, and expectations"
              maxLength="5000"
            />
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...((!formData.title.trim() || !formData.description.trim()) ? styles.disabledButton : {})
            }}
            onClick={handleNext}
            disabled={!formData.title.trim() || !formData.description.trim()}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Project Details
  if (currentStep === 2) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.step}>Step 2 of 3</div>
          <h2 style={styles.title}>Project Details</h2>
        </div>

        {errors.length > 0 && (
          <div style={styles.errorContainer}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <div style={styles.form}>
          {/* Multiple Topics Selection */}
          <MultiSelectInput
            label="Topics *"
            selectedItems={formData.selectedTopics}
            onSelectionChange={(topics) => handleInputChange('selectedTopics', topics)}
            suggestions={topicSuggestions}
            placeholder="e.g., Web Development, Mobile App, Data Science"
          />

          {/* Multiple Programming Languages Selection */}
          <MultiSelectInput
            label="Programming Languages *"
            selectedItems={formData.selectedLanguages}
            onSelectionChange={(languages) => handleInputChange('selectedLanguages', languages)}
            suggestions={languageSuggestions}
            placeholder="e.g., JavaScript, Python, Java"
          />

          <div style={styles.inputGroup}>
            <label style={styles.label}>Required Experience Level</label>
            <select
              style={styles.select}
              value={formData.required_experience_level}
              onChange={(e) => handleInputChange('required_experience_level', e.target.value)}
            >
              <option value="">Select experience level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Maximum Members</label>
            <input
              type="number"
              style={styles.input}
              min="1"
              max="50"
              value={formData.maximum_members}
              onChange={(e) => handleInputChange('maximum_members', e.target.value)}
              placeholder="Maximum team size (1-50)"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Estimated Duration (weeks)</label>
            <input
              type="number"
              style={styles.input}
              min="1"
              max="104"
              value={formData.estimated_duration_weeks}
              onChange={(e) => handleInputChange('estimated_duration_weeks', e.target.value)}
              placeholder="How many weeks will this project take?"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Difficulty Level</label>
            <select
              style={styles.select}
              value={formData.difficulty_level}
              onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>GitHub Repository (optional)</label>
            <input
              type="url"
              style={styles.input}
              value={formData.github_repo_url}
              onChange={(e) => handleInputChange('github_repo_url', e.target.value)}
              placeholder="https://github.com/username/repository"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Project Deadline (optional)</label>
            <input
              type="date"
              style={styles.input}
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', e.target.value)}
            />
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => setCurrentStep(1)}
          >
            Back
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...(formData.selectedTopics.length === 0 || formData.selectedLanguages.length === 0 ? styles.disabledButton : {})
            }}
            onClick={handleNext}
            disabled={formData.selectedTopics.length === 0 || formData.selectedLanguages.length === 0}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Terms and Conditions
  if (currentStep === 3) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.step}>Step 3 of 3</div>
          <h2 style={styles.title}>Terms and Conditions</h2>
        </div>

        {errors.length > 0 && (
          <div style={styles.errorContainer}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <textarea
          readOnly
          style={{ ...styles.textarea, minHeight: '200px', marginBottom: '15px' }}
          value="By creating this project, you agree to:

1. Provide accurate and complete project information
2. Maintain respectful communication with team members
3. Respect intellectual property rights
4. Follow community guidelines and code of conduct
5. Take responsibility for project leadership and coordination

You understand that:
- Project success depends on team collaboration
- You can modify project details after creation
- Team members can leave the project at any time
- TechSync is not responsible for project outcomes

Please read these terms carefully before proceeding."
        />

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={formData.termsAccepted === true}
              onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
            />
            I have read and agree to the terms and conditions
          </label>
        </div>

        <div style={styles.buttonContainer}>
          <button
            style={{ ...styles.button, ...styles.secondaryButton }}
            onClick={() => setCurrentStep(2)}
          >
            Back
          </button>
          <button
            style={{
              ...styles.button,
              ...styles.primaryButton,
              ...((!formData.termsAccepted || isSubmitting) ? styles.disabledButton : {})
            }}
            onClick={handleSubmit}
            disabled={!formData.termsAccepted || isSubmitting}
          >
            {isSubmitting ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default CreateProject;