const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notificationsController');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticateToken);

// Get comment notifications
router.get('/comments', notificationsController.getCommentNotifications);

// Mark notifications as read
router.put('/read', notificationsController.markNotificationsRead);

// Get unread count
router.get('/unread-count', notificationsController.getUnreadCount);

module.exports = router;