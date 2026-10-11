const {
    getDailyChallenges,
    completeChallenge
} = require('../models/challengeModel');


// ==========================================================
// GET DAILY CHALLENGE
// GET /api/challenges/daily
// ==========================================================

const getChallenges = async (
    req,
    res
) => {

    try {

        const studentId =
            req.student.student_id;


        /*
         * The frontend can send:
         *
         * ?exam_id=1
         *
         * ESIC UDC = 1
         * OICL Assistant = 2
         * NIACL Assistant = 3
         *
         * Default = ESIC UDC
         */
        const examId =
            Number(
                req.query.exam_id || 1
            );


        if (
            !Number.isInteger(examId) ||
            examId <= 0
        ) {

            return res.status(400).json({
                success: false,
                message:
                    'Invalid exam ID.'
            });

        }


        const challenges =
            await getDailyChallenges(
                studentId,
                examId
            );


        if (
            !challenges ||
            challenges.length === 0
        ) {

            return res.json({
                success: true,

                completed_today: true,

                message:
                    'You have completed today\'s available challenge. Come back tomorrow!',

                challenges: []
            });

        }


        const challenge =
            challenges[0];


        // Do NOT send the correct answer
        // to the browser.
        if (
            challenge.options
        ) {

            challenge.options =
                challenge.options.map(
                    option => ({
                        option_id:
                            option.option_id,

                        option_text:
                            option.option_text
                    })
                );

        }


        res.json({
            success: true,

            completed_today: false,

            challenge
        });

    } catch (error) {

        console.error(
            'Get daily challenge error:',
            error
        );


        res.status(500).json({
            success: false,

            message:
                'Failed to fetch daily challenge',

            error:
                error.message
        });

    }

};


// ==========================================================
// COMPLETE DAILY CHALLENGE
// POST /api/challenges/:challengeId/complete
// ==========================================================

const completeChallengeController =
    async (
        req,
        res
    ) => {

        try {

            const studentId =
                req.student.student_id;


            const challengeId =
                Number(
                    req.params.challengeId
                );


            const {
                question_id,
                option_id,
                proof
            } = req.body;


            if (
                !Number.isInteger(
                    challengeId
                ) ||
                challengeId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Invalid challenge ID.'
                });

            }


            const questionId =
                Number(
                    question_id
                );


            const optionId =
                Number(
                    option_id
                );


            if (
                !Number.isInteger(
                    questionId
                ) ||
                questionId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Question is required.'
                });

            }


            if (
                !Number.isInteger(
                    optionId
                ) ||
                optionId <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        'Please select an answer.'
                });

            }


            const result =
                await completeChallenge(
                    studentId,
                    challengeId,
                    questionId,
                    optionId,
                    proof || ''
                );


            // Wrong answer
            if (
                result.correct === false
            ) {

                return res.status(200).json({
                    success: false,

                    correct: false,

                    message:
                        result.message,

                    correct_answer:
                        result.correct_answer,

                    explanation:
                        result.explanation
                });

            }


            res.json({
                success: true,

                correct: true,

                message:
                    result.message,

                xp_earned:
                    result.xp_earned,

                total_xp:
                    result.total_xp,

                current_streak:
                    result.current_streak,

                longest_streak:
                    result.longest_streak,

                earned_badges:
                    result.earned_badges,

                challenge_title:
                    result.challenge_title
            });

        } catch (error) {

            console.error(
                'Complete daily challenge error:',
                error
            );


            if (
                error.message ===
                'Challenge already completed today.'
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        error.message
                });

            }


            if (
                error.message ===
                'Challenge not found.'
            ) {

                return res.status(404).json({
                    success: false,
                    message:
                        error.message
                });

            }


            res.status(500).json({
                success: false,

                message:
                    'Failed to complete challenge',

                error:
                    error.message
            });

        }

    };


module.exports = {
    getChallenges,
    completeChallenge:
        completeChallengeController
};