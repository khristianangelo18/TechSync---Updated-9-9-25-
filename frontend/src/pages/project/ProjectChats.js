// frontend/src/pages/project/ProjectChats.js
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatInterface from '../../components/chat/ChatInterface';
import { useChat } from '../../contexts/ChatContext';

const ProjectChats = () => {
  const { projectId } = useParams();
  const { clearMessages } = useChat();

  // Clear messages when component unmounts (leaving project or navigating away)
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  return (
    <div style={{ 
      height: 'calc(100vh - 140px)', // Adjust based on your header/navigation height
      display: 'flex',
      backgroundColor: '#f8fafc'
    }}>
      
      
      {/* Main Chat Interface */}
      <div style={{ 
        flex: 1, 
        marginTop: '40px', // Account for security notice
        display: 'flex'
      }}>
        <ChatInterface projectId={projectId} />
      </div>
    </div>
  );
};

export default ProjectChats;