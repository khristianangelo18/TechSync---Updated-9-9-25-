// backend/routes/aiChat.js - UPDATED WITH CORRECT API
const express = require('express');
const { GoogleGenAI } = require('@google/genai'); // Updated import
const auth = require('../middleware/auth');

// Import your existing database configuration
const db = require('../config/database');

const router = express.Router();

// Initialize Gemini AI with better error handling
let genAI = null;
let availableModels = [];

const initializeGeminiAI = async () => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found. AI features will be disabled.');
      return;
    }

    console.log('Initializing Gemini AI...');
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    
    // Test the connection with a simple request
    try {
      const testResponse = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello"
      });
      
      console.log('✅ Gemini AI initialized successfully');
      availableModels = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash']; // Common models
      
    } catch (testError) {
      console.error('❌ Error testing Gemini AI:', testError.message);
      
      // Try alternative models
      const alternativeModels = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'];
      for (const model of alternativeModels) {
        try {
          await genAI.models.generateContent({
            model: model,
            contents: "Hello"
          });
          console.log(`✅ Using alternative model: ${model}`);
          availableModels = [model];
          break;
        } catch (altError) {
          console.log(`❌ Model ${model} not available`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error initializing Gemini AI:', error.message);
    genAI = null;
  }
};

// Initialize on startup
initializeGeminiAI();

// Helper function to get the best available model
const getBestAvailableModel = () => {
  if (!genAI || availableModels.length === 0) {
    return null;
  }

  // Return the first available model
  return availableModels[0];
};

// FIXED: Programming language mapping - EXACT match to your database
const normalizeProgrammingLanguage = (langName) => {
  if (!langName || typeof langName !== 'string') return null;
  
  // AGGRESSIVE cleaning - remove all markdown and formatting
  let cleaned = langName
    .toLowerCase()
    .trim()
    .replace(/^\*\*\s*/, '')        // Remove ** from start  
    .replace(/\s*\*\*$/, '')        // Remove ** from end
    .replace(/\*\*/g, '')           // Remove any remaining **
    .replace(/[()[```{}]/g, '')      // Remove brackets
    .replace(/\s+/g, ' ')           // Normalize whitespace
    .trim();

  // Language mapping - map frameworks to core languages
  const LANGUAGE_MAPPING = {
    'javascript': 'JavaScript',
    'js': 'JavaScript', 
    'react': 'JavaScript',
    'vue': 'JavaScript',
    'angular': 'JavaScript',
    'node': 'JavaScript',
    'nodejs': 'JavaScript',
    'node.js': 'JavaScript',
    'express': 'JavaScript',
    'next': 'JavaScript',
    'nextjs': 'JavaScript',
    'next.js': 'JavaScript',
    
    'python': 'Python',
    'django': 'Python',
    'flask': 'Python',
    'fastapi': 'Python',
    
    'java': 'Java',
    'spring': 'Java',
    
    'c++': 'C++',
    'cpp': 'C++',
    'c': 'C',
    
    'c#': 'C#',
    'csharp': 'C#',
    'dotnet': 'C#',
    '.net': 'C#',
    
    'php': 'PHP',
    'laravel': 'PHP',
    
    'ruby': 'Ruby',
    'rails': 'Ruby',
    
    'go': 'Go',
    'golang': 'Go',
    
    'rust': 'Rust',
    'swift': 'Swift',
    'kotlin': 'Kotlin',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'CSS',
    'sass': 'CSS',
    
    'sql': 'SQL',
    'mysql': 'SQL',
    'postgresql': 'SQL',
    'postgres': 'SQL',
    
    'dart': 'Dart',
    'flutter': 'Dart'
  };

  return LANGUAGE_MAPPING[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Test endpoint to check API key and models
router.get('/test-api', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ error: 'No API key found' });
    }

    if (!genAI) {
      return res.json({ error: 'Gemini AI not initialized' });
    }

    // Test with a simple request
    const testResponse = await genAI.models.generateContent({
      model: getBestAvailableModel() || "gemini-2.5-flash",
      contents: "Hello"
    });
    
    res.json({
      success: true,
      apiKeyLength: process.env.GEMINI_API_KEY.length,
      modelsFound: availableModels.length,
      models: availableModels,
      testResponse: testResponse.text
    });
  } catch (error) {
    res.json({
      error: error.message,
      apiKeyExists: !!process.env.GEMINI_API_KEY,
      apiKeyLength: process.env.GEMINI_API_KEY?.length || 0
    });
  }
});

// AI Chat endpoint
router.post('/', auth, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available',
        error: 'Gemini AI not initialized'
      });
    }

    const modelName = getBestAvailableModel();
    if (!modelName) {
      return res.status(500).json({
        success: false,
        message: 'No available AI models',
        error: 'No compatible models found'
      });
    }

    const { message, conversationHistory = [] } = req.body;
    const userId = req.user.id;

    const systemPrompt = `You are a helpful coding project assistant. When suggesting project ideas, format them clearly with:
- **Project Name** as a bold header
- Brief description  
- Key Features: (use bullet points with •)
- Technologies: JavaScript (ONLY list ONE core programming language - JavaScript, Python, Java, C++, etc. NO frameworks)
- Time Estimate: (e.g. "2-3 weeks")
- Difficulty: (Easy, Medium, Hard, or Expert)

CRITICAL: For Technologies, only list ONE core programming language without any frameworks:
- Use "JavaScript" (NOT React, Node.js, Express)
- Use "Python" (NOT Django, Flask)  
- Use "Java" (NOT Spring)
- Use "C++" (NOT specific libraries)

User's context: ${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User message: ${message}`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: systemPrompt
    });

    const aiMessage = response.text;

    res.json({
      success: true,
      data: {
        message: aiMessage,
        timestamp: new Date().toISOString(),
        conversationId: `${userId}_${Date.now()}`
      }
    });

  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    });
  }
});

