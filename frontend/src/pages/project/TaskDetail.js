import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { taskService } from '../../services/taskService';
import { projectService } from '../../services/projectService';
import CommentsContainer from '../../components/Comments/CommentsContainer';

const TaskDetail = () => {
    const { projectId, taskId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [task, setTask] = useState(null);
    const [project, setProject] = useState(null);
    const [projectMembers, setProjectMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});

    // Use useCallback to fix dependency warnings
    const fetchTaskData = useCallback(async () => {
        try {
            const response = await taskService.getTask(projectId, taskId);
            setTask(response.data.task);
            setEditForm(response.data.task);
        } catch (error) {
            console.error('Error fetching task:', error);
            setError('Failed to load task details');
        }
    }, [projectId, taskId]);

    const fetchProjectData = useCallback(async () => {
        try {
            // Fetch project details
            const projectResponse = await projectService.getProjectById(projectId);
            setProject(projectResponse.data.project);

            // Fetch project members 
            try {
                const membersResponse = await projectService.getProjectMembers(projectId);
                setProjectMembers(membersResponse.data.members || []);
            } catch (memberError) {
                console.log('Could not fetch project members:', memberError);
                setProjectMembers([]);
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            setError('Failed to load project details');
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId && taskId) {
            fetchTaskData();
            fetchProjectData();
        }
    }, [projectId, taskId, fetchTaskData, fetchProjectData]);

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await taskService.updateTask(projectId, taskId, editForm);
            setTask(response.data.task);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating task:', error);
            alert('Failed to update task');
        }
    };

  const handleStatusChange = async (newStatus) => {
    try {
        console.log('🔄 Updating task status to:', newStatus);
        
        const response = await taskService.updateTask(projectId, taskId, {
            status: newStatus
        });

        if (response && response.data && response.data.task) {
            setTask(response.data.task);
            console.log('✅ Task status updated successfully');
        }

    } catch (error) {
        console.error('💥 Error updating status:', error);
        alert(`Failed to update status: ${error.response?.data?.message || error.message}`);
    }
};


    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status) => {
        const colors = {
            'todo': '#6c757d',
            'in_progress': '#007bff',
            'in_review': '#ffc107',
            'completed': '#28a745',
            'blocked': '#dc3545'
        };
        return colors[status] || '#6c757d';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'low': '#28a745',
            'medium': '#ffc107',
            'high': '#fd7e14',
            'urgent': '#dc3545'
        };
        return colors[priority] || '#6c757d';
    };

    const canEdit = project && (
        project.owner_id === user.id || 
        projectMembers.some(member => 
            member.user_id === user.id && ['lead', 'moderator'].includes(member.role)
        )
    );

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <h2>Loading task details...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate(`/project/${projectId}/tasks`)}>
                    Back to Tasks
                </button>
            </div>
        );
    }

    if (!task) {
        return (
            <div style={styles.errorContainer}>
                <h2>Task not found</h2>
                <button onClick={() => navigate(`/project/${projectId}/tasks`)}>
                    Back to Tasks
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button 
                    onClick={() => navigate(`/project/${projectId}/tasks`)}
                    style={styles.backButton}
                >
                    ← Back to Tasks
                </button>
                {canEdit && (
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        style={styles.editButton}
                    >
                        {isEditing ? 'Cancel' : 'Edit Task'}
                    </button>
                )}
            </div>

            <div style={styles.content}>
                {/* Task Details Section */}
                <div style={styles.taskSection}>
                    {isEditing ? (
                        <form onSubmit={handleEditSubmit} style={styles.editForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Title:</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                    style={styles.input}
                                    required
                                />
                            </div>
                            
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Description:</label>
                                <textarea
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                    style={styles.textarea}
                                    rows="4"
                                />
                            </div>

                            <div style={styles.formRow}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Status:</label>
                                    <select
                                        value={editForm.status || ''}
                                        onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                        style={styles.select}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="in_review">In Review</option>
                                        <option value="completed">Completed</option>
                                        <option value="blocked">Blocked</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Priority:</label>
                                    <select
                                        value={editForm.priority || ''}
                                        onChange={(e) => setEditForm({...editForm, priority: e.target.value})}
                                        style={styles.select}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div style={styles.formActions}>
                                <button type="submit" style={styles.saveButton}>
                                    Save Changes
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    style={styles.cancelButton}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div style={styles.taskDetails}>
                            <h1 style={styles.title}>{task.title}</h1>
                            
                            <div style={styles.metaInfo}>
                                <div style={styles.badges}>
                                    <span 
                                        style={{
                                            ...styles.badge,
                                            backgroundColor: getStatusColor(task.status),
                                            color: 'white'
                                        }}
                                    >
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                    <span 
                                        style={{
                                            ...styles.badge,
                                            backgroundColor: getPriorityColor(task.priority),
                                            color: 'white'
                                        }}
                                    >
                                        {task.priority.toUpperCase()} PRIORITY
                                    </span>
                                </div>

                                {/* Quick Status Change Buttons */}
                                {canEdit && (
                                    <div style={styles.statusButtons}>
                                        {['todo', 'in_progress', 'in_review', 'completed'].map(status => (
                                            task.status !== status && (
                                                <button
                                                    key={status}
                                                    onClick={() => handleStatusChange(status)}
                                                    style={{
                                                        ...styles.statusButton,
                                                        backgroundColor: getStatusColor(status)
                                                    }}
                                                >
                                                    Mark as {status.replace('_', ' ')}
                                                </button>
                                            )
                                        ))}
                                    </div>
                                )}
                            </div>

                            {task.description && (
                                <div style={styles.description}>
                                    <h3>Description</h3>
                                    <p style={styles.descriptionText}>{task.description}</p>
                                </div>
                            )}

                            <div style={styles.taskMeta}>
                                <div style={styles.metaItem}>
                                    <strong>Task Type:</strong> {task.task_type || 'Development'}
                                </div>
                                <div style={styles.metaItem}>
                                    <strong>Created:</strong> {formatDate(task.created_at)}
                                </div>
                                {task.due_date && (
                                    <div style={styles.metaItem}>
                                        <strong>Due Date:</strong> {formatDate(task.due_date)}
                                    </div>
                                )}
                                {task.estimated_hours && (
                                    <div style={styles.metaItem}>
                                        <strong>Estimated Hours:</strong> {task.estimated_hours}
                                    </div>
                                )}
                                {task.assigned_user && (
                                    <div style={styles.metaItem}>
                                        <strong>Assigned to:</strong> {task.assigned_user.full_name}
                                    </div>
                                )}
                                {task.creator && (
                                    <div style={styles.metaItem}>
                                        <strong>Created by:</strong> {task.creator.full_name}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Comments Section */}
                <div style={styles.commentsSection}>
                    <CommentsContainer 
                        taskId={taskId}
                        projectMembers={projectMembers}
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e1e5e9'
    },
    backButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    editButton: {
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    content: {
        display: 'grid',
        gap: '32px'
    },
    taskSection: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #e1e5e9',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    commentsSection: {
        // Comments container will have its own styling
    },
    title: {
        fontSize: '32px',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 16px 0'
    },
    metaInfo: {
        marginBottom: '24px'
    },
    badges: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px'
    },
    badge: {
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    statusButtons: {
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap'
    },
    statusButton: {
        color: 'white',
        border: 'none',
        padding: '6px 12px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500'
    },
    description: {
        marginBottom: '24px'
    },
    descriptionText: {
        lineHeight: '1.6',
        color: '#495057',
        fontSize: '16px',
        whiteSpace: 'pre-wrap'
    },
    taskMeta: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '12px',
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px'
    },
    metaItem: {
        fontSize: '14px',
        color: '#495057'
    },
    // Edit form styles
    editForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column'
    },
    formRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
    },
    label: {
        marginBottom: '5px',
        fontWeight: '500',
        color: '#333'
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    textarea: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        resize: 'vertical',
        minHeight: '100px'
    },
    select: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px'
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end'
    },
    saveButton: {
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    cancelButton: {
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '60px',
        color: '#6c757d'
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px',
        color: '#dc3545'
    }
};

export default TaskDetail;