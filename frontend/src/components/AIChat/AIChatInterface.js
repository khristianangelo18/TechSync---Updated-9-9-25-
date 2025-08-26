// Clean AIChatInterface.js with Preview Functionality (No Generate Button)
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiChatService } from '../../services/aiChatService';

const AIChatInterface = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [creatingProject, setCreatingProject] = useState(null);
  const [showProjectPreview, setShowProjectPreview] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const messagesEndRef = useRef(null);

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
      content: `Hi ${user?.username || 'there'}! I'm Sync your AI coding assistant. I can help you to:

• Generate project ideas based on your skills
• Plan and structure your coding projects  
• Provide technical guidance and best practices
• Answer questions about programming concepts
• Help with project architecture and implementation

What would you like to work on today?`,
      timestamp: new Date().toISOString()
    }]);
  }, [user?.username]);

  // Function to show project preview
  const handleShowPreview = (projectData) => {
    console.log('handleShowPreview called with:', projectData);
    setPreviewProject(projectData);
    setShowProjectPreview(true);
  };

  // Function to create project from preview
  const handleCreateFromPreview = async () => {
    console.log('Creating project from preview:', previewProject);
    setShowProjectPreview(false);
    if (previewProject) {
      await handleCreateProject(previewProject);
    }
    setPreviewProject(null);
  };

  // Function to create project automatically using the AI chat service
  const handleCreateProject = async (projectData) => {
    setCreatingProject(projectData.title);
    
    try {
      const response = await aiChatService.createProjectFromResponse(projectData, token);
      
      if (response.success) {
        // Show success message
        const successMessage = {
          id: Date.now(),
          role: 'assistant',
          content: `Great! I've successfully created the project "${projectData.title}" for you! You can now find it in your "My Projects" section. The project is ready for you to start working on and invite collaborators. Let that sync in!`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, successMessage]);
        
        // Optional: Trigger a refresh of the projects page
        // Dispatch a custom event that Projects.js can listen to
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
        content: `Sorry, I couldn't create the project "${projectData.title}". ${error.response?.data?.message || 'Please try creating it manually or ask me to suggest the project details again.'}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setCreatingProject(null);
    }
  };

  // Function to extract project data from AI response - IMPROVED VERSION
  const extractProjectDataFromText = (content) => {
    console.log('Raw AI content to parse:', content);
    
    const projects = [];

    // Helpers
    const sanitizeTitle = (raw) => {
      if (!raw) return raw;
      let s = String(raw)
        .replace(/\*\*/g, '')               // remove bold
        .replace(/[#*_`]/g, '')             // strip extra md chars
        .trim();

      // remove numbering/bullets
      s = s.replace(/^[\s\-•]*\d+\.\s*/, '').trim();
      s = s.replace(/^[\s\-•]+/, '').trim();

      // strip label prefixes
      s = s.replace(/^(?:project\s*(?:name|title)|title|name)\s*:?\s*/i, '').trim();

      // strip surrounding quotes
      s = s.replace(/^["'`]+|["'`]+$/g, '').trim();

      return s;
    };

    const getLabelValue = (text, labels) => {
      const lines = text.split('\n');

      const isLabelLine = (line) => {
        const noBold = line.replace(/\*\*/g, '').trim().toLowerCase();
        return labels.some(l => noBold.startsWith(l + ':') || noBold === l || noBold === l + ':');
      };

      for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const noBold = raw.replace(/\*\*/g, '').trim();
        const lower = noBold.toLowerCase();

        for (const label of labels) {
          // Inline value: "Label: value"
          if (lower.startsWith(label + ':')) {
            const after = noBold.split(':').slice(1).join(':').trim();
            if (after) {
              const v = sanitizeTitle(after);
              if (v) return v;
            }
            // Value on next line
            for (let j = i + 1; j < lines.length; j++) {
              const val = lines[j].replace(/\*\*/g, '').trim();
              if (!val) continue;
              if (isLabelLine(lines[j])) break; // hit another label, abort
              const v = sanitizeTitle(val);
              if (v && !/^project\s*(name|title)$/i.test(v)) return v;
              break;
            }
          } 
          // Block label: "Label" or "Label:"
          else if (lower === label || lower === label + ':') {
            for (let j = i + 1; j < lines.length; j++) {
              const val = lines[j].replace(/\*\*/g, '').trim();
              if (!val) continue;
              if (isLabelLine(lines[j])) break; // hit another label, abort
              const v = sanitizeTitle(val);
              if (v && !/^project\s*(name|title)$/i.test(v)) return v;
              break;
            }
          }
        }
      }
      return null;
    };

    // Try multiple parsing strategies

    // Strategy 1: Look for numbered projects with **bold** titles
    const projectSections = content.split(/\*\*\d+\.\s+/).slice(1);
    
    if (projectSections.length > 0) {
      console.log('Found', projectSections.length, 'project sections');
      
      projectSections.forEach((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        console.log('Processing section:', index, lines);
        
        if (lines.length === 0) return;
        
        // Extract project name from first line, sanitize and fix "Project Name:" issue
        const firstLine = lines[0];
        const nameMatch = firstLine.match(/^(.+?)\*\*/);
        let nameCandidate = nameMatch ? nameMatch[1].trim() : firstLine.trim();

        // Prefer explicit label value if present
        let name = getLabelValue(section, ['project name', 'project title', 'title', 'name']) 
                || sanitizeTitle(nameCandidate);

        if (!name) name = `Project ${index + 1}`;
        
        // Extract description (usually the next non-empty line)
        let description = '';
        let detailedDescription = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (
            line &&
            !/^•/.test(line) &&
            !/^Key Features/i.test(line) &&
            !/^Features/i.test(line) &&
            !/^Technologies/i.test(line) &&
            !/^Time Estimate/i.test(line) &&
            !/^Difficulty/i.test(line) &&
            !/^Project\s*(Name|Title)/i.test(line) &&
            line !== '---'
          ) {
            if (!description) {
              description = line;
            } else {
              detailedDescription += line + '\n';
            }
          }
        }
        
        // Extract features
        const features = [];
        let inFeatures = false;
        for (const line of lines) {
          const clean = line.replace(/\*\*/g, '');
          if (/^Key Features/i.test(clean) || /^Features/i.test(clean)) {
            inFeatures = true;
            continue;
          }
          if (inFeatures && (clean.trim().startsWith('•') || clean.trim().startsWith('- '))) {
            features.push(clean.replace(/^[-•]\s*/, '').trim());
          } else if (inFeatures && clean.trim() && !clean.includes(':')) {
            break; // Stop when we hit non-bullet content
          }
        }
        
        // Extract technologies
        const techLine = lines.find(line => /Technologies:/i.test(line));
        const technologies = techLine ? 
          techLine.replace(/Technologies:/i, '')
            .split(/[,\u2022•+&/|]/).map(t => t.trim()).filter(t => t) : [];
        
        // Extract time estimate
        const timeLine = lines.find(line => /Time Estimate:/i.test(line));
        const timeEstimate = timeLine ? timeLine.replace(/Time Estimate:/i, '').trim() : '';
        
        // Extract difficulty
        const difficultyLine = lines.find(line => /Difficulty:/i.test(line));
        const difficultyRaw = difficultyLine ? 
          difficultyLine.replace(/Difficulty:/i, '').trim().toLowerCase() : 'intermediate';
        
        // Map difficulty to database enum
        const difficultyMapping = {
          'easy': 'easy',
          'beginner': 'easy',
          'medium': 'medium',
          'intermediate': 'medium',
          'hard': 'hard',
          'advanced': 'hard',
          'expert': 'expert',
          'difficult': 'hard'
        };
        const mappedDifficulty = difficultyMapping[difficultyRaw] || 'medium';
        
        // Estimate duration in weeks from time estimate
        let estimatedWeeks = null;
        if (timeEstimate) {
          const weekMatch = timeEstimate.match(/(\d+)\s*week/i);
          const monthMatch = timeEstimate.match(/(\d+)\s*month/i);
          const rangeWeekMatch = timeEstimate.match(/(\d+)\s*[-–]\s*(\d+)\s*week/i);
          const rangeMonthMatch = timeEstimate.match(/(\d+)\s*[-–]\s*(\d+)\s*month/i);
          if (rangeWeekMatch) {
            estimatedWeeks = Math.round((parseInt(rangeWeekMatch[1]) + parseInt(rangeWeekMatch[2])) / 2);
          } else if (rangeMonthMatch) {
            estimatedWeeks = Math.round((parseInt(rangeMonthMatch[1]) + parseInt(rangeMonthMatch[2])) / 2) * 4;
          } else if (weekMatch) {
            estimatedWeeks = parseInt(weekMatch[1]);
          } else if (monthMatch) {
            estimatedWeeks = parseInt(monthMatch[1]) * 4;
          }
        }
        
        if (estimatedWeeks !== null && (estimatedWeeks < 1 || estimatedWeeks > 104)) {
          estimatedWeeks = null;
        }
        
        // Build detailed description with features
        let fullDetailedDescription = description;
        if (features.length > 0) {
          fullDetailedDescription += '\n\nKey Features:\n' + features.map(f => `• ${f}`).join('\n');
        }
        if (detailedDescription) {
          fullDetailedDescription += '\n\n' + detailedDescription.trim();
        }
        
        const project = {
          title: name,
          description: description || 'AI-generated project idea',
          detailed_description: fullDetailedDescription.trim(),
          difficulty_level: mappedDifficulty,
          required_experience_level: mappedDifficulty === 'easy' ? 'beginner' : 
                                  mappedDifficulty === 'medium' ? 'intermediate' : 
                                  mappedDifficulty === 'hard' ? 'advanced' : 'expert',
          estimated_duration_weeks: estimatedWeeks,
          maximum_members: 1, // Minimum required by validation (2-50)
          programming_languages: technologies.length > 0 ? technologies : ['JavaScript'],
          topics: ['Web Development']
        };
        
        console.log('Parsed project:', project);
        projects.push(project);
      });
    }
    
    // Strategy 2: If no numbered sections, try to parse as a single project description
    if (projects.length === 0) {
      console.log('No numbered sections found, trying single project parsing');
      
      // Prefer explicit labeled "Project Name" / "Title"
      let title =
        getLabelValue(content, ['project name', 'project title', 'title', 'name']);

      // Fallback to first bold block if no labeled title found
      if (!title) {
        const titleMatch = content.match(/\*\*(.+?)\*\*/);
        if (titleMatch) {
          const cleaned = sanitizeTitle(titleMatch[1]);
          // If the bold was just "Project Name:", try labeled value again
          if (!cleaned || /^project\s*(name|title)$/i.test(cleaned)) {
            title = getLabelValue(content, ['project name', 'project title', 'title', 'name']) 
                || 'AI Suggested Project';
          } else {
            title = cleaned;
          }
        }
      }

      // Last fallback: the first non-label non-empty line
      if (!title) {
        const firstLine = content
          .split('\n')
          .map(l => l.trim())
          .find(l => l && !/^(?:\*\*)?(?:project\s*(?:name|title)|title|name)\s*:?/i.test(l));
        title = sanitizeTitle(firstLine) || 'AI Suggested Project';
      }
      
      // Extract first few sentences as description
      const sentences = content.split(/[.!?]+/).filter(s => s.trim());
      const description = sentences.slice(0, 2).join('.').trim() + (sentences.length ? '.' : '');
      
      // Look for any technologies mentioned
      const techMatches = content.match(/(?:technologies|tech|using|with):\s*([^\n]+)/i);
      const technologies = techMatches ? 
        techMatches[1].split(/[,&+/|]/).map(t => t.trim()).filter(t => t) : 
        ['JavaScript'];
      
      // Look for difficulty
      const difficultyMatch = content.match(/(?:difficulty|level):\s*([^\n]+)/i);
      const difficultyRaw = difficultyMatch ? difficultyMatch[1].toLowerCase().trim() : 'medium';
      const difficulty_level =
        difficultyRaw.includes('easy') || difficultyRaw.includes('beginner') ? 'easy' :
        difficultyRaw.includes('hard') || difficultyRaw.includes('advanced') ? 'hard' :
        difficultyRaw.includes('expert') ? 'expert' : 'medium';
      
      const project = {
        title: title,
        description: description || content.split('\n')[0] || 'AI-generated project idea',
        detailed_description: content,
        difficulty_level,
        required_experience_level: difficulty_level === 'easy' ? 'beginner' :
                                  difficulty_level === 'medium' ? 'intermediate' :
                                  difficulty_level === 'hard' ? 'advanced' : 'expert',
        maximum_members: 1,
        programming_languages: technologies,
        topics: ['Web Development']
      };
      
      console.log('Parsed single project:', project);
      projects.push(project);
    }
    
    console.log('Final extracted projects:', projects);
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
      // Prepare conversation history for context
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

  const styles = {
    container: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    headerTitle: {
      margin: 0,
      fontSize: '18px',
      fontWeight: '600',
      color: '#1e293b',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    message: {
      maxWidth: '80%',
      borderRadius: '12px',
      fontSize: '14px',
      lineHeight: '1.5',
      position: 'relative'
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '12px 16px'
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#f1f5f9',
      color: '#334155',
      border: '1px solid #e2e8f0',
      padding: '12px 16px'
    },
    clickableMessage: {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid #e2e8f0',
      position: 'relative'
    },
    clickableMessageHover: {
      borderColor: '#3b82f6',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    },
    createProjectButton: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      padding: '4px 8px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      cursor: 'pointer',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      opacity: 0,
      transform: 'translateY(-4px)'
    },
    createProjectButtonVisible: {
      opacity: 1,
      transform: 'translateY(0)'
    },
    inputContainer: {
      padding: '20px',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: 'white'
    },
    inputForm: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-end'
    },
    textArea: {
      flex: 1,
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'none',
      minHeight: '20px',
      maxHeight: '120px',
      fontFamily: 'inherit'
    },
    sendButton: {
      padding: '12px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '80px'
    },
    sendButtonDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed'
    },
    loadingMessage: {
      alignSelf: 'flex-start',
      maxWidth: '80%',
      padding: '12px 16px',
      backgroundColor: '#f1f5f9',
      color: '#64748b',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    quickActions: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      flexWrap: 'wrap'
    },
    quickActionButton: {
      padding: '6px 12px',
      backgroundColor: '#f1f5f9',
      color: '#475569',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    projectCreationOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(2px)'
    },
    creatingText: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    // Project Preview Modal Styles
    previewModalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    },
    previewModalContent: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid #e2e8f0'
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #f1f5f9'
    },
    previewTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0,
      flex: 1
    },
    closeButton: {
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#64748b',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease'
    },
    previewSection: {
      marginBottom: '24px'
    },
    previewSectionTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    previewDescription: {
      fontSize: '15px',
      lineHeight: '1.6',
      color: '#4b5563',
      marginBottom: '8px'
    },
    previewDetailedDescription: {
      fontSize: '14px',
      lineHeight: '1.5',
      color: '#6b7280',
      backgroundColor: '#f8fafc',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      whiteSpace: 'pre-line'
    },
    previewMetaGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      marginBottom: '16px'
    },
    previewMetaItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    previewMetaLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    previewMetaValue: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151'
    },
    previewTagsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px'
    },
    previewTag: {
      padding: '6px 12px',
      backgroundColor: '#dbeafe',
      color: '#1e40af',
      fontSize: '12px',
      fontWeight: '500',
      borderRadius: '20px',
      border: '1px solid #bfdbfe'
    },
    previewActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '32px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb'
    },
    previewCancelButton: {
      padding: '12px 24px',
      backgroundColor: '#f8fafc',
      color: '#4b5563',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    previewCreateButton: {
      padding: '12px 24px',
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
    },
    difficultyBadge: {
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'capitalize'
    }
  };

  const quickActions = [
    "Help me plan a web application",
    "Generate a JavaScript project idea",
    "Best practices for React development",
    "How to structure a full-stack project"
  ];

  // Message Component to avoid hooks in map callback
  const MessageComponent = ({ message, isClickableProject, creatingProject, onCreateProject, onShowPreview, extractProjectDataFromText }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isBeingCreated = creatingProject && message.content.includes(creatingProject);

    return (
      <div
        style={{
          ...styles.message,
          ...(message.role === 'user' ? styles.userMessage : {
            ...styles.assistantMessage,
            ...(isClickableProject ? {
              ...styles.clickableMessage,
              ...(isHovered ? styles.clickableMessageHover : {})
            } : {})
          })
        }}
        onMouseEnter={() => isClickableProject && setIsHovered(true)}
        onMouseLeave={() => isClickableProject && setIsHovered(false)}
      >
        {/* Project Creation Overlay */}
        {isBeingCreated && (
          <div style={styles.projectCreationOverlay}>
            <div style={styles.creatingText}>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid rgba(255,255,255,0.3)', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              Creating project...
            </div>
          </div>
        )}
        
        {/* Create Project Button */}
        {isClickableProject && isHovered && !creatingProject && (
          <button
            style={{
              ...styles.createProjectButton,
              ...styles.createProjectButtonVisible
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('Preview button clicked');
              const projects = extractProjectDataFromText(message.content);
              console.log('Extracted projects:', projects);
              
              if (projects.length > 0) {
                console.log('Showing preview for:', projects[0]);
                onShowPreview(projects[0]);
              } else {
                // Fallback: create a basic project from the message content
                console.log('No projects found, creating fallback');
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
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#059669';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#10b981';
            }}
          >
            Preview Project
          </button>
        )}
        
        {/* Message Content */}
        {message.content.split('\n').map((line, index) => {
          if (line.startsWith('**') && line.endsWith('**')) {
            return <div key={index} style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {line.replace(/\*\*/g, '')}
            </div>;
          }
          if (line.startsWith('• ')) {
            return <div key={index} style={{ marginLeft: '16px', marginBottom: '4px' }}>
              {line}
            </div>;
          }
          if (line === '---') {
            return <hr key={index} style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />;
          }
          return <div key={index} style={line ? {} : { marginBottom: '8px' }}>
            {line || <br />}
          </div>;
        })}
        
        {/* Click instruction for project suggestions */}
        {isClickableProject && !creatingProject && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#3b82f6',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            Hover over this message and click "Preview Project" to see project details before creating!
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>
          Chat with Sync!
        </h3>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {messages.length === 0 && (
          <div style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                style={styles.quickActionButton}
                onClick={() => setInputMessage(action)}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#e2e8f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
              >
                {action}
              </button>
            ))}
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
              onCreateProject={handleCreateProject}
              onShowPreview={handleShowPreview}
              extractProjectDataFromText={extractProjectDataFromText}
            />
          );
        })}
        
        {isLoading && (
          <div style={styles.loadingMessage}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              border: '2px solid #cbd5e1', 
              borderTop: '2px solid #3b82f6', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }}></div>
            Sync is thinking...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputContainer}>
        <form onSubmit={handleSendMessage} style={styles.inputForm}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about coding projects..."
            style={styles.textArea}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            style={{
              ...styles.sendButton,
              ...(isLoading || !inputMessage.trim() ? styles.sendButtonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && inputMessage.trim()) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>

      {/* Add CSS animation for spinner */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Project Preview Modal */}
      {showProjectPreview && previewProject && (
        <div style={styles.previewModalOverlay}>
          <div style={styles.previewModalContent}>
            {/* Preview Header */}
            <div style={styles.previewHeader}>
              <h2 style={styles.previewTitle}>Project Preview</h2>
              <button
                style={styles.closeButton}
                onClick={() => {
                  setShowProjectPreview(false);
                  setPreviewProject(null);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>

            {/* Project Title */}
            <div style={styles.previewSection}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 16px 0'
              }}>
                {previewProject.title}
              </h3>
            </div>

            {/* Basic Description */}
            <div style={styles.previewSection}>
              <h4 style={styles.previewSectionTitle}>
                📝 Description
              </h4>
              <p style={styles.previewDescription}>
                {previewProject.description}
              </p>
            </div>

            {/* Detailed Description */}
            {previewProject.detailed_description && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionTitle}>
                  📋 Project Details
                </h4>
                <div style={styles.previewDetailedDescription}>
                  {previewProject.detailed_description}
                </div>
              </div>
            )}

            {/* Project Metadata */}
            <div style={styles.previewSection}>
              <h4 style={styles.previewSectionTitle}>
                ⚙️ Project Settings
              </h4>
              <div style={styles.previewMetaGrid}>
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Difficulty Level</span>
                  <span 
                    style={{
                      ...styles.previewMetaValue,
                      ...styles.difficultyBadge,
                      backgroundColor: previewProject.difficulty_level === 'easy' ? '#dcfce7' : 
                                     previewProject.difficulty_level === 'medium' ? '#fef3c7' :
                                     previewProject.difficulty_level === 'hard' ? '#fee2e2' : '#f3e8ff',
                      color: previewProject.difficulty_level === 'easy' ? '#166534' : 
                             previewProject.difficulty_level === 'medium' ? '#92400e' :
                             previewProject.difficulty_level === 'hard' ? '#991b1b' : '#7c3aed'
                    }}
                  >
                    {previewProject.difficulty_level || 'Medium'}
                  </span>
                </div>
                
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Experience Level</span>
                  <span style={styles.previewMetaValue}>
                    {previewProject.required_experience_level || 'Intermediate'}
                  </span>
                </div>
                
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Max Members</span>
                  <span style={styles.previewMetaValue}>
                    {previewProject.maximum_members || 'Unlimited'}
                  </span>
                </div>
                
                <div style={styles.previewMetaItem}>
                  <span style={styles.previewMetaLabel}>Estimated Duration</span>
                  <span style={styles.previewMetaValue}>
                    {previewProject.estimated_duration_weeks ? 
                      `${previewProject.estimated_duration_weeks} weeks` : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Programming Languages */}
            {previewProject.programming_languages && previewProject.programming_languages.length > 0 && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionTitle}>
                  💻 Technologies
                </h4>
                <div style={styles.previewTagsContainer}>
                  {previewProject.programming_languages.map((lang, index) => (
                    <span key={index} style={styles.previewTag}>
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {previewProject.topics && previewProject.topics.length > 0 && (
              <div style={styles.previewSection}>
                <h4 style={styles.previewSectionTitle}>
                  🏷️ Topics
                </h4>
                <div style={styles.previewTagsContainer}>
                  {previewProject.topics.map((topic, index) => (
                    <span key={index} style={{
                      ...styles.previewTag,
                      backgroundColor: '#f3e8ff',
                      color: '#7c3aed',
                      borderColor: '#ddd6fe'
                    }}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.previewActions}>
              <button
                style={styles.previewCancelButton}
                onClick={() => {
                  setShowProjectPreview(false);
                  setPreviewProject(null);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8fafc';
                }}
              >
                Cancel
              </button>
              <button
                style={styles.previewCreateButton}
                onClick={handleCreateFromPreview}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#10b981';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Create This Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatInterface;