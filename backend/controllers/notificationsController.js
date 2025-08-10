const { supabase } = require('../config/supabase');

class NotificationsController {
    // Get user's comment notifications
    async getCommentNotifications(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 20, unread_only = false } = req.query;

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
                            project:projects!project_id(name)
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

            res.json({ notifications });

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

            res.json({ success: true });

        } catch (error) {
            console.error('Error in markNotificationsRead:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get unread count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user.id;

            const { count, error } = await supabase
                .from('comment_notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error fetching unread count:', error);
                return res.status(500).json({ error: 'Failed to fetch unread count' });
            }

            res.json({ unread_count: count });

        } catch (error) {
            console.error('Error in getUnreadCount:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new NotificationsController();