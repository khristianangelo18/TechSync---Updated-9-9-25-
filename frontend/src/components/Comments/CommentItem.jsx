import React, { useState } from 'react';
import CommentReplies from './CommentReplies';
import MentionInput from './MentionInput';

const CommentItem = ({ 
    comment, 
    projectMembers, 
    currentUser, 
    onCommentUpdated, 
    onCommentDeleted,
    isReply = false 
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showReplies, setShowReplies] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const isAuthor = comment.author.id === currentUser.id;
    const canDelete = isAuthor || hasDeletePermissions();

    function hasDeletePermissions() {
        // Check if current user is project lead or owner
        const userMember = projectMembers.find(m => m.user_id === currentUser.id);
        return userMember && ['lead', 'owner'].includes(userMember.role);
    }

    const formatTimeAgo = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffInSeconds = Math.floor((now - commentDate) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return commentDate.toLocaleDateString();
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleEditSubmit = async (content, mentions) => {
        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content: content.trim(),
                    mentions
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update comment');
            }

            onCommentUpdated(data.comment);
            setIsEditing(false);

        } catch (error) {
            console.error('Error updating comment:', error);
            alert('Failed to update comment. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true);
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/comments/${comment.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete comment');
            }

            onCommentDeleted(comment.id);

        } catch (error) {
            console.error('Error deleting comment:', error);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    const renderContent = () => {
        if (!comment.content) return '';

        // Simple mention highlighting
        return comment.content.replace(
            /@([A-Za-z\s]+)/g,
            '<span class="mention">@$1</span>'
        );
    };

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    return (
        <div className={`comment-item ${isReply ? 'comment-reply' : ''}`}>
            <div className="comment-header">
                <div className="comment-author">
                    <div className="author-avatar">
                        {comment.author.avatar_url ? (
                            <img src={comment.author.avatar_url} alt="" />
                        ) : (
                            <div className="avatar-placeholder">
                                {comment.author.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                        )}
                    </div>
                    <div className="author-info">
                        <span className="author-name">
                            {comment.author.full_name}
                        </span>
                        <span className="comment-time">
                            {formatTimeAgo(comment.created_at)}
                            {comment.is_edited && <span className="edited-indicator">(edited)</span>}
                        </span>
                    </div>
                </div>

                <div className="comment-actions">
                    {isAuthor && (
                        <button
                            onClick={handleEdit}
                            disabled={isEditing}
                            className="action-btn"
                            title="Edit comment"
                        >
                            ✏️
                        </button>
                    )}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className={`action-btn ${showDeleteConfirm ? 'confirm-delete' : ''}`}
                            title={showDeleteConfirm ? 'Click again to confirm' : 'Delete comment'}
                        >
                            {isDeleting ? '⏳' : '🗑️'}
                        </button>
                    )}
                    {showDeleteConfirm && (
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className="action-btn cancel-delete"
                            title="Cancel delete"
                        >
                            ❌
                        </button>
                    )}
                </div>
            </div>

            <div className="comment-content">
                {isEditing ? (
                    <EditCommentForm
                        initialContent={comment.content}
                        projectMembers={projectMembers}
                        onSubmit={handleEditSubmit}
                        onCancel={handleCancelEdit}
                    />
                ) : (
                    <div 
                        className="comment-text"
                        dangerouslySetInnerHTML={{ __html: renderContent() }}
                    />
                )}
            </div>

            {!isReply && (
                <div className="comment-footer">
                    <button
                        onClick={() => setShowReplyForm(!showReplyForm)}
                        className="reply-btn"
                    >
                        💬 Reply
                    </button>
                    
                    {comment.reply_count > 0 && (
                        <button
                            onClick={toggleReplies}
                            className="view-replies-btn"
                        >
                            {showReplies ? 'Hide' : 'View'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
                        </button>
                    )}
                </div>
            )}

            {showReplies && !isReply && (
                <CommentReplies
                    parentCommentId={comment.id}
                    taskId={comment.task_id}
                    projectMembers={projectMembers}
                    currentUser={currentUser}
                    onCommentUpdated={onCommentUpdated}
                    onCommentDeleted={onCommentDeleted}
                    showReplyForm={showReplyForm}
                    onReplyFormToggle={setShowReplyForm}
                />
            )}
        </div>
    );
};

// Edit Comment Form Component
const EditCommentForm = ({ initialContent, projectMembers, onSubmit, onCancel }) => {
    const [content, setContent] = useState(initialContent);
    const [mentions, setMentions] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(content, mentions);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="edit-comment-form">
            <MentionInput
                value={content}
                onChange={setContent}
                onMentionsChange={setMentions}
                projectMembers={projectMembers}
                placeholder="Edit your comment..."
                disabled={isSubmitting}
            />
            <div className="edit-form-actions">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="btn-text"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="btn-primary"
                >
                    {isSubmitting ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default CommentItem;