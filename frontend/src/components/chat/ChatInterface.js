// frontend/src/components/chat/ChatInterface.js
import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';

const ChatInterface = ({ projectId }) => {
  const { user } = useAuth();
  const {
    connected,
    chatRooms,
    messages,
    activeRoom,
    onlineUsers,
    typingUsers,
    loading,
    setActiveRoom,
    joinProjectRooms,
    sendMessage,
    editMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    fetchChatRooms,
    fetchMessages,
    createChatRoom
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomType, setNewRoomType] = useState('general');
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typingTimer, setTypingTimer] = useState(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Helper function to safely get user display name
  const getUserDisplayName = (userObj) => {
    if (!userObj) return 'Unknown User';
    return userObj.full_name || userObj.username || 'Unknown User';
  };

  // Helper function to safely get user initial
  const getUserInitial = (userObj) => {
    if (!userObj) return '?';
    const displayName = getUserDisplayName(userObj);
    return displayName.charAt(0).toUpperCase();
  };

  // Initialize chat when component mounts
  useEffect(() => {
    if (projectId && connected) {
      joinProjectRooms(projectId);
      fetchChatRooms(projectId);
    }
  }, [projectId, connected, joinProjectRooms, fetchChatRooms]);

  // Load messages when active room changes
  useEffect(() => {
    if (activeRoom && projectId) {
      fetchMessages(projectId, activeRoom);
    }
  }, [activeRoom, projectId, fetchMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, activeRoom]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeRoom) return;

    if (editingMessage) {
      editMessage(editingMessage.id, messageInput);
      setEditingMessage(null);
    } else {
      sendMessage(activeRoom, messageInput, 'text', replyingTo?.id);
      setReplyingTo(null);
    }

    setMessageInput('');
    if (typingTimer) {
      clearTimeout(typingTimer);
      stopTyping(activeRoom);
    }
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    
    if (activeRoom) {
      startTyping(activeRoom);
      
      if (typingTimer) {
        clearTimeout(typingTimer);
      }
      
      setTypingTimer(setTimeout(() => {
        stopTyping(activeRoom);
      }, 1000));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Room name is required');
      return;
    }

    const room = await createChatRoom(projectId, newRoomName, newRoomDescription, newRoomType);
    if (room) {
      setShowCreateRoom(false);
      setNewRoomName('');
      setNewRoomDescription('');
      setNewRoomType('general');
      setActiveRoom(room.id);
    }
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      const oneDay = 24 * 60 * 60 * 1000;

      if (diff < oneDay && date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diff < 7 * oneDay) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
      } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid date';
    }
  };

  const activeRoomData = chatRooms.find(room => room.id === activeRoom);
  const currentMessages = activeRoom ? (messages[activeRoom] || []) : [];
  const currentTypingUsers = activeRoom ? (typingUsers[activeRoom] || {}) : {};

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '2px solid #e2e8f0', 
            borderTop: '2px solid #3b82f6', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <p style={{ marginTop: '8px', color: '#64748b' }}>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      backgroundColor: 'white', 
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Sidebar - Chat Rooms */}
      <div style={{ 
        width: '320px', 
        borderRight: '1px solid #e2e8f0', 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 600, color: '#1f2937', margin: 0 }}>Project Chat</h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              style={{ 
                padding: '8px', 
                color: '#6b7280', 
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              +
            </button>
          </div>
          
          {/* Connection Status */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', fontSize: '14px' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: connected ? '#10b981' : '#ef4444',
              marginRight: '8px' 
            }}></div>
            <span style={{ color: connected ? '#059669' : '#dc2626' }}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          
          {/* Project Members Only Notice */}
          
        </div>

        {/* Room List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chatRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              style={{
                width: '100%',
                padding: '12px',
                textAlign: 'left',
                backgroundColor: activeRoom === room.id ? '#eff6ff' : 'transparent',
                border: 'none',
                borderLeft: activeRoom === room.id ? '4px solid #3b82f6' : '4px solid transparent',
                cursor: 'pointer',
                color: activeRoom === room.id ? '#1e40af' : '#374151'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>#</span>
                <span style={{ fontWeight: 500 }}>{room.name}</span>
              </div>
              {room.description && (
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 20px' }}>
                  {room.description}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* Online Users */}
        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Online ({onlineUsers.length})
            </span>
          </div>
          <div style={{ maxHeight: '128px', overflowY: 'auto' }}>
            {onlineUsers.map((onlineUser) => (
              <div key={onlineUser.id} style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: '#10b981',
                  marginRight: '8px' 
                }}></div>
                <span>{getUserDisplayName(onlineUser)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      }}>
        {activeRoomData ? (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: '16px', 
              borderBottom: '1px solid #e2e8f0', 
              backgroundColor: 'white',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px' }}>#</span>
                <h3 style={{ fontWeight: 600, color: '#1f2937', margin: 0 }}>{activeRoomData.name}</h3>
              </div>
              {activeRoomData.description && (
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                  {activeRoomData.description}
                </p>
              )}
            </div>

            {/* Messages Area */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '16px',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              {/* Messages Container */}
              <div style={{ flex: 1, paddingBottom: '16px' }}>
                {currentMessages.map((message) => {
                  // Safety check for message and user
                  if (!message || !message.user) {
                    console.warn('Message or user is undefined:', message);
                    return null;
                  }

                  return (
                    <div 
                      key={message.id} 
                      className="message-container"
                      style={{ 
                        marginBottom: '16px',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        const actions = e.currentTarget.querySelector('.message-actions');
                        if (actions) actions.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        const actions = e.currentTarget.querySelector('.message-actions');
                        if (actions) actions.style.opacity = '0';
                      }}
                    >
                      {/* Reply indicator - Enhanced */}
                      {message.reply_to && message.reply_to.user && (
                        <div style={{ 
                          marginBottom: '8px', 
                          paddingLeft: '16px', 
                          borderLeft: '3px solid #3b82f6',
                          backgroundColor: '#f8fafc',
                          borderRadius: '0 6px 6px 0',
                          padding: '8px 12px',
                          marginLeft: '44px' // Align with message content
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>
                              ↩ Replying to {getUserDisplayName(message.reply_to.user)}
                            </span>
                          </div>
                          <p style={{ 
                            fontSize: '13px', 
                            color: '#64748b', 
                            margin: 0, 
                            fontStyle: 'italic',
                            lineHeight: '1.4',
                            maxHeight: '40px',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            "{message.reply_to.content || 'Message content unavailable'}"
                          </p>
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        {/* Avatar */}
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          backgroundColor: '#3b82f6', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 500,
                          flexShrink: 0
                        }}>
                          {getUserInitial(message.user)}
                        </div>
                        
                        {/* Message Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 500, color: '#1f2937' }}>
                              {getUserDisplayName(message.user)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {formatTime(message.created_at)}
                            </span>
                            {message.is_edited && (
                              <span style={{ fontSize: '12px', color: '#9ca3af' }}>(edited)</span>
                            )}
                          </div>
                          
                          <div>
                            <p style={{ color: '#1f2937', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {message.content || 'Message content unavailable'}
                            </p>
                          </div>
                          
                          {/* Message Actions - Hover to show */}
                          <div className="message-actions" style={{ 
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            display: 'flex', 
                            gap: '8px', 
                            marginTop: '6px',
                            alignItems: 'center'
                          }}>
                            {/* Reply button for all messages */}
                            <button
                              onClick={() => setReplyingTo(message)}
                              style={{ 
                                fontSize: '13px', 
                                color: '#6b7280', 
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              ↩ Reply
                            </button>
                            
                            {/* Edit/Delete for own messages */}
                            {user && message.user && message.user.id === user.id && (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingMessage(message);
                                    setMessageInput(message.content || '');
                                    messageInputRef.current?.focus();
                                  }}
                                  style={{ 
                                    fontSize: '13px', 
                                    color: '#6b7280', 
                                    backgroundColor: '#f3f4f6',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  ✏ Edit
                                </button>
                                <button
                                  onClick={() => deleteMessage(message.id)}
                                  style={{ 
                                    fontSize: '13px', 
                                    color: '#ef4444', 
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    padding: '4px 8px',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  🗑 Delete
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing Indicators */}
                {Object.keys(currentTypingUsers).length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1s infinite' 
                      }}></div>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1s infinite 0.1s' 
                      }}></div>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#9ca3af', 
                        borderRadius: '50%', 
                        animation: 'bounce 1s infinite 0.2s' 
                      }}></div>
                    </div>
                    <span>
                      {Object.values(currentTypingUsers).join(', ')} {Object.keys(currentTypingUsers).length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                )}
              </div>
              
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Banner - Enhanced */}
            {replyingTo && replyingTo.user && (
              <div style={{ 
                padding: '12px 16px', 
                backgroundColor: '#f0f9ff', 
                borderTop: '1px solid #bae6fd',
                borderBottom: '1px solid #bae6fd'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', color: '#0369a1', fontWeight: 600 }}>
                        ↩ Replying to {getUserDisplayName(replyingTo.user)}
                      </span>
                    </div>
                    <div style={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e7ff',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      <p style={{ 
                        fontSize: '13px', 
                        color: '#64748b', 
                        margin: 0, 
                        fontStyle: 'italic',
                        lineHeight: '1.4',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        "{replyingTo.content || 'Message content unavailable'}"
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setReplyingTo(null)}
                    style={{ 
                      color: '#64748b', 
                      backgroundColor: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Edit Banner */}
            {editingMessage && (
              <div style={{ padding: '8px 16px', backgroundColor: '#fefce8', borderBottom: '1px solid #facc15' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#a16207' }}>Editing message</span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setMessageInput('');
                    }}
                    style={{ 
                      color: '#a16207', 
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

          {/* Message Input - Fixed at Bottom */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #e2e8f0', 
            backgroundColor: 'white',
            flexShrink: 0,
            marginTop: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '12px' // Increased from 8px to 12px for better spacing
            }}>
              <div style={{ flex: 1, minWidth: 0 }}> {/* Added minWidth: 0 */}
                <textarea
                  ref={messageInputRef}
                  value={messageInput}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    editingMessage 
                      ? 'Edit your message...' 
                      : `Message #${activeRoomData.name}`
                  }
                  style={{
                    width: '100%',
                    padding: '12px 16px', // Increased horizontal padding
                    border: '1px solid #d1d5db',
                    borderRadius: '12px', // Increased border radius for better look
                    resize: 'none',
                    minHeight: '44px', // Increased from 40px
                    maxHeight: '120px',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.5', // Added line height
                    boxSizing: 'border-box',
                    outline: 'none' // Remove default outline
                  }}
                  rows="1"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                style={{
                  padding: '12px 20px', // Increased padding to match textarea height
                  borderRadius: '12px', // Match textarea border radius
                  border: 'none',
                  cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                  backgroundColor: messageInput.trim() ? '#3b82f6' : '#e5e7eb',
                  color: messageInput.trim() ? 'white' : '#9ca3af',
                  fontSize: '14px',
                  fontWeight: 600, // Increased from 500
                  minHeight: '44px', // Ensure same height as textarea
                  display: 'flex', // Center content
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0, // Prevent shrinking
                  transition: 'all 0.2s ease' // Smooth transitions
                }}
              >
                Send
              </button>
            </div>
          </div>
          </>
        ) : (
          /* No Room Selected */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>#</div>
              <h3 style={{ fontSize: '18px', fontWeight: 500, color: '#1f2937', marginBottom: '8px' }}>Welcome to Project Chat</h3>
              <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                {chatRooms.length > 0 
                  ? 'Select a chat room to start messaging with your project team'
                  : 'Create your first chat room to get started'
                }
              </p>
              {chatRooms.length === 0 && (
                <button
                  onClick={() => setShowCreateRoom(true)}
                  style={{ 
                    padding: '8px 16px', 
                    backgroundColor: '#3b82f6', 
                    color: 'white', 
                    borderRadius: '8px', 
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Create Chat Room
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateRoom && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '24px', 
            width: '100%', 
            maxWidth: '448px',
            margin: '16px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', margin: '0 0 16px 0' }}>
              Create New Chat Room
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="e.g., General Discussion"
                  maxLength="50"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '80px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Optional description for the room..."
                  maxLength="200"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                  Room Type
                </label>
                <select
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="general">General</option>
                  <option value="development">Development</option>
                  <option value="announcements">Announcements</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setShowCreateRoom(false);
                  setNewRoomName('');
                  setNewRoomDescription('');
                  setNewRoomType('general');
                }}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  color: '#374151', 
                  backgroundColor: '#e5e7eb', 
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
                style={{ 
                  flex: 1, 
                  padding: '8px 16px', 
                  borderRadius: '8px',
                  border: 'none',
                  cursor: newRoomName.trim() ? 'pointer' : 'not-allowed',
                  backgroundColor: newRoomName.trim() ? '#3b82f6' : '#d1d5db',
                  color: newRoomName.trim() ? 'white' : '#9ca3af',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add CSS animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
          40%, 43% { transform: translateY(-30px); }
          70% { transform: translateY(-15px); }
          90% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;