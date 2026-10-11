const express = require('express');


const {
    getQuizQuestions,
    getMockTestQuestions,
    submitQuizResult
} = require('../controllers/quizController');


const {
    syncQuizResult
} = require('../controllers/quizSyncController');


const authenticateToken =
    require('../middleware/authMiddleware');


const router =
    express.Router();


// ============================================================
// GET QUESTIONS FOR A TOPIC
// ============================================================

router.get(
    '/topic/:topicId',
    getQuizQuestions
);


// ============================================================
// GET MOCK TEST QUESTIONS FOR AN EXAM
// ============================================================

router.get(
    '/mock-test/:examId',
    authenticateToken,
    getMockTestQuestions
);


// ============================================================
// SUBMIT QUIZ / MOCK TEST
// ============================================================

router.post(
    '/submit',
    authenticateToken,
    submitQuizResult
);


// ============================================================
// EXISTING QUIZ RESULT SYNC
// ============================================================

router.post(
    '/sync-result',
    authenticateToken,
    syncQuizResult
);


module.exports = router;