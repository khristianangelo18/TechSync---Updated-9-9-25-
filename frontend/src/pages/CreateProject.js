// frontend/src/pages/CreateProject.js
import React, { useState, useEffect } from 'react';
import { projectService } from '../services/projectService';
import { suggestionsService } from '../services/suggestionsService';

// Enhanced MultiSelectInput component for programming languages and topics
function MultiSelectInput({ label, selectedItems, onSelectionChange, suggestions, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

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
      setFocusedIndex(-1);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue, suggestions, selectedItems]);

  const handleAddItem = (item) => {
    if (item && item.name && !selectedItems.some(selected => selected && selected.name === item.name)) {
      onSelectionChange([...selectedItems, item]);
      setInputValue('');
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const handleRemoveItem = (itemToRemove) => {
    onSelectionChange(selectedItems.filter(item => item && itemToRemove && item.name !== itemToRemove.name));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredSuggestions[focusedIndex]) {
        handleAddItem(filteredSuggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        const customItem = { 
          name: inputValue.trim(), 
          id: `custom_${Date.now()}`,
          isCustom: true
        };
        handleAddItem(customItem);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    }
  };

  const styles = {
    container: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#333'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s ease'
    },
    inputFocused: {
      borderColor: '#007bff',
      boxShadow: '0 0 0 2px rgba(0, 123, 255, 0.25)'
    },
    selectedItems: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '8px',
      marginBottom: '8px',
      minHeight: selectedItems.length > 0 ? 'auto' : '0'
    },
    selectedItem: {
      backgroundColor: '#007bff',
      color: 'white',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      maxWidth: '200px',
      overflow: 'hidden'
    },
    selectedItemText: {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontSize: '16px',
      padding: '0',
      marginLeft: '4px',
      borderRadius: '50%',
      width: '16px',
      height: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
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
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    suggestion: {
      padding: '10px 12px',
      cursor: 'pointer',
      borderBottom: '1px solid #f0f0f0',
      transition: 'background-color 0.1s ease'
    },
    suggestionFocused: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    suggestionName: {
      fontWeight: '500',
      fontSize: '14px'
    },
    suggestionDescription: {
      fontSize: '12px',
      color: '#666',
      marginTop: '2px'
    },
    itemCount: {
      fontSize: '12px',
      color: '#666',
      marginTop: '4px'
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>{label}</label>
      <div style={styles.inputContainer}>
        <input
          type="text"
          style={{
            ...styles.input,
            ...(showSuggestions ? styles.inputFocused : {})
          }}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => inputValue.trim() && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={placeholder}
        />
        
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div style={styles.suggestions}>
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id || index}
                style={{
                  ...styles.suggestion,
                  ...(index === focusedIndex ? styles.suggestionFocused : {}),
                }}
                onClick={() => handleAddItem(suggestion)}
              >
                <div style={styles.suggestionName}>{suggestion.name}</div>
                {suggestion.description && (
                  <div style={styles.suggestionDescription}>
                    {suggestion.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div style={styles.selectedItems}>
          {selectedItems.filter(item => item && item.name).map((item, index) => (
            <div key={item.id || index} style={styles.selectedItem}>
              <span style={styles.selectedItemText}>
                {item.name}{item.isCustom && ' (custom)'}
              </span>
              <button
                type="button"
                style={styles.removeButton}
                onClick={() => handleRemoveItem(item)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.itemCount}>
        Selected: {selectedItems.filter(item => item && item.name).length}
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
    selectedTopics: [],
    selectedLanguages: [],
    required_experience_level: '',
    maximum_members: '',
    estimated_duration_weeks: '',
    difficulty_level: '',
    github_repo_url: '',
    deadline: '',
    termsAccepted: null
  });

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
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setErrors([]);
    
    try {
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
        programming_languages: formData.selectedLanguages.filter(lang => lang && lang.name).map(lang => lang.name),
        topics: formData.selectedTopics.filter(topic => topic && topic.name).map(topic => topic.name)
      };

      const response = await projectService.createProject(projectData);
      
      if (response.success) {
        onClose();
        window.location.reload();
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
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '30px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflowY: 'auto',
      position: 'relative'
    },
    closeButton: {
      position: 'absolute',
      top: '15px',
      right: '15px',
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999',
      padding: '5px',
      borderRadius: '50%',
      width: '35px',
      height: '35px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      margin: '0 0 20px 0',
      color: '#333',
      fontSize: '24px'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      marginBottom: '8px',
      fontWeight: 'bold',
      color: '#333'
    },
    input: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      transition: 'border-color 0.2s ease'
    },
    textarea: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      minHeight: '120px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    select: {
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '30px',
      gap: '15px'
    },
    button: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      minWidth: '100px'
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
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      cursor: 'not-allowed'
    },
    errorContainer: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '4px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    progressBar: {
      width: '100%',
      height: '4px',
      backgroundColor: '#e9ecef',
      borderRadius: '2px',
      marginBottom: '20px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#007bff',
      transition: 'width 0.3s ease',
      width: `${(currentStep / 3) * 100}%`
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px'
    },
    stepItem: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: '#6c757d'
    },
    stepNumber: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      backgroundColor: '#e9ecef',
      color: '#6c757d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '8px',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    stepNumberActive: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    stepNumberCompleted: {
      backgroundColor: '#28a745',
      color: 'white'
    },
    termsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    termsItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '15px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'border-color 0.2s ease'
    },
    termsItemSelected: {
      borderColor: '#007bff',
      backgroundColor: '#f8f9fa'
    },
    radio: {
      marginTop: '2px'
    },
    termsText: {
      flex: 1
    },
    termsTitle: {
      fontWeight: 'bold',
      marginBottom: '5px'
    },
    termsDescription: {
      fontSize: '14px',
      color: '#666'
    }
  };

  // Step 1: Basic Information
  if (currentStep === 1) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modal}>
          <button style={styles.closeButton} onClick={onClose}>×</button>
          
          <div style={styles.header}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            
            <div style={styles.stepIndicator}>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>1</div>
                Basic Info
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>2</div>
                Details
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>3</div>
                Review
              </div>
            </div>
            
            <h2 style={styles.title}>Create New Project</h2>
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
                placeholder="Enter a compelling project title"
                maxLength="100"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Short Description *</label>
              <textarea
                style={styles.textarea}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Provide a brief overview of your project (2-3 sentences)"
                maxLength="500"
              />
              <small style={{ color: '#666', marginTop: '5px' }}>
                {formData.description.length}/500 characters
              </small>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Detailed Description</label>
              <textarea
                style={{...styles.textarea, minHeight: '150px'}}
                value={formData.detailed_description}
                onChange={(e) => handleInputChange('detailed_description', e.target.value)}
                placeholder="Provide more details about your project goals, features, and requirements"
                maxLength="2000"
              />
              <small style={{ color: '#666', marginTop: '5px' }}>
                {formData.detailed_description.length}/2000 characters
              </small>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button style={{...styles.button, ...styles.secondaryButton}} onClick={onClose}>
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
      </div>
    );
  }

  // Step 2: Project Details
  if (currentStep === 2) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modal}>
          <button style={styles.closeButton} onClick={onClose}>×</button>
          
          <div style={styles.header}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            
            <div style={styles.stepIndicator}>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                Basic Info
              </div>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>2</div>
                Details
              </div>
              <div style={styles.stepItem}>
                <div style={styles.stepNumber}>3</div>
                Review
              </div>
            </div>
            
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
            <MultiSelectInput
              label="Topics *"
              selectedItems={formData.selectedTopics}
              onSelectionChange={(topics) => handleInputChange('selectedTopics', topics)}
              suggestions={topicSuggestions}
              placeholder="e.g., Web Development, Mobile App, Data Science"
            />

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
            <button style={{...styles.button, ...styles.secondaryButton}} onClick={handleBack}>
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
      </div>
    );
  }

  // Step 3: Review and Terms
  if (currentStep === 3) {
    return (
      <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={styles.modal}>
          <button style={styles.closeButton} onClick={onClose}>×</button>
          
          <div style={styles.header}>
            <div style={styles.progressBar}>
              <div style={styles.progressFill}></div>
            </div>
            
            <div style={styles.stepIndicator}>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                Basic Info
              </div>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberCompleted}}>✓</div>
                Details
              </div>
              <div style={styles.stepItem}>
                <div style={{...styles.stepNumber, ...styles.stepNumberActive}}>3</div>
                Review
              </div>
            </div>
            
            <h2 style={styles.title}>Review & Confirm</h2>
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
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Project Summary</h3>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Title:</strong> {formData.title}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Description:</strong> {formData.description}
              </div>
              
              {formData.detailed_description && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Detailed Description:</strong> {formData.detailed_description}
                </div>
              )}
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Topics:</strong> {formData.selectedTopics.map(t => t.name).join(', ')}
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <strong>Programming Languages:</strong> {formData.selectedLanguages.map(l => l.name).join(', ')}
              </div>
              
              {formData.required_experience_level && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Required Experience:</strong> {formData.required_experience_level}
                </div>
              )}
              
              {formData.maximum_members && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Maximum Members:</strong> {formData.maximum_members}
                </div>
              )}
              
              {formData.estimated_duration_weeks && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Estimated Duration:</strong> {formData.estimated_duration_weeks} weeks
                </div>
              )}
              
              {formData.difficulty_level && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Difficulty Level:</strong> {formData.difficulty_level}
                </div>
              )}
              
              {formData.github_repo_url && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>GitHub Repository:</strong> {formData.github_repo_url}
                </div>
              )}
              
              {formData.deadline && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Deadline:</strong> {new Date(formData.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Project Terms *</label>
              <div style={styles.termsContainer}>
                <div 
                  style={{
                    ...styles.termsItem,
                    ...(formData.termsAccepted === 'open' ? styles.termsItemSelected : {})
                  }}
                  onClick={() => handleInputChange('termsAccepted', 'open')}
                >
                  <input
                    type="radio"
                    name="terms"
                    value="open"
                    checked={formData.termsAccepted === 'open'}
                    onChange={() => handleInputChange('termsAccepted', 'open')}
                    style={styles.radio}
                  />
                  <div style={styles.termsText}>
                    <div style={styles.termsTitle}>Open Collaboration</div>
                    <div style={styles.termsDescription}>
                      This project is open for anyone to join. Team members can contribute 
                      according to their availability and skill level. Perfect for learning 
                      and networking.
                    </div>
                  </div>
                </div>

                <div 
                  style={{
                    ...styles.termsItem,
                    ...(formData.termsAccepted === 'committed' ? styles.termsItemSelected : {})
                  }}
                  onClick={() => handleInputChange('termsAccepted', 'committed')}
                >
                  <input
                    type="radio"
                    name="terms"
                    value="committed"
                    checked={formData.termsAccepted === 'committed'}
                    onChange={() => handleInputChange('termsAccepted', 'committed')}
                    style={styles.radio}
                  />
                  <div style={styles.termsText}>
                    <div style={styles.termsTitle}>Committed Team</div>
                    <div style={styles.termsDescription}>
                      This project requires dedicated team members who can commit to regular 
                      participation and meeting deadlines. Ideal for serious development work.
                    </div>
                  </div>
                </div>

                <div 
                  style={{
                    ...styles.termsItem,
                    ...(formData.termsAccepted === 'commercial' ? styles.termsItemSelected : {})
                  }}
                  onClick={() => handleInputChange('termsAccepted', 'commercial')}
                >
                  <input
                    type="radio"
                    name="terms"
                    value="commercial"
                    checked={formData.termsAccepted === 'commercial'}
                    onChange={() => handleInputChange('termsAccepted', 'commercial')}
                    style={styles.radio}
                  />
                  <div style={styles.termsText}>
                    <div style={styles.termsTitle}>Commercial Project</div>
                    <div style={styles.termsDescription}>
                      This project has commercial potential. Team members may be eligible 
                      for revenue sharing or equity based on contribution and agreement.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '15px',
              borderRadius: '4px',
              border: '1px solid #e9ecef',
              fontSize: '14px',
              color: '#666'
            }}>
              <p style={{ margin: '0 0 10px 0' }}>
                By creating this project, you agree to:
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Maintain respectful and professional communication with team members</li>
                <li>Provide clear project requirements and expectations</li>
                <li>Respect intellectual property rights and open-source licenses</li>
                <li>Follow TechSync's community guidelines and code of conduct</li>
              </ul>
            </div>
          </div>

          <div style={styles.buttonContainer}>
            <button
              style={{...styles.button, ...styles.secondaryButton}}
              onClick={handleBack}
              disabled={isSubmitting}
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
      </div>
    );
  }

  return null;
}

export default CreateProject;