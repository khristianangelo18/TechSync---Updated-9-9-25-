const supabase = require('../config/supabase'); // Remove the destructuring

class NotificationsController {
    // Get user's comment notifications
    async getCommentNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, unread_only = false } = req.query;

            console.log('Fetching notifications for user:', userId);

            let query = supabase
                .from('comment_notifications')
                .select(`
                    *,
                    comment:task_comments!inner(
                        id,
                        content,
                        task_id,
                        author:users!user_id(full_name),
                        task:project_tasks!task_id(
                            id,
                            title,
                            project:projects!project_id(id, name)
                        )
                    )
                `)
                .eq('user_id', userId);

            if (unread_only === 'true') {
                query = query.eq('is_read', false);
            }

            const { data: notifications, error } = await query
                .order('created_at', { ascending: false })
                .range((page - 1) * limit, page * limit - 1);

            if (error) {
                console.error('Error fetching notifications:', error);
                return res.status(500).json({ error: 'Failed to fetch notifications' });
            }

            console.log('Successfully fetched', notifications?.length || 0, 'notifications');
            res.json({ notifications: notifications || [] });

        } catch (error) {
            console.error('Error in getCommentNotifications:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Mark notifications as read
    async markNotificationsRead(req, res) {
        try {
            const userId = req.user.id;
            const { notification_ids } = req.body;

            console.log('Marking notifications as read for user:', userId, 'IDs:', notification_ids);

            if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
                return res.status(400).json({ error: 'Invalid notification IDs' });
            }

            const { error } = await supabase
                .from('comment_notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .in('id', notification_ids);

            if (error) {
                console.error('Error marking notifications as read:', error);
                return res.status(500).json({ error: 'Failed to update notifications' });
            }

            console.log('Successfully marked', notification_ids.length, 'notifications as read');
            res.json({ success: true });

        } catch (error) {
            console.error('Error in markNotificationsRead:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get unread count - FIXED VERSION
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;

            console.log('Fetching unread count for user:', userId);
            console.log('Supabase client available:', !!supabase);
            console.log('Supabase.from method available:', typeof supabase.from);

            // Use a simpler approach for counting
            const { data, error } = await supabase
                .from('comment_notifications')
                .select('id')
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error fetching unread count:', error);
                return res.status(500).json({ error: 'Failed to fetch unread count' });
            }

            const unreadCount = data ? data.length : 0;
            console.log('Unread count for user', userId, ':', unreadCount);

            res.json({ unread_count: unreadCount });

        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Optional: Delete notification
    async deleteNotification(req, res) {
        try {
            const { notificationId } = req.params;
            const userId = req.user.id;

            console.log('Deleting notification:', notificationId, 'for user:', userId);

            const { error } = await supabase
                .from('comment_notifications')
                .delete()
                .eq('id', notificationId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting notification:', error);
                return res.status(500).json({ error: 'Failed to delete notification' });
            }

            console.log('Successfully deleted notification:', notificationId);
            res.json({ success: true });

        } catch (error) {
            console.error('Error in deleteNotification:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new NotificationsController();