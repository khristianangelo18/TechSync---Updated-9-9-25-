// frontend/src/components/AIChat/AIChatInterface.js
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiChatService } from '../../services/aiChatService';

const AIChatInterface = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showProjectGenerator, setShowProjectGenerator] = useState(false);
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

• 🚀 Generate project ideas based on your skills
• 💡 Plan and structure your coding projects  
• 🛠️ Provide technical guidance and best practices
• 📚 Answer questions about programming concepts
• 🎯 Help with project architecture and implementation

What would you like to work on today?`,
      timestamp: new Date().toISOString()
    }]);
  }, [user?.username]);

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
          timestamp: response.data.timestamp
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

  const handleProjectGeneration = async () => {
    setShowProjectGenerator(true);
    setIsLoading(true);

    try {
      const userSkills = user?.programming_languages?.map(lang => 
        lang.programming_languages?.name || lang.name
      ) || [];
      
      const userInterests = user?.topics?.map(topic => 
        topic.topics?.name || topic.name
      ) || [];

      const response = await aiChatService.generateProjectIdeas({
        skills: userSkills,
        interests: userInterests,
        difficulty: 'intermediate',
        projectType: 'web'
      }, token);

      if (response.success) {
        let projectContent = "Here are some personalized project ideas for you:\n\n";
        
        if (Array.isArray(response.data.projects)) {
          response.data.projects.forEach((project, index) => {
            projectContent += `**${index + 1}. ${project.name}**\n`;
            projectContent += `${project.description}\n\n`;
            
            if (project.features && Array.isArray(project.features)) {
              projectContent += "Key Features:\n";
              project.features.forEach(feature => {
                projectContent += `• ${feature}\n`;
              });
            }
            
            if (project.technologies && Array.isArray(project.technologies)) {
              projectContent += `\nTechnologies: ${project.technologies.join(', ')}\n`;
            }
            
            if (project.timeEstimate) {
              projectContent += `Time Estimate: ${project.timeEstimate}\n`;
            }
            
            projectContent += `Difficulty: ${project.difficulty || 'Intermediate'}\n\n---\n\n`;
          });
        } else {
          projectContent += response.data.projects[0]?.description || "Check the AI response for project details.";
        }

        const projectMessage = {
          id: Date.now(),
          role: 'assistant',
          content: projectContent,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, projectMessage]);
      }
    } catch (error) {
      console.error('Error generating projects:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I couldn\'t generate project ideas at the moment. Please try asking me directly!',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setShowProjectGenerator(false);
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
    projectGenButton: {
      padding: '8px 16px',
      backgroundColor: '#8b5cf6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
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
      padding: '12px 16px',
      borderRadius: '12px',
      fontSize: '14px',
      lineHeight: '1.5'
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    assistantMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#f1f5f9',
      color: '#334155',
      border: '1px solid #e2e8f0'
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
    }
  };

  const quickActions = [
    "Help me plan a web application",
    "Generate a JavaScript project idea",
    "Best practices for React development",
    "How to structure a full-stack project"
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.headerTitle}>
          Chat with Sync!
        </h3>
        <button 
          style={{
            ...styles.projectGenButton,
            ...(isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
          }}
          onClick={handleProjectGeneration}
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = '#7c3aed';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.target.style.backgroundColor = '#8b5cf6';
            }
          }}
        >
            Generate Projects
        </button>
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
        
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.message,
              ...(message.role === 'user' ? styles.userMessage : styles.assistantMessage)
            }}
          >
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
          </div>
        ))}
        
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
            {showProjectGenerator ? 'Generating project ideas...' : 'Sync is thinking...'}
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

      {/* CSS for loading animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AIChatInterface;