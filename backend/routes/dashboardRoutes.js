const express = require('express');

const {
    getDashboard,
    getWeakTopicsController,
    getPerformanceAnalysisController
} = require('../controllers/dashboardController');

const authenticateToken =
    require('../middleware/authMiddleware');

const router =
    express.Router();


// ============================================================
// COMPLETE DASHBOARD
// ============================================================

router.get(
    '/',
    authenticateToken,
    getDashboard
);


// ============================================================
// WEAK TOPICS
// ============================================================

router.get(
    '/weak-topics',
    authenticateToken,
    getWeakTopicsController
);


// ============================================================
// PERFORMANCE ANALYSIS
// ============================================================

router.get(
    '/performance',
    authenticateToken,
    getPerformanceAnalysisController
);


module.exports = router;