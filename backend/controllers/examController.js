const {
    getAllExams,
    getExamById,
    getSubjectsByExam,
    getTopicsBySubject
} = require('../models/examModel');

const getExams = async (req, res) => {
    try {
        const exams = await getAllExams();

        res.json({
            success: true,
            exams
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exams',
            error: error.message
        });
    }
};

const getExam = async (req, res) => {
    try {
        const exam = await getExamById(req.params.id);

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        res.json({
            success: true,
            exam
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch exam',
            error: error.message
        });
    }
};

const getExamSubjects = async (req, res) => {
    try {
        const subjects = await getSubjectsByExam(req.params.id);

        res.json({
            success: true,
            exam_id: Number(req.params.id),
            subjects
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subjects',
            error: error.message
        });
    }
};

const getSubjectTopics = async (req, res) => {
    try {
        const topics = await getTopicsBySubject(req.params.id);

        res.json({
            success: true,
            subject_id: Number(req.params.id),
            topics
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch topics',
            error: error.message
        });
    }
};

module.exports = {
    getExams,
    getExam,
    getExamSubjects,
    getSubjectTopics
};