import React, { useState } from 'react';
import { projectService } from '../services/projectService';

function CreateProject({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailed_description: '',
    topic: '',
    programmingLanguage: '',
    required_experience_level: '',
    maximum_members: '',
    estimated_duration_weeks: '',
    difficulty_level: '',
    github_repo_url: '',
    deadline: '',
    termsAccepted: null
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
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
      // Prepare data for API - ensure we're sending the right data types
      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        detailed_description: formData.detailed_description?.trim() || null,
        required_experience_level: formData.required_experience_level || null,
        maximum_members: formData.maximum_members ? parseInt(formData.maximum_members) : null,
        estimated_duration_weeks: formData.estimated_duration_weeks ? parseInt(formData.estimated_duration_weeks) : null,
        difficulty_level: formData.difficulty_level || null,
        github_repo_url: formData.github_repo_url?.trim() || null,
        deadline: formData.deadline || null,
        programming_languages: formData.programmingLanguage ? [formData.programmingLanguage.trim()] : [],
        topics: formData.topic ? [formData.topic.trim()] : []
      };

      console.log('Submitting project data:', projectData);

      const response = await projectService.createProject(projectData);
      
      if (response.success) {
        console.log('Project created successfully:', response.data);
        alert('Project created successfully!');
        onClose();
      } else {
        console.error('Project creation failed:', response.message);
        if (response.errors) {
          setErrors(response.errors);
        }
        alert('Failed to create project: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        setErrors(error.response.data.errors);
        console.log('Validation errors:', error.response.data.errors);
      }
      
      const errorMessage = error.response?.data?.message || error.message;
      alert('Error creating project: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to display validation errors
  const getFieldError = (fieldName) => {
    const error = errors.find(err => err.param === fieldName || err.field === fieldName);
    return error ? error.msg || error.message : null;
  };

  // Step 1: Project Title
  if (currentStep === 1) {
    return (
      <div>
        <h2>Create Project</h2>
        
        {errors.length > 0 && (
          <div style={{ 
            backgroundColor: '#fee', 
            border: '1px solid #fcc', 
            padding: '10px', 
            marginBottom: '20px',
            borderRadius: '4px'
          }}>
            <h4>Validation Errors:</h4>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>
                  <strong>{error.param || error.field}:</strong> {error.msg || error.message}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div style={{ marginBottom: '15px' }}>
          <label>Project Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter your project title (3-255 characters)"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {getFieldError('title') && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '2px' }}>
              {getFieldError('title')}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Project Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="3"
            placeholder="Brief description of your project (10-1000 characters)"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {getFieldError('description') && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '2px' }}>
              {getFieldError('description')}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Detailed Description</label>
          <textarea
            value={formData.detailed_description}
            onChange={(e) => handleInputChange('detailed_description', e.target.value)}
            rows="5"
            placeholder="Detailed project requirements, goals, and expectations (max 5000 characters)"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {getFieldError('detailed_description') && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '2px' }}>
              {getFieldError('detailed_description')}
            </div>
          )}
        </div>

        <button 
          onClick={handleNext}
          disabled={!formData.title.trim() || !formData.description.trim()}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (!formData.title.trim() || !formData.description.trim()) ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (!formData.title.trim() || !formData.description.trim()) ? 'not-allowed' : 'pointer'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 2: Project Details
  if (currentStep === 2) {
    return (
      <div>
        <h2>Project Details</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
            placeholder="e.g., Web Development, Mobile App, Data Science"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Programming Language</label>
          <input
            type="text"
            value={formData.programmingLanguage}
            onChange={(e) => handleInputChange('programmingLanguage', e.target.value)}
            placeholder="e.g., JavaScript, Python, Java"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Required Experience Level</label>
          <select
            value={formData.required_experience_level}
            onChange={(e) => handleInputChange('required_experience_level', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select experience level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Maximum Members</label>
          <input
            type="number"
            min="1"
            max="50"
            value={formData.maximum_members}
            onChange={(e) => handleInputChange('maximum_members', e.target.value)}
            placeholder="Maximum team size (1-50)"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Estimated Duration (weeks)</label>
          <input
            type="number"
            min="1"
            max="104"
            value={formData.estimated_duration_weeks}
            onChange={(e) => handleInputChange('estimated_duration_weeks', e.target.value)}
            placeholder="How many weeks will this project take? (1-104)"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Difficulty Level</label>
          <select
            value={formData.difficulty_level}
            onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>GitHub Repository URL (optional)</label>
          <input
            type="url"
            value={formData.github_repo_url}
            onChange={(e) => handleInputChange('github_repo_url', e.target.value)}
            placeholder="https://github.com/username/repo"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Project Deadline (optional)</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => handleInputChange('deadline', e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        <button 
          onClick={handleNext}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 3: Terms and Conditions
  if (currentStep === 3) {
    return (
      <div>
        <h2>Terms and Condition</h2>
        
        <textarea
          readOnly
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
          rows="10"
          style={{ width: '100%', resize: 'none', padding: '8px', marginBottom: '20px' }}
        />

        <div style={{ margin: '20px 0' }}>
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="radio"
                name="terms"
                value="accept"
                checked={formData.termsAccepted === true}
                onChange={() => handleInputChange('termsAccepted', true)}
                style={{ marginRight: '8px' }}
              />
              I hereby accept the terms and conditions
            </label>
          </div>

          <div>
            <label>
              <input
                type="radio"
                name="terms"
                value="decline"
                checked={formData.termsAccepted === false}
                onChange={() => handleInputChange('termsAccepted', false)}
                style={{ marginRight: '8px' }}
              />
              I decline
            </label>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={formData.termsAccepted !== true || isSubmitting}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: (formData.termsAccepted !== true || isSubmitting) ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: (formData.termsAccepted !== true || isSubmitting) ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Creating Project...' : 'Submit'}
        </button>
      </div>
    );
  }
}

export default CreateProject;