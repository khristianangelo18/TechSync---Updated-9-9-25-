import React, { useState } from 'react';

function CreateProject({ onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    programmingLanguage: '',
    yearsExperience: '',
    termsAccepted: null // null means no selection, true = accept, false = decline
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = () => {
    console.log('Project submitted:', formData);
    // Handle project creation logic here
    onClose();
  };

  // Step 1: Project Title
  if (currentStep === 1) {
    return (
      <div>
        <h2>Create Project</h2>
        
        <div>
          <label>Project Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
          />
        </div>

        <div>
          <label>Project Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows="5"
          />
        </div>

        <button onClick={handleNext}>Continue</button>
      </div>
    );
  }

  // Step 2: Project Details
  if (currentStep === 2) {
    return (
      <div>
        <h2>Project Details</h2>
        
        <div>
          <label>Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => handleInputChange('topic', e.target.value)}
          />
        </div>

        <div>
          <label>Programming Language</label>
          <input
            type="text"
            value={formData.programmingLanguage}
            onChange={(e) => handleInputChange('programmingLanguage', e.target.value)}
          />
        </div>

        <div>
          <label>Years of Experience Required</label>
          <input
            type="number"
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
          />
        </div>

        <button onClick={handleNext}>Continue</button>
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
          value="Terms and conditions content goes here..."
          rows="10"
        />

        <div>
          <label>
            <input
              type="radio"
              name="terms"
              value="accept"
              checked={formData.termsAccepted === true}
              onChange={() => handleInputChange('termsAccepted', true)}
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
            />
            I decline
          </label>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={formData.termsAccepted !== true}
        >
          Submit
        </button>
      </div>
    );
  }
}

export default CreateProject;