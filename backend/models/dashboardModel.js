const db = require('../config/database');


// ============================================================
// DASHBOARD DATA
// ============================================================

const getDashboardData = (studentId) => {

    return new Promise((resolve, reject) => {

        const data = {};

        db.query(
            `
            SELECT
                student_id,
                name,
                email,
                xp,
                streak
            FROM students
            WHERE student_id = ?
            `,
            [studentId],

            (err, studentResults) => {

                if (err) return reject(err);

                data.student =
                    studentResults[0] || null;


                // ------------------------------------------------
                // QUIZ STATISTICS
                // ------------------------------------------------

                db.query(
                    `
                    SELECT
                        COUNT(*) AS total_quizzes,
                        COALESCE(
                            ROUND(AVG(score), 2),
                            0
                        ) AS average_score,

                        COALESCE(
                            SUM(total_questions),
                            0
                        ) AS questions_attempted,

                        COALESCE(
                            SUM(correct_answers),
                            0
                        ) AS questions_correct

                    FROM quiz_attempts

                    WHERE student_id = ?

                    AND completed_at IS NOT NULL
                    `,
                    [studentId],

                    (err, quizResults) => {

                        if (err) return reject(err);

                        data.quiz_stats =
                            quizResults[0];


                        // ------------------------------------------------
                        // TOPIC PROGRESS
                        // ------------------------------------------------

                        db.query(
                            `
                            SELECT
                                sp.topic_id,
                                t.topic_name,
                                s.subject_name,

                                sp.questions_attempted,
                                sp.questions_correct,

                                sp.accuracy,
                                sp.mastery_level,

                                sp.last_attempted_at

                            FROM student_progress sp

                            JOIN topics t
                                ON sp.topic_id = t.topic_id

                            JOIN subjects s
                                ON t.subject_id = s.subject_id

                            WHERE sp.student_id = ?

                            ORDER BY sp.accuracy ASC
                            `,
                            [studentId],

                            (err, progressResults) => {

                                if (err) return reject(err);

                                data.progress =
                                    progressResults;


                                // ------------------------------------------------
                                // BADGES
                                // ------------------------------------------------

                                db.query(
                                    `
                                    SELECT
                                        badge_name,
                                        description,
                                        icon,
                                        earned_at

                                    FROM student_badges sb

                                    JOIN badges b
                                        ON sb.badge_id = b.badge_id

                                    WHERE sb.student_id = ?

                                    ORDER BY earned_at DESC
                                    `,
                                    [studentId],

                                    (err, badgeResults) => {

                                        if (err) return reject(err);

                                        data.badges =
                                            badgeResults;


                                        // ------------------------------------------------
                                        // LEARNING TIMELINE
                                        // ------------------------------------------------

                                        db.query(
                                            `
                                            SELECT
                                                activity_type,
                                                activity_description,
                                                activity_date

                                            FROM learning_timeline

                                            WHERE student_id = ?

                                            ORDER BY activity_date DESC

                                            LIMIT 10
                                            `,
                                            [studentId],

                                            (err, timelineResults) => {

                                                if (err) return reject(err);

                                                data.timeline =
                                                    timelineResults;

                                                resolve(data);
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    });
};


// ============================================================
// WEAK TOPICS
// ============================================================

const getWeakTopics = (studentId) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                sp.topic_id,
                t.topic_name,
                s.subject_name,

                sp.accuracy,
                sp.mastery_level,
                sp.questions_attempted,
                sp.questions_correct

            FROM student_progress sp

            JOIN topics t
                ON sp.topic_id = t.topic_id

            JOIN subjects s
                ON t.subject_id = s.subject_id

            WHERE sp.student_id = ?

            AND sp.questions_attempted > 0

            AND sp.accuracy < 60

            ORDER BY
                sp.accuracy ASC,
                sp.questions_attempted DESC
            `,
            [studentId],

            (err, results) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
};


// ============================================================
// PERFORMANCE ANALYSIS
// ============================================================

const getPerformanceAnalysis = (studentId) => {

    return new Promise((resolve, reject) => {

        const analysis = {};


        // ========================================================
        // OVERALL PERFORMANCE
        // ========================================================

        db.query(
            `
            SELECT

                COUNT(*) AS total_quizzes,

                COALESCE(
                    ROUND(AVG(score), 2),
                    0
                ) AS average_score,

                COALESCE(
                    SUM(total_questions),
                    0
                ) AS total_questions,

                COALESCE(
                    SUM(correct_answers),
                    0
                ) AS total_correct,

                COALESCE(
                    ROUND(
                        (
                            SUM(correct_answers) /
                            NULLIF(
                                SUM(total_questions),
                                0
                            )
                        ) * 100,
                        2
                    ),
                    0
                ) AS overall_accuracy

            FROM quiz_attempts

            WHERE student_id = ?

            AND completed_at IS NOT NULL
            `,
            [studentId],

            (err, overallResults) => {

                if (err) return reject(err);

                analysis.overall =
                    overallResults[0];


                // ====================================================
                // SUBJECT PERFORMANCE
                // ====================================================

                db.query(
                    `
                    SELECT

                        s.subject_id,
                        s.subject_name,

                        COUNT(DISTINCT sp.topic_id)
                            AS topics_attempted,

                        COALESCE(
                            SUM(
                                sp.questions_attempted
                            ),
                            0
                        ) AS questions_attempted,

                        COALESCE(
                            SUM(
                                sp.questions_correct
                            ),
                            0
                        ) AS questions_correct,

                        COALESCE(
                            ROUND(
                                (
                                    SUM(
                                        sp.questions_correct
                                    )
                                    /
                                    NULLIF(
                                        SUM(
                                            sp.questions_attempted
                                        ),
                                        0
                                    )
                                ) * 100,
                                2
                            ),
                            0
                        ) AS accuracy

                    FROM student_progress sp

                    JOIN topics t
                        ON sp.topic_id = t.topic_id

                    JOIN subjects s
                        ON t.subject_id = s.subject_id

                    WHERE sp.student_id = ?

                    GROUP BY
                        s.subject_id,
                        s.subject_name

                    ORDER BY accuracy ASC
                    `,
                    [studentId],

                    (err, subjectResults) => {

                        if (err) return reject(err);

                        analysis.subjects =
                            subjectResults;


                        // ====================================================
                        // TOPIC PERFORMANCE
                        // ====================================================

                        db.query(
                            `
                            SELECT

                                sp.topic_id,
                                t.topic_name,
                                s.subject_name,

                                sp.questions_attempted,
                                sp.questions_correct,

                                sp.accuracy,
                                sp.mastery_level,

                                CASE

                                    WHEN sp.accuracy < 50
                                        THEN 'Weak'

                                    WHEN sp.accuracy < 70
                                        THEN 'Needs Improvement'

                                    ELSE 'Strong'

                                END AS performance_level

                            FROM student_progress sp

                            JOIN topics t
                                ON sp.topic_id = t.topic_id

                            JOIN subjects s
                                ON t.subject_id = s.subject_id

                            WHERE sp.student_id = ?

                            AND sp.questions_attempted > 0

                            ORDER BY
                                sp.accuracy ASC
                            `,
                            [studentId],

                            (err, topicResults) => {

                                if (err) return reject(err);

                                analysis.topics =
                                    topicResults;


                                // ====================================================
                                // STRONG TOPICS
                                // ====================================================

                                analysis.strong_topics =
                                    topicResults.filter(
                                        topic =>
                                            Number(
                                                topic.accuracy
                                            ) >= 70
                                    );


                                // ====================================================
                                // WEAK TOPICS
                                // ====================================================

                                analysis.weak_topics =
                                    topicResults.filter(
                                        topic =>
                                            Number(
                                                topic.accuracy
                                            ) < 60
                                    );


                                // ====================================================
                                // NEEDS IMPROVEMENT
                                // ====================================================

                                analysis.needs_improvement =
                                    topicResults.filter(
                                        topic => {

                                            const accuracy =
                                                Number(
                                                    topic.accuracy
                                                );

                                            return (
                                                accuracy >= 60 &&
                                                accuracy < 70
                                            );
                                        }
                                    );


                                // ====================================================
                                // RECOMMENDATION
                                // ====================================================

                                if (
                                    analysis.weak_topics.length > 0
                                ) {

                                    const weakest =
                                        analysis.weak_topics[0];

                                    analysis.recommendation = {

                                        type:
                                            'WEAK_TOPIC',

                                        topic_id:
                                            weakest.topic_id,

                                        topic_name:
                                            weakest.topic_name,

                                        subject_name:
                                            weakest.subject_name,

                                        accuracy:
                                            Number(
                                                weakest.accuracy
                                            ),

                                        message:
                                            `Focus on ${weakest.topic_name} in ${weakest.subject_name}. Your current accuracy is ${Number(weakest.accuracy)}%.`

                                    };

                                }

                                else if (
                                    analysis.needs_improvement.length > 0
                                ) {

                                    const topic =
                                        analysis.needs_improvement[0];

                                    analysis.recommendation = {

                                        type:
                                            'IMPROVE_TOPIC',

                                        topic_id:
                                            topic.topic_id,

                                        topic_name:
                                            topic.topic_name,

                                        subject_name:
                                            topic.subject_name,

                                        accuracy:
                                            Number(
                                                topic.accuracy
                                            ),

                                        message:
                                            `Continue practicing ${topic.topic_name} to improve your accuracy beyond ${Number(topic.accuracy)}%.`

                                    };

                                }

                                else if (
                                    analysis.strong_topics.length > 0
                                ) {

                                    const topic =
                                        analysis.strong_topics[0];

                                    analysis.recommendation = {

                                        type:
                                            'ADVANCE',

                                        topic_id:
                                            topic.topic_id,

                                        topic_name:
                                            topic.topic_name,

                                        subject_name:
                                            topic.subject_name,

                                        accuracy:
                                            Number(
                                                topic.accuracy
                                            ),

                                        message:
                                            `Your performance is strong in ${topic.topic_name}. You can move toward higher-difficulty practice.`

                                    };

                                }

                                else {

                                    analysis.recommendation = {

                                        type:
                                            'START',

                                        message:
                                            'Complete a quiz to generate personalized performance analysis.'

                                    };
                                }


                                resolve(analysis);
                            }
                        );
                    }
                );
            }
        );
    });
};


module.exports = {

    getDashboardData,

    getWeakTopics,

    getPerformanceAnalysis
};