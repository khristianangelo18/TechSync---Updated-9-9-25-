// frontend/src/pages/soloproject/SoloProjectNotes.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SoloProjectService from '../../services/soloProjectService';

function SoloProjectNotes() {
  const { projectId } = useParams();

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notes from API (debounced for search)
  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(async () => {
        setLoading(true);
        setError(null);
        try {
        const filters = {
            sort_by: sortBy,
            sort_order: sortBy === 'title' ? 'asc' : 'desc'
        };
        if (searchTerm.trim()) filters.search = searchTerm.trim();

        const res = await SoloProjectService.getNotes(projectId, filters);
        const apiNotes =
            res?.data?.data?.notes ||
            res?.data?.notes ||
            [];

        if (!isMounted) return;

        setNotes(apiNotes);

        // Keep selection valid without referencing selectedNote from the closure
        setSelectedNote(prev => {
            const stillExists = prev && apiNotes.some(n => n.id === prev.id);
            if (stillExists) return prev;
            // If previous selection is gone or was null, pick the first note
            setIsEditing(false);
            return apiNotes[0] || null;
        });
        } catch (err) {
        if (isMounted) {
            setError(err?.response?.data?.message || 'Failed to load notes');
        }
        } finally {
        if (isMounted) setLoading(false);
        }
    }, 300);

    return () => {
        isMounted = false;
        clearTimeout(timeout);
    };
    }, [projectId, searchTerm, sortBy]); // selectedNote no longer needed here

  // Server-sorted/filtered list
  const filteredAndSortedNotes = notes;

  const handleCreateNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    // Optional client-side validation
    const { isValid, errors } = SoloProjectService.validateNoteData(newNote);
    if (!isValid) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const res = await SoloProjectService.createNote(projectId, {
        title: newNote.title,
        content: newNote.content,
        category: newNote.category
      });

      const created =
        res?.data?.data?.note ||
        res?.data?.note;

      if (created) {
        setNotes(prev => [created, ...prev]);
        setSelectedNote(created);
      }

      setNewNote({ title: '', content: '', category: 'general' });
      setShowCreateNote(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async () => {
    if (!selectedNote || !selectedNote.title.trim() || !selectedNote.content.trim()) return;

    // Optional validation
    const { isValid, errors } = SoloProjectService.validateNoteData({
      title: selectedNote.title,
      content: selectedNote.content,
      category: selectedNote.category
    });
    if (!isValid) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const res = await SoloProjectService.updateNote(
        projectId,
        selectedNote.id,
        {
          title: selectedNote.title,
          content: selectedNote.content,
          category: selectedNote.category
        }
      );

      const updated =
        res?.data?.data?.note ||
        res?.data?.note;

      if (updated) {
        setNotes(prev => prev.map(n => (n.id === updated.id ? updated : n)));
        setSelectedNote(updated);
      }
      setIsEditing(false);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await SoloProjectService.deleteNote(projectId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
      if (selectedNote && selectedNote.id === noteId) {
        const remaining = notes.filter(n => n.id !== noteId);
        setSelectedNote(remaining[0] || null);
        setIsEditing(false);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete note');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Align with backend allowed categories: general, planning, development, learning, ideas, bugs
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'planning': return '📋';
      case 'development': return '💻';
      case 'learning': return '📚';
      case 'ideas': return '💡';
      case 'bugs': return '🐛';
      case 'general':
      default: return '📝';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'planning': return '#007bff';
      case 'development': return '#28a745';
      case 'learning': return '#6f42c1';
      case 'ideas': return '#ffc107';
      case 'bugs': return '#dc3545';
      case 'general':
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
    error: {
      backgroundColor: '#fff3f3',
      border: '1px solid #f5c2c7',
      color: '#842029',
      padding: '10px 14px',
      borderRadius: '8px',
      marginBottom: '16px'
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

      {/* Error */}
      {error && <div style={styles.error}>⚠️ {error}</div>}

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
            {loading && filteredAndSortedNotes.length === 0 ? (
              <div style={{ padding: '16px 20px', color: '#6c757d' }}>Loading notes...</div>
            ) : filteredAndSortedNotes.length === 0 ? (
              <div style={{ padding: '16px 20px', color: '#6c757d' }}>No notes found</div>
            ) : (
              filteredAndSortedNotes.map((note) => (
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
                    {(note.content || '').substring(0, 60)}...
                  </p>
                </div>
              ))
            )}
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
                        <option value="ideas">Ideas</option>
                        <option value="bugs">Bugs</option>
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
                <option value="ideas">Ideas</option>
                <option value="bugs">Bugs</option>
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