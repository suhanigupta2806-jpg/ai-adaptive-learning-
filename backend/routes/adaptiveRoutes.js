const express = require('express');

const {
    getAdaptiveQuizQuestions
} = require('../controllers/adaptiveController');

const authenticateToken =
    require('../middleware/authMiddleware');

const router =
    express.Router();


// ============================================================
// ADAPTIVE QUESTIONS
// ============================================================

router.get(
    '/:examId',
    authenticateToken,
    getAdaptiveQuizQuestions
);


module.exports = router;