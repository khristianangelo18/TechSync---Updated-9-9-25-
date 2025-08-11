class NotificationService {
    constructor() {
        this.baseURL = '/api/notifications';
    }

    async getCommentNotifications(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.unread_only) queryParams.append('unread_only', params.unread_only);

            const response = await fetch(`${this.baseURL}/comments?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    async markNotificationsRead(notificationIds) {
        try {
            const response = await fetch(`${this.baseURL}/read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    notification_ids: notificationIds
                })
            });

            if (!response.ok) {
                throw new Error('Failed to mark notifications as read');
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }

    async getUnreadCount() {
        try {
            const response = await fetch(`${this.baseURL}/unread-count`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch unread count');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }

    // NEW: Delete notification
    async deleteNotification(notificationId) {
        try {
            const response = await fetch(`${this.baseURL}/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete notification');
            }

            return await response.json();
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }
    }

    // NEW: Mark single notification as read
    async markSingleNotificationRead(notificationId) {
        return this.markNotificationsRead([notificationId]);
    }
}

export const notificationService = new NotificationService();