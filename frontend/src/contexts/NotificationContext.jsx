import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Fetch unread count on mount and periodically
    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Refresh unread count every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            setUnreadCount(response.unread_count || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async (params = {}) => {
        try {
            setLoading(true);
            const response = await notificationService.getCommentNotifications(params);
            setNotifications(response.notifications || []);
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationIds) => {
        try {
            await notificationService.markNotificationsRead(notificationIds);
            
            // Update local state
            setNotifications(prev => 
                prev.map(notif => 
                    notificationIds.includes(notif.id) 
                        ? { ...notif, is_read: true }
                        : notif
                )
            );
            
            // Update unread count
            setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadIds = notifications
                .filter(notif => !notif.is_read)
                .map(notif => notif.id);
            
            if (unreadIds.length > 0) {
                await markAsRead(unreadIds);
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    };

    const value = {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        fetchUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};