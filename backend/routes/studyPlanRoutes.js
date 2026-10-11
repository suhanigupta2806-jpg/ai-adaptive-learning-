const express = require('express');

const {
    createPlan,
    getCurrentPlan,
    getPlans,
    getTopics,
    completePlanTopic
} = require('../controllers/studyPlanController');

const authenticateToken =
    require('../middleware/authMiddleware');

const router =
    express.Router();


/* =========================================================
   GET CURRENT PERSONALIZED PLAN
========================================================= */

router.get(
    '/current',
    authenticateToken,
    getCurrentPlan
);


/* =========================================================
   MANUAL CREATE
========================================================= */

router.post(
    '/',
    authenticateToken,
    createPlan
);


/* =========================================================
   GET ALL PLANS
========================================================= */

router.get(
    '/',
    authenticateToken,
    getPlans
);


/* =========================================================
   GET PLAN TOPICS
========================================================= */

router.get(
    '/:planId/topics',
    authenticateToken,
    getTopics
);


/* =========================================================
   COMPLETE TOPIC
========================================================= */

router.put(
    '/topics/:planTopicId/complete',
    authenticateToken,
    completePlanTopic
);


module.exports = router;