// FIXED: Project creation - NEVER create new programming languages
router.post('/create-project', auth, async (req, res) => {
  const client = await db.connect();
  
  try {
    const userId = req.user.id;
    const { projectData } = req.body;

    console.log('🔄 Creating project from AI response:', projectData.title);
    console.log('📊 Raw programming languages from frontend:', projectData.programming_languages);

    await client.query('BEGIN');

    // Create main project
    const projectQuery = `
      INSERT INTO projects (
        owner_id, title, description, detailed_description, 
        required_experience_level, maximum_members, estimated_duration_weeks,
        difficulty_level, github_repo_url, deadline, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      RETURNING *
    `;
    
    const projectValues = [
      userId,
      projectData.title.trim(),
      projectData.description.trim(),
      projectData.detailed_description || null,
      projectData.required_experience_level || null,
      projectData.maximum_members || 1,
      projectData.estimated_duration_weeks || null,
      projectData.difficulty_level || null,
      projectData.github_repo_url || null,
      projectData.deadline || null,
      'recruiting'
    ];

    const projectResult = await client.query(projectQuery, projectValues);
    const project = projectResult.rows[0];
    const projectId = project.id;

    // Get ALL existing programming languages from database
    const existingLangsResult = await client.query(
      'SELECT id, name FROM programming_languages WHERE is_active = true ORDER BY id'
    );
    const existingLanguages = existingLangsResult.rows;
    
    console.log('📊 Database has', existingLanguages.length, 'active languages');
    console.log('📋 Sample languages:', existingLanguages.slice(0, 10).map(l => `${l.id}:${l.name}`).join(', '));

    // Create lookup maps
    const langByName = new Map();
    const langByLowerName = new Map();
    
    existingLanguages.forEach(lang => {
      langByName.set(lang.name, lang);
      langByLowerName.set(lang.name.toLowerCase(), lang);
    });

    // Process programming languages - STRICT MODE
    const languagesAdded = [];
    const processedNames = new Set();

    if (projectData.programming_languages && Array.isArray(projectData.programming_languages)) {
      console.log('Processing languages:', projectData.programming_languages);
      
      for (const rawLangName of projectData.programming_languages) {
        if (!rawLangName || typeof rawLangName !== 'string') continue;

        // Clean the language name
        const cleanedName = rawLangName
          .trim()
          .replace(/^\*\*\s*/, '')        // Remove ** prefix
          .replace(/\s*\*\*$/, '')        // Remove ** suffix  
          .replace(/\*\*/g, '')           // Remove all **
          .replace(/[()[```{}]/g, '')      // Remove brackets
          .trim();

        console.log(`Cleaning language: "${rawLangName}" -> "${cleanedName}"`);

        // Normalize using mapping
        const normalizedName = normalizeProgrammingLanguage(cleanedName);
        console.log(`Normalized: "${cleanedName}" -> "${normalizedName}"`);

        // Skip duplicates
        if (processedNames.has(normalizedName?.toLowerCase())) {
          console.log(`Skipping duplicate: ${normalizedName}`);
          continue;
        }

        // STRICT: Only use existing languages from database
        let dbLang = langByName.get(normalizedName);
        if (!dbLang) {
          dbLang = langByLowerName.get(normalizedName?.toLowerCase());
        }

        if (dbLang) {
          console.log(`✓ FOUND in database: "${normalizedName}" -> ID:${dbLang.id} Name:"${dbLang.name}"`);
          
          processedNames.add(normalizedName.toLowerCase());
          const isPrimary = languagesAdded.length === 0;
          
          try {
            await client.query(
              'INSERT INTO project_languages (project_id, language_id, is_primary, required_level) VALUES ($1, $2, $3, $4)',
              [projectId, dbLang.id, isPrimary, 'intermediate']
            );

            languagesAdded.push({
              id: dbLang.id,
              name: dbLang.name,
              is_primary: isPrimary
            });
            
            console.log(`✓ Added to project: "${dbLang.name}" (primary: ${isPrimary})`);
          } catch (linkError) {
            console.error(`Error linking language "${dbLang.name}":`, linkError);
          }
        } else {
          // CRITICAL: NEVER CREATE NEW LANGUAGES
          console.log(`X NOT FOUND in database: "${normalizedName}"`);
          console.log('X SKIPPING - WILL NOT CREATE NEW LANGUAGE');
          
          // Log available languages for debugging
          console.log('Available languages:', existingLanguages.slice(0, 10).map(l => l.name).join(', ') + '...');
        }
      }
    }

    // Ensure at least one language (default to JavaScript)
    if (languagesAdded.length === 0) {
      console.log('⚠️ No languages added, adding default JavaScript...');
      
      const jsLang = langByName.get('JavaScript') || langByLowerName.get('javascript');
      if (jsLang) {
        await client.query(
          'INSERT INTO project_languages (project_id, language_id, is_primary, required_level) VALUES ($1, $2, $3, $4)',
          [projectId, jsLang.id, true, 'intermediate']
        );
        languagesAdded.push({
          id: jsLang.id,
          name: jsLang.name,
          is_primary: true
        });
        console.log('✅ Added default JavaScript');
      }
    }

    console.log('🎉 Final languages added:', languagesAdded.map(l => `${l.name}${l.is_primary ? '(primary)' : ''}`));

    // Handle topics (can create new ones)
    if (projectData.topics && Array.isArray(projectData.topics)) {
      for (let i = 0; i < projectData.topics.length; i++) {
        const topicName = projectData.topics[i];
        if (!topicName || typeof topicName !== 'string') continue;

        // Find or create topic
        let topicResult = await client.query(
          'SELECT id FROM topics WHERE LOWER(name) = LOWER($1)',
          [topicName.trim()]
        );

        let topicId;
        if (topicResult.rows.length === 0) {
          const newTopicResult = await client.query(
                        'INSERT INTO topics (name, is_predefined, created_by, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id',
            [topicName.trim(), false, userId]
          );
          topicId = newTopicResult.rows[0].id;
        } else {
          topicId = topicResult.rows[0].id;
        }

        await client.query(
          'INSERT INTO project_topics (project_id, topic_id, is_primary) VALUES ($1, $2, $3)',
          [projectId, topicId, i === 0]
        );
      }
    }

    // Create project member
    await client.query(
      'INSERT INTO project_members (project_id, user_id, role, status, joined_at) VALUES ($1, $2, $3, $4, NOW())',
      [projectId, userId, 'owner', 'active']
    );

    // Create notification
    await client.query(
      'INSERT INTO notifications (user_id, project_id, notification_type, title, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [userId, projectId, 'project_created', 'Project Created Successfully', `Your project "${projectData.title}" has been created!`]
    );

    await client.query('COMMIT');

    // Fetch complete project with languages for response
    const completeProjectQuery = `
      SELECT 
        p.*, 
        u.username as owner_username,
        u.email as owner_email,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pls.id,
              'name', pls.name,
              'is_primary', plang.is_primary,
              'required_level', plang.required_level
            )
          ) FILTER (WHERE pls.name IS NOT NULL), 
          '[]'::json
        ) as programming_languages,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', ts.id,
              'name', ts.name,
              'is_primary', ptop.is_primary
            )
          ) FILTER (WHERE ts.name IS NOT NULL),
          '[]'::json
        ) as topics
      FROM projects p
      LEFT JOIN users u ON p.owner_id = u.id
      LEFT JOIN project_languages plang ON p.id = plang.project_id
      LEFT JOIN programming_languages pls ON plang.language_id = pls.id
      LEFT JOIN project_topics ptop ON p.id = ptop.project_id
      LEFT JOIN topics ts ON ptop.topic_id = ts.id
      WHERE p.id = $1
      GROUP BY p.id, u.username, u.email
    `;
    
    const completeResult = await client.query(completeProjectQuery, [projectId]);
    const completeProject = completeResult.rows[0];

    console.log('🎉 Project created successfully!');
    console.log('📊 Final programming languages in response:', completeProject.programming_languages);

    res.json({
      success: true,
      message: 'Project created successfully',
      data: {
        project: completeProject
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('💥 Error creating project:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  } finally {
    client.release();
  }
});

// Generate project ideas endpoint  
router.post('/generate-project', auth, async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        message: 'AI service is not available',
        error: 'Gemini AI not initialized'
      });
    }

    const modelName = getBestAvailableModel();
    if (!modelName) {
      return res.status(500).json({
        success: false,
        message: 'No available AI models',
        error: 'No compatible models found'
      });
    }

    const { skills = [], interests = [], difficulty = 'easy', projectType = 'web' } = req.body;

    const projectPrompt = `Generate 1 ${difficulty} ${projectType} project idea for a beginner:

Requirements:
- Use ONLY JavaScript as the technology (no React, Node.js, or frameworks)
- Make it simple and achievable for beginners
- Format clearly with sections

Format:
**Project Name**
Brief description (2-3 sentences)
Key Features: 
• Feature 1
• Feature 2  
• Feature 3
Technologies: JavaScript
Time Estimate: 1-2 weeks
Difficulty: Easy

Focus on: ${skills.join(', ') || 'general web development'}
Interest: ${interests.join(', ') || 'learning programming'}`;

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: projectPrompt
    });

    const aiResponse = response.text;

    // Parse the AI response
    let projects = [];
    try {
      const lines = aiResponse.split('\n').filter(line => line.trim());
      
      let name = '';
      let description = '';
      let technologies = ['JavaScript'];
      let timeEstimate = '1-2 weeks';
      let difficulty = 'Easy';
      
      for (const line of lines) {
        if (line.startsWith('**') && line.endsWith('**')) {
          name = line.replace(/\*\*/g, '').trim();
        } else if (line.includes('Technologies:')) {
          const tech = line.replace('Technologies:', '').trim();
          technologies = tech ? [tech] : ['JavaScript'];
        } else if (line.includes('Time Estimate:')) {
          timeEstimate = line.replace('Time Estimate:', '').trim();
        } else if (line.includes('Difficulty:')) {
          difficulty = line.replace('Difficulty:', '').trim();
        } else if (!line.startsWith('•') && !line.includes(':') && line.length > 10 && !description) {
          description = line.trim();
        }
      }

      projects = [{
        name: name || 'JavaScript Project',
        description: description || 'A simple JavaScript project for beginners',
        technologies,
        timeEstimate,
        difficulty
      }];

    } catch (parseError) {
      console.error('Parse error:', parseError);
      projects = [{
        name: "Simple JavaScript Project",
        description: "A beginner-friendly JavaScript project",
        technologies: ["JavaScript"],
        timeEstimate: "1-2 weeks",
        difficulty: "Easy"
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