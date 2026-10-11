const express = require('express');

const {
    getNotifications,
    markNotificationRead,
    submitFeedback,
    getBadges
} = require('../controllers/miscController');

const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/notifications',
    authenticateToken,
    getNotifications
);

router.put(
    '/notifications/:id/read',
    authenticateToken,
    markNotificationRead
);

router.post(
    '/feedback',
    authenticateToken,
    submitFeedback
);

router.get(
    '/badges',
    authenticateToken,
    getBadges
);

module.exports = router;