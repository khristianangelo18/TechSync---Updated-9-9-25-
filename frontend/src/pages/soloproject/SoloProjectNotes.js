// frontend/src/pages/soloproject/SoloProjectNotes.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; // Removed unused import

function SoloProjectNotes() {
  const { projectId } = useParams();
  // const { user } = useAuth(); // Removed unused variable
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated_at');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [showCreateNote, setShowCreateNote] = useState(false);

  // Mock notes data - replace with API calls
  useEffect(() => {
    const mockNotes = [
      {
        id: 1,
        title: 'Project Requirements',
        content: 'Initial project requirements and specifications:\n\n• User authentication system\n• Dashboard with analytics\n• File management\n• Real-time notifications\n• Mobile responsive design',
        category: 'planning',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'API Design Notes',
        content: 'RESTful API endpoints:\n\nAuth:\n- POST /api/auth/login\n- POST /api/auth/register\n- POST /api/auth/refresh\n\nUsers:\n- GET /api/users/profile\n- PUT /api/users/profile\n\nProjects:\n- GET /api/projects\n- POST /api/projects\n- GET /api/projects/:id',
        category: 'development',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Learning Resources',
        content: 'Useful resources for this project:\n\n📚 Documentation:\n• React Hooks Guide\n• Node.js Best Practices\n• PostgreSQL Performance Tips\n\n🎥 Video Tutorials:\n• Advanced React Patterns\n• Database Optimization\n• Deployment Strategies',
        category: 'learning',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    setNotes(mockNotes);
    if (mockNotes.length > 0) {
      setSelectedNote(mockNotes[0]);
    }
  }, [projectId]);

  // Filter and sort notes
  const filteredAndSortedNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'updated_at':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at);
      }
    });

  const handleCreateNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const note = {
      id: Date.now(),
      ...newNote,
      created_at: new Date(),
      updated_at: new Date()
    };

    setNotes(prev => [note, ...prev]);
    setSelectedNote(note);
    setNewNote({ title: '', content: '', category: 'general' });
    setShowCreateNote(false);
  };

  const handleUpdateNote = () => {
    if (!selectedNote || !selectedNote.title.trim() || !selectedNote.content.trim()) return;

    setNotes(prev => prev.map(note => 
      note.id === selectedNote.id 
        ? { ...selectedNote, updated_at: new Date() }
        : note
    ));
    setIsEditing(false);
  };

  const handleDeleteNote = (noteId) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    if (selectedNote && selectedNote.id === noteId) {
      const remaining = notes.filter(note => note.id !== noteId);
      setSelectedNote(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'planning': return '📋';
      case 'development': return '💻';
      case 'learning': return '🎓';
      case 'research': return '🔍';
      case 'ideas': return '💡';
      case 'meeting': return '👥';
      default: return '📝';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'planning': return '#007bff';
      case 'development': return '#28a745';
      case 'learning': return '#6f42c1';
      case 'research': return '#fd7e14';
      case 'ideas': return '#ffc107';
      case 'meeting': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const styles = {
    container: {
      padding: '30px',
      maxWidth: '1400px',
      margin: '0 auto',
      height: 'calc(100vh - 60px)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      paddingBottom: '16px',
      borderBottom: '2px solid #e9ecef'
    },
    title: {
      color: '#333',
      fontSize: '28px',
      margin: 0,
      fontWeight: 'bold'
    },
    createButton: {
      backgroundColor: '#6f42c1',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '350px 1fr',
      gap: '24px',
      height: 'calc(100% - 100px)'
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    },
    sidebarHeader: {
      padding: '20px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa'
    },
    searchInput: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      marginBottom: '12px'
    },
    sortSelect: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: 'white'
    },
    notesList: {
      flex: 1,
      overflowY: 'auto'
    },
    noteItem: {
      padding: '16px 20px',
      borderBottom: '1px solid #f1f3f4',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    noteItemActive: {
      backgroundColor: '#6f42c1',
      color: 'white'
    },
    noteItemHover: {
      backgroundColor: '#f8f9fa'
    },
    noteItemTitle: {
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 8px 0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    noteItemMeta: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '12px',
      opacity: 0.8
    },
    categoryBadge: {
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: '500',
      color: 'white'
    },
    noteItemPreview: {
      fontSize: '13px',
      margin: '8px 0 0 0',
      opacity: 0.7,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    editor: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e9ecef',
      overflow: 'hidden'
    },
    editorHeader: {
      padding: '20px',
      borderBottom: '1px solid #e9ecef',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    editorTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0,
      flex: 1,
      minWidth: 0
    },
    editorActions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '8px 16px',
      border: '1px solid #dee2e6',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#6c757d',
      fontSize: '14px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    editButton: {
      backgroundColor: '#6f42c1',
      color: 'white',
      border: 'none'
    },
    saveButton: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none'
    },
    deleteButton: {
      backgroundColor: '#dc3545',
      color: 'white',
      border: 'none'
    },
    editorContent: {
      flex: 1,
      padding: '20px',
      overflow: 'auto'
    },
    titleInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px'
    },
    contentTextarea: {
      width: '100%',
      height: '400px',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.6',
      fontFamily: 'Monaco, Consolas, "Lucida Console", monospace',
      resize: 'none'
    },
    contentDisplay: {
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333',
      whiteSpace: 'pre-wrap'
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#6c757d',
      textAlign: 'center'
    },
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '20px',
      opacity: 0.5
    },
    emptyStateText: {
      fontSize: '18px',
      margin: '0 0 8px 0'
    },
    emptyStateSubtext: {
      fontSize: '14px',
      margin: 0
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '30px',
      width: '100%',
      maxWidth: '600px',
      margin: '20px'
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0 0 24px 0'
    },
    formGroup: {
      marginBottom: '20px'
    },
    formLabel: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#333',
      marginBottom: '8px'
    },
    formInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px'
    },
    formTextarea: {
      width: '100%',
      height: '200px',
      padding: '12px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      fontSize: '14px',
      resize: 'vertical'
    },
    formActions: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelButton: {
      padding: '12px 24px',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      backgroundColor: 'white',
      color: '#6c757d',
      fontSize: '14px',
      cursor: 'pointer'
    },
    submitButton: {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: '#6f42c1',
      color: 'white',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: '500'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Notes</h1>
        <button
          style={styles.createButton}
          onClick={() => setShowCreateNote(true)}
        >
          + New Note
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <input
              style={styles.searchInput}
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              style={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated_at">Last Modified</option>
              <option value="created_at">Date Created</option>
              <option value="title">Title</option>
            </select>
          </div>
          
          <div style={styles.notesList}>
            {filteredAndSortedNotes.map((note) => (
              <div
                key={note.id}
                style={{
                  ...styles.noteItem,
                  ...(selectedNote && selectedNote.id === note.id ? styles.noteItemActive : {})
                }}
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditing(false);
                }}
                onMouseEnter={(e) => {
                  if (!selectedNote || selectedNote.id !== note.id) {
                    Object.assign(e.currentTarget.style, styles.noteItemHover);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedNote || selectedNote.id !== note.id) {
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <h4 style={styles.noteItemTitle}>{note.title}</h4>
                <div style={styles.noteItemMeta}>
                  <span style={{
                    ...styles.categoryBadge,
                    backgroundColor: getCategoryColor(note.category)
                  }}>
                    {getCategoryIcon(note.category)} {note.category}
                  </span>
                  <span>{formatDate(note.updated_at)}</span>
                </div>
                <p style={styles.noteItemPreview}>
                  {note.content.substring(0, 60)}...
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div style={styles.editor}>
          {selectedNote ? (
            <>
              <div style={styles.editorHeader}>
                {isEditing ? (
                  <input
                    style={{...styles.titleInput, margin: 0, flex: 1, marginRight: '16px'}}
                    value={selectedNote.title}
                    onChange={(e) => setSelectedNote({
                      ...selectedNote,
                      title: e.target.value
                    })}
                  />
                ) : (
                  <h2 style={styles.editorTitle}>{selectedNote.title}</h2>
                )}
                
                <div style={styles.editorActions}>
                  {isEditing ? (
                    <>
                      <button
                        style={{...styles.actionButton, ...styles.saveButton}}
                        onClick={handleUpdateNote}
                      >
                        Save
                      </button>
                      <button
                        style={styles.actionButton}
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        style={{...styles.actionButton, ...styles.editButton}}
                        onClick={() => setIsEditing(true)}
                      >
                        Edit
                      </button>
                      <button
                        style={{...styles.actionButton, ...styles.deleteButton}}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this note?')) {
                            handleDeleteNote(selectedNote.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Editor Content */}
              <div style={styles.editorContent}>
                {isEditing ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.formLabel}>Category</label>
                      <select
                        style={styles.formInput}
                        value={selectedNote.category}
                        onChange={(e) => setSelectedNote({
                          ...selectedNote,
                          category: e.target.value
                        })}
                      >
                        <option value="general">General</option>
                        <option value="planning">Planning</option>
                        <option value="development">Development</option>
                        <option value="learning">Learning</option>
                        <option value="research">Research</option>
                        <option value="ideas">Ideas</option>
                        <option value="meeting">Meeting</option>
                      </select>
                    </div>
                    <textarea
                      style={styles.contentTextarea}
                      value={selectedNote.content}
                      onChange={(e) => setSelectedNote({
                        ...selectedNote,
                        content: e.target.value
                      })}
                      placeholder="Write your note content here..."
                    />
                  </>
                ) : (
                  <div style={styles.contentDisplay}>{selectedNote.content}</div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📝</div>
              <div style={styles.emptyStateText}>No note selected</div>
              <div style={styles.emptyStateSubtext}>Choose a note from the sidebar to view it here</div>
            </div>
          )}
        </div>
      </div>

      {/* Create Note Modal */}
      {showCreateNote && (
        <div style={styles.modal} onClick={() => setShowCreateNote(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Note</h2>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Title *</label>
              <input
                style={styles.formInput}
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                placeholder="Enter note title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Category</label>
              <select
                style={styles.formInput}
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="planning">Planning</option>
                <option value="development">Development</option>
                <option value="learning">Learning</option>
                <option value="research">Research</option>
                <option value="ideas">Ideas</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Content *</label>
              <textarea
                style={styles.formTextarea}
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Write your note content here..."
              />
            </div>

            <div style={styles.formActions}>
              <button
                style={styles.cancelButton}
                onClick={() => setShowCreateNote(false)}
              >
                Cancel
              </button>
              <button
                style={styles.submitButton}
                onClick={handleCreateNote}
                disabled={!newNote.title.trim() || !newNote.content.trim()}
              >
                Create Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SoloProjectNotes;