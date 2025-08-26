// Enhanced frontend/src/services/aiChatService.js with Project Creation
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const aiChatService = {
  // Send message to AI chat
  sendMessage: async (message, conversationHistory = [], token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat', { 
      message, 
      conversationHistory 
    });
    return response.data;
  },

  // Generate project ideas
  generateProjectIdeas: async (userPreferences = {}, token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat/generate-project', userPreferences);
    return response.data;
  },

  // Create project from AI response using regular project API with proper formatting
  createProjectFromResponse: async (projectData, token) => {
    setAuthToken(token);
    
    // Format the data to match your existing project creation API expectations
    const formattedProjectData = {
      title: projectData.title,
      description: projectData.description,
      detailed_description: projectData.detailed_description,
      required_experience_level: projectData.required_experience_level,
      maximum_members: projectData.maximum_members || 1,
      estimated_duration_weeks: projectData.estimated_duration_weeks || undefined, // Send undefined instead of null
      difficulty_level: projectData.difficulty_level,
      github_repo_url: projectData.github_repo_url,
      deadline: projectData.deadline,
      programming_languages: projectData.programming_languages || [],
      topics: projectData.topics || [],
      project_type: projectData.project_type || 'solo' // Add project_type
    };
    
    const response = await api.post('/projects', formattedProjectData);
    return response.data;
  },

  // Get conversation history
  getConversationHistory: async (userId, token) => {
    setAuthToken(token);
    const response = await api.get(`/ai-chat/history/${userId}`);
    return response.data;
  },

  // Save conversation
  saveConversation: async (conversationData, token) => {
    setAuthToken(token);
    const response = await api.post('/ai-chat/save-conversation', conversationData);
    return response.data;
  }
};

export default aiChatService;