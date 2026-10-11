const express = require('express');

const {
    getChallenges,
    completeChallenge
} = require('../controllers/challengeController');

const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/daily',
    authenticateToken,
    getChallenges
);

router.post(
    '/:challengeId/complete',
    authenticateToken,
    completeChallenge
);

module.exports = router;