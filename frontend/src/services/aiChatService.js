// frontend/src/services/aiChatService.js
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