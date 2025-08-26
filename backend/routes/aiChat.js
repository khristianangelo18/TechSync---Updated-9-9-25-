// Simple backend/routes/aiChat.js - Uses your existing Supabase config
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');

// Import your existing database configuration
const db = require('../config/database'); // Adjust path as needed

const router = express.Router();

// Initialize Gemini AI
let genAI = null;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
  }
} catch (error) {
  console.error('Error initializing Gemini AI:', error);
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

When suggesting project ideas, format them clearly with:
- **Project Name** as a bold header
- Brief description
- Key Features: (use bullet points with •)
- Technologies: (comma-separated list)
- Time Estimate: (e.g., "2-3 weeks")
- Difficulty: (Easy, Medium, Hard, or Expert)

This formatting helps users understand and potentially create these projects automatically.

User's previous conversation context: ${conversationHistory.length > 0 ? conversationHistory.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n') : 'No previous context'}`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    // Generate response
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Save conversation to database (using your existing pattern)
    try {
      const query = `
        INSERT INTO ai_conversations (user_id, user_message, ai_response, conversation_context, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `;
      await db.query(query, [userId, message, aiResponse, JSON.stringify(conversationHistory)]);
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

// NEW: Create project from AI response endpoint
router.post('/create-project-from-response', auth, async (req, res) => {
  try {
    const { projectData } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!projectData.title || !projectData.description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Start transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Create project
      const projectQuery = `
        INSERT INTO projects (
          owner_id, title, description, detailed_description, required_experience_level,
          maximum_members, estimated_duration_weeks, difficulty_level, github_repo_url,
          deadline, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *
      `;
      
      const projectValues = [
        userId,
        projectData.title.trim(),
        projectData.description.trim(),
        projectData.detailed_description || null,
        projectData.required_experience_level || null,
        projectData.maximum_members || null,
        projectData.estimated_duration_weeks || null,
        projectData.difficulty_level || null,
        projectData.github_repo_url || null,
        projectData.deadline || null,
        'recruiting'
      ];

      const projectResult = await client.query(projectQuery, projectValues);
      const project = projectResult.rows[0];
      const projectId = project.id;

      // Add programming languages if provided
      if (projectData.programming_languages && Array.isArray(projectData.programming_languages)) {
        for (const langName of projectData.programming_languages) {
          if (!langName || typeof langName !== 'string') continue;

          // Find or create programming language
          let langResult = await client.query(
            'SELECT id FROM programming_languages WHERE LOWER(name) = LOWER($1)',
            [langName.trim()]
          );

          let languageId;
          if (langResult.rows.length === 0) {
            // Create new language
            const newLangResult = await client.query(
              'INSERT INTO programming_languages (name, is_predefined, created_by, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
              [langName.trim(), false, userId]
            );
            languageId = newLangResult.rows[0].id;
          } else {
            languageId = langResult.rows[0].id;
          }

          // Link language to project
          await client.query(
            'INSERT INTO project_languages (project_id, language_id, is_primary, required_level) VALUES ($1, $2, $3, $4)',
            [projectId, languageId, false, projectData.required_experience_level || 'intermediate']
          );
        }
      }

      // Add topics if provided
      if (projectData.topics && Array.isArray(projectData.topics)) {
        for (const topicName of projectData.topics) {
          if (!topicName || typeof topicName !== 'string') continue;

          // Find or create topic
          let topicResult = await client.query(
            'SELECT id FROM topics WHERE LOWER(name) = LOWER($1)',
            [topicName.trim()]
          );

          let topicId;
          if (topicResult.rows.length === 0) {
            // Create new topic
            const newTopicResult = await client.query(
              'INSERT INTO topics (name, is_predefined, created_by, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
              [topicName.trim(), false, userId]
            );
            topicId = newTopicResult.rows[0].id;
          } else {
            topicId = topicResult.rows[0].id;
          }

          // Link topic to project
          await client.query(
            'INSERT INTO project_topics (project_id, topic_id, is_primary) VALUES ($1, $2, $3)',
            [projectId, topicId, false]
          );
        }
      }

      // Create project member entry for owner
      await client.query(
        'INSERT INTO project_members (project_id, user_id, role, status, joined_at) VALUES ($1, $2, $3, $4, NOW())',
        [projectId, userId, 'owner', 'active']
      );

      // Create success notification
      await client.query(
        'INSERT INTO notifications (user_id, project_id, notification_type, title, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
        [userId, projectId, 'project_created', 'Project Created Successfully', `Your project "${projectData.title}" has been created and is ready for collaboration!`]
      );

      await client.query('COMMIT');

      // Fetch complete project data for response
      const completeProjectQuery = `
        SELECT p.*, 
               u.username as owner_username,
               u.email as owner_email,
               array_agg(DISTINCT jsonb_build_object('id', pl.id, 'name', pls.name)) FILTER (WHERE pls.name IS NOT NULL) as programming_languages,
               array_agg(DISTINCT jsonb_build_object('id', pt.id, 'name', ts.name)) FILTER (WHERE ts.name IS NOT NULL) as topics
        FROM projects p
        LEFT JOIN users u ON p.owner_id = u.id
        LEFT JOIN project_languages pl ON p.id = pl.project_id
        LEFT JOIN programming_languages pls ON pl.language_id = pls.id
        LEFT JOIN project_topics pt ON p.id = pt.project_id
        LEFT JOIN topics ts ON pt.topic_id = ts.id
        WHERE p.id = $1
        GROUP BY p.id, u.username, u.email
      `;
      
      const completeResult = await client.query(completeProjectQuery, [projectId]);

      res.json({
        success: true,
        message: 'Project created successfully from AI suggestion',
        data: {
          project: completeResult.rows[0] || project
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating project from AI response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
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

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const projectPrompt = `Generate 3 unique coding project ideas based on these preferences:
- Skills: ${skills.join(', ') || 'general programming'}
- Interests: ${interests.join(', ') || 'general development'}
- Difficulty: ${difficulty}
- Type: ${projectType}

For each project, provide:
1. **Project Name** (use bold formatting)
2. Brief Description (2-3 sentences)
3. Key Features: (use • bullet points)
4. Technologies: (comma-separated list)
5. Time Estimate: (e.g., "2-3 weeks")
6. Difficulty: (Easy, Medium, Hard, or Expert)

Format each project clearly with the above structure. This formatting is important for automatic project creation.`;

    const result = await model.generateContent(projectPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Try to parse and structure the response
    let projects;
    try {
      const projectSections = aiResponse.split(/\*\*\d+\.\s+/).slice(1);
      projects = projectSections.map((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return null;
        
        const nameMatch = lines[0].match(/^(.+?)\*\*/);
        const name = nameMatch ? nameMatch[1].trim() : `Project ${index + 1}`;
        
        let description = '';
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line && !line.startsWith('•') && !line.includes('Key Features') && 
              !line.includes('Technologies') && !line.includes('Time Estimate') && 
              !line.includes('Difficulty')) {
            description = line;
            break;
          }
        }
        
        const techLine = lines.find(line => line.includes('Technologies:'));
        const technologies = techLine ? 
          techLine.replace('Technologies:', '').split(',').map(t => t.trim()) : [];
        
        const timeLine = lines.find(line => line.includes('Time Estimate:'));
        const timeEstimate = timeLine ? timeLine.replace('Time Estimate:', '').trim() : '';
        
        const difficultyLine = lines.find(line => line.includes('Difficulty:'));
        const difficulty = difficultyLine ? 
          difficultyLine.replace('Difficulty:', '').trim().toLowerCase() : 'intermediate';
        
        return {
          name,
          description: description || 'AI-generated project idea',
          technologies,
          timeEstimate,
          difficulty
        };
      }).filter(Boolean);

    } catch (parseError) {
      projects = [{
        name: "Custom Project Ideas",
        description: aiResponse,
        technologies: skills.length > 0 ? skills : ["To be determined"],
        timeEstimate: "Varies",
        difficulty: difficulty
      }];
    }

    res.json({
      success: true,
      data: {
        projects,
        rawResponse: aiResponse,
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

module.exports = router;