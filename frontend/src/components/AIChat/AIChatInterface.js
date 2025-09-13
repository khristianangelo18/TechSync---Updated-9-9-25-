// Fixed AIChatInterface.js - Improved data validation and project creation
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiChatService } from '../../services/aiChatService';
import { Send, Sparkles, Code, Coffee, Lightbulb, Rocket, MessageCircle, Bot } from 'lucide-react';

const AIChatInterface = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: `Hi ${user?.username || 'there'}! I'm Sync, your AI coding assistant. I can help you to:

• Generate project ideas based on your skills
• Plan and structure your coding projects  
• Provide technical guidance and best practices
• Answer questions about programming concepts
• Help with project architecture and implementation

What would you like to work on today?`,
      timestamp: new Date().toISOString()
    }]);
  }, [user?.username]);

  // Listen for project creation events from Dashboard
  useEffect(() => {
    const handleCreateAIProject = async (event) => {
      const projectData = event.detail.project;
      setCreatingProject(projectData.title);
      
      try {
        // Validate and clean project data before sending
        const cleanedProjectData = validateAndCleanProjectData(projectData);
        
        const response = await aiChatService.createProjectFromResponse(cleanedProjectData, token);
        
        if (response.success) {
          const successMessage = {
            id: Date.now(),
            role: 'assistant',
            content: `Great! I've successfully created the project "${cleanedProjectData.title}" for you! You can now find it in your "My Projects" section. The project is ready for you to start working on and invite collaborators. Let that sync in!`,
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, successMessage]);
          
          window.dispatchEvent(new CustomEvent('projectCreated', { 
            detail: { project: response.data.project } 
          }));
          
        } else {
          throw new Error(response.message || 'Failed to create project');
        }
      } catch (error) {
        console.error('Error creating project:', error);
        const errorMessage = {
          id: Date.now(),
          role: 'assistant',
          content: `Sorry, I couldn't create the project "${projectData.title}". ${error.response?.data?.message || error.message || 'Please try creating it manually or ask me to suggest the project details again.'}`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setCreatingProject(null);
      }
    };

    window.addEventListener('createAIProject', handleCreateAIProject);
    return () => window.removeEventListener('createAIProject', handleCreateAIProject);
  }, [token]);

  // Enhanced validation function
  const validateAndCleanProjectData = (projectData) => {
    // Ensure required fields exist and are properly formatted
    const cleaned = {
      title: String(projectData.title || 'Untitled Project').trim().substring(0, 100),
      description: String(projectData.description || projectData.detailed_description || 'AI-generated project').trim().substring(0, 500),
      detailed_description: String(projectData.detailed_description || projectData.description || 'AI-generated project').trim(),
      difficulty_level: validateDifficultyLevel(projectData.difficulty_level),
      required_experience_level: validateExperienceLevel(projectData.required_experience_level || projectData.difficulty_level),
      maximum_members: Math.max(1, Math.min(10, parseInt(projectData.maximum_members) || 1)),
      programming_languages: validateProgrammingLanguages(projectData.programming_languages),
      topics: validateTopics(projectData.topics),
      estimated_duration: projectData.estimated_duration || 'medium',
      status: 'active',
      is_public: false
    };

    // Remove any undefined or null values
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === undefined || cleaned[key] === null) {
        delete cleaned[key];
      }
    });

    return cleaned;
  };

  const validateDifficultyLevel = (level) => {
    const validLevels = ['easy', 'medium', 'hard', 'expert'];
    const normalized = String(level || 'medium').toLowerCase().trim();
    
    // Map common variations
    const levelMap = {
      'beginner': 'easy',
      'intermediate': 'medium',
      'advanced': 'hard',
      'professional': 'expert'
    };
    
    const mappedLevel = levelMap[normalized] || normalized;
    return validLevels.includes(mappedLevel) ? mappedLevel : 'medium';
  };

  const validateExperienceLevel = (level) => {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const normalized = String(level || 'intermediate').toLowerCase().trim();
    
    // Map difficulty to experience
    const difficultyToExperience = {
      'easy': 'beginner',
      'medium': 'intermediate', 
      'hard': 'advanced',
      'expert': 'expert'
    };
    
    const mappedLevel = difficultyToExperience[normalized] || normalized;
    return validLevels.includes(mappedLevel) ? mappedLevel : 'intermediate';
  };

  const validateProgrammingLanguages = (languages) => {
    if (!Array.isArray(languages)) {
      return ['JavaScript']; // Default fallback
    }
    
    const validLanguages = [
      'JavaScript', 'Python', 'Java', 'C#', 'C++', 'C', 'TypeScript', 
      'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'R',
      'HTML', 'CSS', 'SQL', 'Shell', 'PowerShell'
    ];
    
    const cleaned = languages
      .map(lang => cleanTechnologyName(String(lang).trim()))
      .filter(lang => lang && lang.length > 0)
      .slice(0, 5); // Limit to 5 languages
    
    // Map common frameworks to their base languages
    const frameworkMap = {
      'React': 'JavaScript',
      'Vue': 'JavaScript',
      'Angular': 'JavaScript',
      'Node.js': 'JavaScript',
      'Express': 'JavaScript',
      'Django': 'Python',
      'Flask': 'Python',
      'Spring': 'Java',
      'Laravel': 'PHP',
      'Rails': 'Ruby',
      'Next.js': 'JavaScript',
      'Nuxt.js': 'JavaScript'
    };
    
    const mapped = cleaned.map(lang => {
      const normalized = lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
      return frameworkMap[normalized] || 
             validLanguages.find(valid => valid.toLowerCase() === lang.toLowerCase()) || 
             lang;
    });
    
    return mapped.length > 0 ? [...new Set(mapped)] : ['JavaScript'];
  };

  const validateTopics = (topics) => {
    if (!Array.isArray(topics)) {
      return ['Web Development']; // Default fallback
    }
    
    const validTopics = [
      'Web Development', 'Mobile Development', 'Desktop Development',
      'Game Development', 'Data Science', 'Machine Learning', 'AI',
      'Backend Development', 'Frontend Development', 'Full Stack',
      'DevOps', 'Cloud Computing', 'Cybersecurity', 'Blockchain',
      'IoT', 'AR/VR', 'API Development', 'Database', 'Testing'
    ];
    
    const cleaned = topics
      .map(topic => String(topic).trim())
      .filter(topic => topic && topic.length > 0)
      .slice(0, 3); // Limit to 3 topics
    
    return cleaned.length > 0 ? cleaned : ['Web Development'];
  };

  const cleanTechnologyName = (tech) => {
    if (!tech) return tech;
    
    let cleaned = tech
      .trim()
      .replace(/^\*\*\s*/, '')
      .replace(/\s*\*\*$/, '')
      .replace(/\*\*/g, '')
      .replace(/[()[\]{}]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const techMap = {
      'react': 'JavaScript',
      'vue': 'JavaScript', 
      'angular': 'JavaScript',
      'node': 'JavaScript',
      'nodejs': 'JavaScript',
      'node.js': 'JavaScript',
      'express': 'JavaScript',
      'django': 'Python',
      'flask': 'Python',
      'spring': 'Java',
      'laravel': 'PHP',
      'rails': 'Ruby',
      'nextjs': 'JavaScript',
      'next.js': 'JavaScript',
      'nuxtjs': 'JavaScript',
      'nuxt.js': 'JavaScript'
    };
    
    const lowerCleaned = cleaned.toLowerCase();
    return techMap[lowerCleaned] || cleaned;
  };

  const extractProjectDataFromText = (content) => {
    const projects = [];
    
    const sanitizeTitle = (raw) => {
      if (!raw) return 'Untitled Project';
      let s = String(raw)
        .replace(/\*\*/g, '')
        .replace(/[#*_`]/g, '')
        .trim();

      s = s.replace(/^[\s\-•]*\d+\.\s*/, '').trim();
      s = s.replace(/^[\s\-•]+/, '').trim();
      s = s.replace(/^(?:project\s*(?:name|title)|title|name)\s*:?\s*/i, '').trim();
      s = s.replace(/^["'`]+|["'`]+$/g, '').trim();

      return s || 'Untitled Project';
    };

    // Try to extract numbered project sections
    const projectSections = content.split(/\*\*\d+\.\s+/).slice(1);
    
    if (projectSections.length > 0) {
      projectSections.forEach((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length === 0) return;
        
        const firstLine = lines[0];
        const nameMatch = firstLine.match(/^(.+?)\*\*/);
        let nameCandidate = nameMatch ? nameMatch[1].trim() : firstLine.trim();
        let name = sanitizeTitle(nameCandidate);
        
        let description = '';
        let technologies = [];
        let difficulty = 'medium';
        
        // Extract information from the lines
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line && !description && !/^[•·-]/.test(line) && !/^(Key Features|Technologies|Time Estimate|Difficulty):/i.test(line)) {
            description = line;
          }
          
          if (/Technologies:/i.test(line)) {
            const techLine = line.replace(/Technologies:/i, '').trim();
            technologies = techLine
              .split(/[,•·+&/|]/)
              .map(t => cleanTechnologyName(t.trim()))
              .filter(t => t && t.length > 0);
          }
          
          if (/Difficulty:/i.test(line)) {
            const diffLine = line.replace(/Difficulty:/i, '').trim().toLowerCase();
            difficulty = validateDifficultyLevel(diffLine);
          }
        }
        
        const project = {
          title: name,
          description: description || 'AI-generated project idea',
          detailed_description: section.trim(),
          difficulty_level: difficulty,
          required_experience_level: validateExperienceLevel(difficulty),
          maximum_members: 1,
          programming_languages: technologies.length > 0 ? technologies : ['JavaScript'],
          topics: ['Web Development'],
          estimated_duration: 'medium'
        };
        
        projects.push(project);
      });
    }
    
    // Fallback: create a single project from the entire content
    if (projects.length === 0) {
      const titleMatch = content.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? sanitizeTitle(titleMatch[1]) : 'AI Suggested Project';
      
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      const description = sentences.slice(0, 2).join('.').trim() + (sentences.length ? '.' : '');
      
      // Try to extract technologies from content
      const techMatches = content.match(/(?:using|with|in|built with)\s+([^.!?]+)/gi);
      let technologies = ['JavaScript'];
      if (techMatches) {
        const extractedTechs = techMatches.join(' ')
          .split(/[,&+/|]/)
          .map(t => cleanTechnologyName(t.replace(/using|with|in|built with/gi, '').trim()))
          .filter(t => t && t.length > 0 && t.length < 20);
        if (extractedTechs.length > 0) {
          technologies = extractedTechs.slice(0, 3);
        }
      }
      
      const project = {
        title,
        description: description || content.split('\n')[0] || 'AI-generated project idea',
        detailed_description: content.trim(),
        difficulty_level: 'medium',
        required_experience_level: 'intermediate',
        maximum_members: 1,
        programming_languages: technologies,
        topics: ['Web Development'],
        estimated_duration: 'medium'
      };
      
      projects.push(project);
    }
    
    return projects;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await aiChatService.sendMessage(
        userMessage.content,
        conversationHistory,
        token
      );

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.message,
          timestamp: response.data.timestamp,
          isProjectSuggestion: (response.data.message.includes('**') && 
                               (response.data.message.includes('Technologies:') ||
                                response.data.message.includes('Difficulty:') ||
                                response.data.message.includes('Key Features:') ||
                                response.data.message.includes('Time Estimate:'))) ||
                               response.data.message.toLowerCase().includes('project idea')
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { text: "Help me plan a web application", icon: <Code size={16} /> },
    { text: "Generate a JavaScript project idea", icon: <Lightbulb size={16} /> },
    { text: "Best practices for React development", icon: <Coffee size={16} /> },
    { text: "How to structure a full-stack project", icon: <Rocket size={16} /> }
  ];

  // Function to show project preview at dashboard level
  const handleShowPreview = (projectData) => {
    // Validate and clean data before showing preview
    const cleanedProjectData = validateAndCleanProjectData(projectData);
    
    // Emit event to Dashboard to show modal
    window.dispatchEvent(new CustomEvent('aiProjectPreview', { 
      detail: { project: cleanedProjectData } 
    }));
  };

  const MessageComponent = ({ message, isClickableProject, creatingProject, onShowPreview, extractProjectDataFromText }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isBeingCreated = creatingProject && message.content.includes(creatingProject);

    return (
      <div
        style={{
          maxWidth: '85%',
          fontSize: '14px',
          lineHeight: '1.297',
          position: 'relative',
          ...(message.role === 'user' ? {
            alignSelf: 'flex-end',
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '20px 20px 6px 20px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          } : {
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(30, 33, 39, 0.8)',
            color: '#e2e8f0',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '20px 20px 20px 6px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            ...(isClickableProject ? {
              cursor: 'pointer',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              ...(isHovered ? {
                borderColor: '#3b82f6',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 30px rgba(59, 130, 246, 0.25)'
              } : {})
            } : {})
          })
        }}
        onMouseEnter={() => isClickableProject && setIsHovered(true)}
        onMouseLeave={() => isClickableProject && setIsHovered(false)}
      >
        {message.role === 'assistant' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: '#94a3b8' }}>
            <Bot size={14} />
            <span>Sync</span>
            <span>•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          </div>
        )}

        {isBeingCreated && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)', zIndex: 10
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white',
              padding: '12px 20px', borderRadius: '12px', fontSize: '14px',
              fontWeight: '600', display: 'flex', alignItems: 'center', gap: '12px',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{
                width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
              Creating project...
            </div>
          </div>
        )}
        
        {isClickableProject && isHovered && !creatingProject && (
          <button
            style={{
              position: 'absolute', top: '12px', right: '12px',
              padding: '8px 16px', background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '12px', cursor: 'pointer', fontWeight: '600',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
            onClick={(e) => {
              e.stopPropagation();
              const projects = extractProjectDataFromText(message.content);
              if (projects.length > 0) {
                onShowPreview(projects[0]);
              } else {
                const fallbackProject = {
                  title: "AI Suggested Project",
                  description: message.content.split('\n')[0] || "AI generated project idea",
                  detailed_description: message.content,
                  difficulty_level: 'medium',
                  required_experience_level: 'intermediate',
                  maximum_members: 1,
                  programming_languages: ['JavaScript'],
                  topics: ['Web Development']
                };
                onShowPreview(fallbackProject);
              }
            }}
          >
            <Sparkles size={14} />
            Preview Project
          </button>
        )}
        
        <div>
          {message.content.split('\n').map((line, index) => {
            if (line.startsWith('**') && line.endsWith('**')) {
              return <div key={index} style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '16px' }}>
                {line.replace(/\*\*/g, '')}
              </div>;
            }
            if (line.startsWith('• ')) {
              return <div key={index} style={{ marginLeft: '20px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                <span>{line.substring(2)}</span>
              </div>;
            }
            if (line === '---') {
              return <hr key={index} style={{ margin: '20px 0', border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }} />;
            }
            return <div key={index} style={line ? { marginBottom: '8px' } : { marginBottom: '12px' }}>
              {line || <br />}
            </div>;
          })}
        </div>
        
        {isClickableProject && !creatingProject && (
          <div style={{
            marginTop: '16px', padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))',
            borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)',
            fontSize: '13px', color: '#93c5fd', fontWeight: '500',
            textAlign: 'center', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: '8px'
          }}>
            <Sparkles size={16} />
            Hover over this message and click "Preview Project" to see details before creating!
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.95))',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      height: '650px',
      position: 'relative',
      backdropFilter: 'blur(20px)',
      color: 'white',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden'
    }}>
      
      {/* Header - Fixed at top */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: '700',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <MessageCircle size={24} />
              Chat with Sync
            </h3>
            <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>Your AI coding companion</div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '20px',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#10b981', animation: 'pulse 2s infinite'
            }}></div>
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>Online</span>
          </div>
        </div>
      </div>

      {/* Messages - Scrollable area */}
      <div style={{
        position: 'absolute',
        top: '80px', // After header
        bottom: '88px', // Above input
        left: 0,
        right: 0,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {messages.length === 1 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#e2e8f0',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lightbulb size={16} />
              Quick Start Ideas
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  style={{
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.05))',
                    color: '#e2e8f0',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backdropFilter: 'blur(8px)'
                  }}
                  onClick={() => setInputMessage(action.text)}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {action.icon}
                  {action.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((message) => {
          const isClickableProject = message.role === 'assistant' && message.isProjectSuggestion;
          
          return (
            <MessageComponent
              key={message.id}
              message={message}
              isClickableProject={isClickableProject}
              creatingProject={creatingProject}
              onShowPreview={handleShowPreview}
              extractProjectDataFromText={extractProjectDataFromText}
            />
          );
        })}
        
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            maxWidth: '85%',
            padding: '16px 20px',
            backgroundColor: 'rgba(30, 33, 39, 0.6)',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px 20px 20px 6px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backdropFilter: 'blur(12px)'
          }}>
            <div style={{
              width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'
            }}></div>
            Sync is thinking...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '50px',
        padding: '20px 24px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'linear-gradient(135deg, rgba(15, 17, 22, 0.95), rgba(26, 28, 32, 0.8))',
        backdropFilter: 'blur(12px)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px'
      }}>
        <form onSubmit={handleSendMessage} style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          height: '56px'
        }}>
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about coding projects..."
            style={{
              flex: 1,
              padding: '16px 20px',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              fontSize: '14px',
              resize: 'none',
              height: '56px',
              fontFamily: 'inherit',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'white',
              backdropFilter: 'blur(8px)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isLoading}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              width: '56px',
              height: '56px',
              background: isLoading || !inputMessage.trim() 
                ? 'rgba(107, 114, 128, 0.5)' 
                : 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isLoading || !inputMessage.trim() 
                ? 'none' 
                : '0 8px 24px rgba(59, 130, 246, 0.3)',
              flexShrink: 0,
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.boxShadow = '0 12px 30px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <div style={{
                width: '20px', height: '20px', border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite'
              }}></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .messages-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .messages-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        
        .messages-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-radius: 4px;
        }
        
        .messages-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
        }
        
        .messages-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #3b82f6 rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default AIChatInterface;