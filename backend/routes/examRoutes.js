const express = require('express');

const {
    getExams,
    getExam,
    getExamSubjects,
    getSubjectTopics
} = require('../controllers/examController');

const router = express.Router();

router.get('/', getExams);

router.get('/:id/subjects', getExamSubjects);

router.get('/subjects/:id/topics', getSubjectTopics);

router.get('/:id', getExam);

module.exports = router;