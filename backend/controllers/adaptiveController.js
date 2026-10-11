const {
    getAdaptiveQuestions
} = require('../models/adaptiveModel');


// ============================================================
// ADAPTIVE QUIZ QUESTIONS
// ============================================================

const getAdaptiveQuizQuestions = async (
    req,
    res
) => {

    try {

        const studentId =
            req.student.student_id;

        const examId =
            Number(req.params.examId);

        const limit =
            Math.min(
                Math.max(
                    Number(req.query.limit) || 10,
                    1
                ),
                30
            );


        if (
            !examId ||
            examId <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Valid exam ID is required'

            });
        }


        const result =
            await getAdaptiveQuestions(
                studentId,
                examId,
                limit
            );


        if (
            result.questions.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    'No questions available for adaptive quiz'

            });
        }


        res.json({

            success: true,

            exam_id:
                examId,

            total_questions:
                result.questions.length,

            strategy:
                result.strategy,

            focused_topics:
                result.focused_topics,

            questions:
                result.questions

        });


    } catch (error) {

        console.error(
            'Adaptive quiz error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Failed to generate adaptive quiz',

            error:
                error.message

        });
    }
};


module.exports = {
    getAdaptiveQuizQuestions
};