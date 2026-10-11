const {
    getQuestionsByTopic,
    getMockTestQuestions,
    submitQuiz
} = require('../models/quizModel');


// ============================================================
// GET QUIZ QUESTIONS BY TOPIC
// ============================================================

const getQuizQuestions = async (req, res) => {

    try {

        const topicId =
            Number(req.params.topicId);

        const limit =
            Number(req.query.limit) || 10;


        if (
            !Number.isInteger(topicId) ||
            topicId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: 'Valid topic ID is required'
            });

        }


        const questions =
            await getQuestionsByTopic(
                topicId,
                limit
            );


        if (questions.length === 0) {

            return res.status(404).json({
                success: false,
                message:
                    'No questions found for this topic'
            });

        }


        res.json({
            success: true,
            topic_id: topicId,
            total_questions: questions.length,
            questions
        });

    }

    catch (error) {

        console.error(
            'Quiz questions error:',
            error
        );


        res.status(500).json({
            success: false,
            message:
                error.message ||
                'Failed to fetch quiz questions'
        });

    }

};


// ============================================================
// GET MOCK TEST QUESTIONS
// ============================================================

const getMockTestQuestionsController =
    async (req, res) => {

        try {

            const examId =
                Number(req.params.examId);

            const limit =
                Number(req.query.limit) || 20;


            if (
                !Number.isInteger(examId) ||
                examId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Valid exam ID is required'
                });

            }


            const questions =
                await getMockTestQuestions(
                    examId,
                    limit
                );


            if (questions.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        'No questions are available for this exam'
                });

            }


            res.json({
                success: true,
                exam_id: examId,
                total_questions: questions.length,
                questions
            });

        }

        catch (error) {

            console.error(
                'Mock test questions error:',
                error
            );


            res.status(500).json({
                success: false,
                message:
                    error.message ||
                    'Failed to fetch mock test questions'
            });

        }

    };


// ============================================================
// SUBMIT MOCK TEST
// ============================================================

const submitQuizResult = async (req, res) => {

    try {

        // IMPORTANT:
        // authMiddleware stores the logged-in user
        // in req.student

        const studentId =
            req.student.student_id;


        const examId =
            Number(req.body.exam_id);


        const answers =
            req.body.answers;


        if (
            !Number.isInteger(examId) ||
            examId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Valid exam ID is required'
            });

        }


        if (
            !Array.isArray(answers) ||
            answers.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Quiz answers are required'
            });

        }


        /*
         * DO NOT pass started_at from the browser.
         *
         * MySQL's quiz_attempts.started_at already has
         * DEFAULT CURRENT_TIMESTAMP.
         *
         * This avoids DATETIME/ISO timestamp problems.
         */

        const result =
            await submitQuiz({
                studentId,
                examId,
                answers
            });


        res.json({

            success: true,

            message:
                'Mock test submitted successfully',

            result

        });

    }

    catch (error) {

        console.error(
            'Quiz submission error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message ||
                'Failed to submit mock test',

            error:
                error.message

        });

    }

};


module.exports = {

    getQuizQuestions,

    getMockTestQuestions:
        getMockTestQuestionsController,

    submitQuizResult

};