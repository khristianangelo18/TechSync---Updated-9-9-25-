// backend/routes/aiChat.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { supabase } = require('../config/supabase');

// Initialize Gemini AI - Check if package is installed
let genAI = null;
let GoogleGenerativeAI = null;

try {
  const { GoogleGenerativeAI: GoogleGenerativeAIClass } = require('@google/generative-ai');
  GoogleGenerativeAI = GoogleGenerativeAIClass;
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized successfully');
} catch (error) {
  console.error('❌ Error initializing Gemini AI:', error.message);
  console.log('💡 Run: npm install @google/generative-ai');
}

// AI Chat endpoint
router.post('/', auth, async (req, res) => {
  try {
    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available. Please install @google/generative-ai package.',
        error: 'Gemini AI not initialized'
      });
    }

    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // System prompt for coding project assistant
    const systemPrompt = `You are a helpful coding project assistant. Your main role is to:
1. Help users generate and plan coding projects
2. Provide technical guidance and suggestions
3. Answer questions about programming and project development
4. Suggest project ideas based on user skills and interests
5. Help with project planning, architecture, and implementation strategies

Keep responses focused on coding projects and development. Be encouraging and educational.

User's previous conversation context: ${conversationHistory.length > 0 ? conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n') : 'No previous context'}`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save conversation to database
    try {
      const { error: saveError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          user_message: message,
          ai_response: aiResponse,
          conversation_context: conversationHistory
        });

      if (saveError) {
        console.error('Error saving conversation:', saveError);
      }
    } catch (saveError) {
      console.error('Error saving to database:', saveError);
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
});

// Generate project ideas endpoint
router.post('/generate-project', auth, async (req, res) => {
  try {
    // Check if Gemini AI is available
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available. Please install @google/generative-ai package.',
        error: 'Gemini AI not initialized'
      });
    }

    const { skills = [], interests = [], difficulty = 'intermediate', projectType = 'web' } = req.body;
    const userId = req.user.id;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const projectPrompt = `Generate 3 unique coding project ideas based on these preferences:
- Skills: ${skills.join(', ') || 'general programming'}
- Interests: ${interests.join(', ') || 'general development'}
- Difficulty: ${difficulty}
- Type: ${projectType}

For each project, provide:
1. Project Name
2. Brief Description (2-3 sentences)
3. Key Features (3-4 bullet points)
4. Technologies/Skills Required
5. Estimated Time to Complete
6. Difficulty Level

Format as JSON array with objects containing: name, description, features (array), technologies (array), timeEstimate, difficulty.`;

    const result = await model.generateContent(projectPrompt);
    const response = await result.response;
    let aiResponse = response.text();

    // Try to parse as JSON, fallback to formatted text
    let projects;
    try {
      // Remove markdown code blocks if present
      aiResponse = aiResponse.replace(/```json\n?|\n?```/g, '');
      projects = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, return formatted text
      projects = [{
        name: "Custom Project Ideas",
        description: aiResponse,
        features: ["See AI response for detailed features"],
        technologies: skills.length > 0 ? skills : ["To be determined"],
        timeEstimate: "Varies",
        difficulty: difficulty
      }];
    }

    res.json({
      success: true,
      data: {
        projects,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project ideas',
      error: error.message
    });
  }
});

// Get conversation history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure user can only access their own history
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: conversations || []
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history'
    });
  }
});

// Save conversation endpoint
router.post('/save-conversation', auth, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('ai_conversation_sessions')
      .insert({
        user_id: userId,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        messages: messages,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Conversation saved successfully'
    });

  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save conversation'
    });
  }
});

module.exports = router;

// AI Chat endpoint
router.post('/', auth, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // System prompt for coding project assistant
    const systemPrompt = `You are a helpful coding project assistant. Your main role is to:
1. Help users generate and plan coding projects
2. Provide technical guidance and suggestions
3. Answer questions about programming and project development
4. Suggest project ideas based on user skills and interests
5. Help with project planning, architecture, and implementation strategies

Keep responses focused on coding projects and development. Be encouraging and educational.

User's previous conversation context: ${conversationHistory.length > 0 ? conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n') : 'No previous context'}`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save conversation to database
    try {
      const { error: saveError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          user_message: message,
          ai_response: aiResponse,
          conversation_context: conversationHistory
        });

      if (saveError) {
        console.error('Error saving conversation:', saveError);
      }
    } catch (saveError) {
      console.error('Error saving to database:', saveError);
    }

    res.json({
      success: true,
      data: {
        message: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
});

// Generate project ideas endpoint
router.post('/generate-project', auth, async (req, res) => {
  try {
    const { skills = [], interests = [], difficulty = 'intermediate', projectType = 'web' } = req.body;
    const userId = req.user.id;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const projectPrompt = `Generate 3 unique coding project ideas based on these preferences:
- Skills: ${skills.join(', ') || 'general programming'}
- Interests: ${interests.join(', ') || 'general development'}
- Difficulty: ${difficulty}
- Type: ${projectType}

For each project, provide:
1. Project Name
2. Brief Description (2-3 sentences)
3. Key Features (3-4 bullet points)
4. Technologies/Skills Required
5. Estimated Time to Complete
6. Difficulty Level

Format as JSON array with objects containing: name, description, features (array), technologies (array), timeEstimate, difficulty.`;

    const result = await model.generateContent(projectPrompt);
    const response = await result.response;
    let aiResponse = response.text();

    // Try to parse as JSON, fallback to formatted text
    let projects;
    try {
      // Remove markdown code blocks if present
      aiResponse = aiResponse.replace(/```json\n?|\n?```/g, '');
      projects = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, return formatted text
      projects = [{
        name: "Custom Project Ideas",
        description: aiResponse,
        features: ["See AI response for detailed features"],
        technologies: skills.length > 0 ? skills : ["To be determined"],
        timeEstimate: "Varies",
        difficulty: difficulty
      }];
    }

    res.json({
      success: true,
      data: {
        projects,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Project generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate project ideas',
      error: error.message
    });
  }
});

// Get conversation history
router.get('/history/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Ensure user can only access their own history
    if (userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { data: conversations, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: conversations || []
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation history'
    });
  }
});

// Save conversation endpoint
router.post('/save-conversation', auth, async (req, res) => {
  try {
    const { title, messages } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('ai_conversation_sessions')
      .insert({
        user_id: userId,
        title: title || `Conversation ${new Date().toLocaleDateString()}`,
        messages: messages,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      message: 'Conversation saved successfully'
    });

  } catch (error) {
    console.error('Error saving conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save conversation'
    });
  }
});

module.exports = router;