const db = require('../config/database');


// ==========================================================
// GET TODAY'S PERSONALIZED DAILY CHALLENGE
// ==========================================================

const getDailyChallenges = (
    studentId,
    examId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                dc.challenge_id,
                dc.topic_id,
                dc.title,
                dc.description,
                dc.xp_reward,

                t.topic_name,

                s.subject_name,

                e.exam_name,

                q.question_id,
                q.question_text,
                q.difficulty,
                q.explanation,

                COALESCE(sp.accuracy, 0) AS accuracy

            FROM daily_challenges dc

            INNER JOIN topics t
                ON t.topic_id = dc.topic_id

            INNER JOIN subjects s
                ON s.subject_id = t.subject_id

            INNER JOIN exams e
                ON e.exam_id = s.exam_id

            INNER JOIN questions q
                ON q.question_id = (
                    SELECT MIN(q2.question_id)
                    FROM questions q2
                    WHERE q2.topic_id = dc.topic_id
                )

            LEFT JOIN student_progress sp
                ON sp.topic_id = dc.topic_id
                AND sp.student_id = ?

            WHERE e.exam_id = ?

              AND NOT EXISTS (
                  SELECT 1
                  FROM challenge_attempts ca
                  WHERE ca.student_id = ?
                    AND ca.challenge_id = dc.challenge_id
                    AND ca.completed = TRUE
                    AND DATE(ca.completed_at) = CURDATE()
              )

            ORDER BY
                COALESCE(sp.accuracy, 0) ASC,
                RAND()

            LIMIT 1
        `;


        db.query(
            sql,
            [
                studentId,
                examId,
                studentId
            ],
            (err, results) => {

                if (err) {
                    return reject(err);
                }


                if (
                    !results ||
                    results.length === 0
                ) {
                    return resolve([]);
                }


                const challenge =
                    results[0];


                // Load options for the selected question
                db.query(
                    `
                    SELECT
                        option_id,
                        option_text
                    FROM options
                    WHERE question_id = ?
                    ORDER BY option_id
                    `,
                    [challenge.question_id],
                    (optionErr, options) => {

                        if (optionErr) {
                            return reject(
                                optionErr
                            );
                        }


                        challenge.options =
                            options || [];


                        resolve([
                            challenge
                        ]);

                    }
                );

            }
        );

    });
};


// ==========================================================
// GET SINGLE CHALLENGE
// ==========================================================

const getChallengeById = (
    challengeId
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                dc.*,
                t.topic_name,
                s.subject_name,
                e.exam_id,
                e.exam_name
            FROM daily_challenges dc

            LEFT JOIN topics t
                ON t.topic_id = dc.topic_id

            LEFT JOIN subjects s
                ON s.subject_id = t.subject_id

            LEFT JOIN exams e
                ON e.exam_id = s.exam_id

            WHERE dc.challenge_id = ?

            LIMIT 1
            `,
            [challengeId],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(
                    results[0] || null
                );

            }
        );

    });
};


// ==========================================================
// GET QUESTION FOR CHALLENGE
// ==========================================================

const getChallengeQuestion = (
    challengeId
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                q.question_id,
                q.question_text,
                q.difficulty,
                q.explanation

            FROM questions q

            INNER JOIN daily_challenges dc
                ON dc.topic_id = q.topic_id

            WHERE dc.challenge_id = ?

            ORDER BY q.question_id

            LIMIT 1
            `,
            [challengeId],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                if (
                    !results ||
                    results.length === 0
                ) {
                    return resolve(null);
                }


                const question =
                    results[0];


                db.query(
                    `
                    SELECT
                        option_id,
                        option_text
                    FROM options
                    WHERE question_id = ?
                    ORDER BY option_id
                    `,
                    [question.question_id],
                    (optionErr, options) => {

                        if (optionErr) {
                            return reject(
                                optionErr
                            );
                        }


                        question.options =
                            options || [];


                        resolve(question);

                    }
                );

            }
        );

    });
};


// ==========================================================
// CHECK WHETHER CHALLENGE WAS COMPLETED TODAY
// ==========================================================

const hasCompletedToday = (
    studentId,
    challengeId
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                challenge_attempt_id
            FROM challenge_attempts

            WHERE student_id = ?
              AND challenge_id = ?
              AND completed = TRUE
              AND DATE(completed_at) = CURDATE()

            LIMIT 1
            `,
            [
                studentId,
                challengeId
            ],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(
                    results.length > 0
                );

            }
        );

    });
};


// ==========================================================
// COMPLETE CHALLENGE + XP + STREAK + BADGES
// ==========================================================

const completeChallenge = (
    studentId,
    challengeId,
    questionId,
    optionId,
    proof
) => {

    return new Promise((resolve, reject) => {

        db.getConnection(
            (connectionError, connection) => {

                if (connectionError) {
                    return reject(
                        connectionError
                    );
                }


                const query = (
                    sql,
                    params = []
                ) => {

                    return new Promise(
                        (resolveQuery, rejectQuery) => {

                            connection.query(
                                sql,
                                params,
                                (
                                    err,
                                    results
                                ) => {

                                    if (err) {
                                        rejectQuery(
                                            err
                                        );
                                    } else {
                                        resolveQuery(
                                            results
                                        );
                                    }

                                }
                            );

                        }
                    );

                };


                const run = async () => {

                    try {

                        await new Promise(
                            (
                                resolveBegin,
                                rejectBegin
                            ) => {

                                connection.beginTransaction(
                                    err => {

                                        if (err) {
                                            rejectBegin(
                                                err
                                            );
                                        } else {
                                            resolveBegin();
                                        }

                                    }
                                );

                            }
                        );


                        // ------------------------------------------
                        // GET CHALLENGE
                        // ------------------------------------------

                        const challengeRows =
                            await query(
                                `
                                SELECT
                                    dc.*,
                                    t.topic_name,
                                    s.subject_name,
                                    e.exam_name
                                FROM daily_challenges dc

                                LEFT JOIN topics t
                                    ON t.topic_id = dc.topic_id

                                LEFT JOIN subjects s
                                    ON s.subject_id = t.subject_id

                                LEFT JOIN exams e
                                    ON e.exam_id = s.exam_id

                                WHERE dc.challenge_id = ?

                                LIMIT 1
                                `,
                                [challengeId]
                            );


                        if (
                            challengeRows.length === 0
                        ) {
                            throw new Error(
                                'Challenge not found.'
                            );
                        }


                        const challenge =
                            challengeRows[0];


                        // ------------------------------------------
                        // GET QUESTION
                        // ------------------------------------------

                        const questionRows =
                            await query(
                                `
                                SELECT
                                    q.question_id,
                                    q.question_text,
                                    q.difficulty,
                                    q.explanation

                                FROM questions q

                                WHERE q.question_id = ?
                                  AND q.topic_id = ?

                                LIMIT 1
                                `,
                                [
                                    questionId,
                                    challenge.topic_id
                                ]
                            );


                        if (
                            questionRows.length === 0
                        ) {
                            throw new Error(
                                'Invalid challenge question.'
                            );
                        }


                        const question =
                            questionRows[0];


                        // ------------------------------------------
                        // CHECK ANSWER
                        // ------------------------------------------

                        const optionRows =
                            await query(
                                `
                                SELECT
                                    option_id,
                                    option_text,
                                    is_correct

                                FROM options

                                WHERE option_id = ?
                                  AND question_id = ?

                                LIMIT 1
                                `,
                                [
                                    optionId,
                                    questionId
                                ]
                            );


                        if (
                            optionRows.length === 0
                        ) {
                            throw new Error(
                                'Invalid answer option.'
                            );
                        }


                        const selectedOption =
                            optionRows[0];


                        const isCorrect =
                            Boolean(
                                selectedOption.is_correct
                            );


                        // Wrong answer:
                        // don't create completion or award XP.
                        if (!isCorrect) {

                            await new Promise(
                                (
                                    resolveRollback
                                ) => {

                                    connection.rollback(
                                        () => {

                                            connection.release();

                                            resolveRollback();

                                        }
                                    );

                                }
                            );


                            return resolve({
                                success: false,
                                correct: false,
                                message:
                                    'Not quite. Try again!',
                                correct_answer:
                                    await getCorrectAnswer(
                                        questionId
                                    ),
                                explanation:
                                    question.explanation || ''
                            });

                        }


                        // ------------------------------------------
                        // PREVENT DUPLICATE COMPLETION TODAY
                        // ------------------------------------------

                        const existingRows =
                            await query(
                                `
                                SELECT
                                    challenge_attempt_id

                                FROM challenge_attempts

                                WHERE student_id = ?
                                  AND challenge_id = ?
                                  AND completed = TRUE
                                  AND DATE(completed_at) = CURDATE()

                                LIMIT 1
                                `,
                                [
                                    studentId,
                                    challengeId
                                ]
                            );


                        if (
                            existingRows.length > 0
                        ) {
                            throw new Error(
                                'Challenge already completed today.'
                            );
                        }


                        const xp =
                            Number(
                                challenge.xp_reward
                            ) || 0;


                        // ------------------------------------------
                        // SAVE CHALLENGE ATTEMPT
                        // ------------------------------------------

                        await query(
                            `
                            INSERT INTO challenge_attempts
                            (
                                student_id,
                                challenge_id,
                                proof,
                                completed,
                                xp_earned,
                                completed_at
                            )
                            VALUES
                            (?, ?, ?, TRUE, ?, CURRENT_TIMESTAMP)
                            `,
                            [
                                studentId,
                                challengeId,
                                proof || '',
                                xp
                            ]
                        );


                        // ------------------------------------------
                        // GET CURRENT STUDENT
                        // ------------------------------------------

                        const studentRows =
                            await query(
                                `
                                SELECT
                                    xp,
                                    streak
                                FROM students
                                WHERE student_id = ?
                                FOR UPDATE
                                `,
                                [studentId]
                            );


                        const currentXP =
                            Number(
                                studentRows[0]?.xp
                            ) || 0;

                        const oldStudentStreak =
                            Number(
                                studentRows[0]?.streak
                            ) || 0;


                        const newXP =
                            currentXP + xp;


                        // ------------------------------------------
                        // STREAK
                        // ------------------------------------------

                        const streakRows =
                            await query(
                                `
                                SELECT
                                    streak_id,
                                    current_streak,
                                    longest_streak,
                                    last_activity_date

                                FROM streaks

                                WHERE student_id = ?

                                LIMIT 1

                                FOR UPDATE
                                `,
                                [studentId]
                            );


                        const today =
                            new Date();


                        const todayString =
                            today
                                .toISOString()
                                .slice(
                                    0,
                                    10
                                );


                        let currentStreak = 1;
                        let longestStreak = 1;


                        if (
                            streakRows.length > 0
                        ) {

                            const streak =
                                streakRows[0];


                            currentStreak =
                                Number(
                                    streak.current_streak
                                ) || 0;

                            longestStreak =
                                Number(
                                    streak.longest_streak
                                ) || 0;


                            const lastDate =
                                streak.last_activity_date;


                            if (
                                lastDate
                            ) {

                                const lastDateString =
                                    new Date(
                                        lastDate
                                    )
                                        .toISOString()
                                        .slice(
                                            0,
                                            10
                                        );


                                if (
                                    lastDateString ===
                                    todayString
                                ) {

                                    // Already active today.
                                    currentStreak =
                                        Math.max(
                                            currentStreak,
                                            1
                                        );

                                } else {

                                    const last =
                                        new Date(
                                            `${lastDateString}T00:00:00`
                                        );

                                    const now =
                                        new Date(
                                            `${todayString}T00:00:00`
                                        );

                                    const difference =
                                        Math.round(
                                            (
                                                now -
                                                last
                                            ) /
                                            (
                                                1000 *
                                                60 *
                                                60 *
                                                24
                                            )
                                        );


                                    if (
                                        difference === 1
                                    ) {

                                        currentStreak++;

                                    } else {

                                        currentStreak =
                                            1;

                                    }

                                }

                            } else {

                                currentStreak =
                                    Math.max(
                                        currentStreak + 1,
                                        1
                                    );

                            }


                            longestStreak =
                                Math.max(
                                    longestStreak,
                                    currentStreak
                                );


                            await query(
                                `
                                UPDATE streaks

                                SET
                                    current_streak = ?,
                                    longest_streak = ?,
                                    last_activity_date = ?

                                WHERE streak_id = ?
                                `,
                                [
                                    currentStreak,
                                    longestStreak,
                                    todayString,
                                    streak.streak_id
                                ]
                            );

                        } else {

                            currentStreak =
                                Math.max(
                                    oldStudentStreak + 1,
                                    1
                                );

                            longestStreak =
                                currentStreak;


                            await query(
                                `
                                INSERT INTO streaks
                                (
                                    student_id,
                                    current_streak,
                                    longest_streak,
                                    last_activity_date
                                )
                                VALUES
                                (?, ?, ?, ?)
                                `,
                                [
                                    studentId,
                                    currentStreak,
                                    longestStreak,
                                    todayString
                                ]
                            );

                        }


                        // ------------------------------------------
                        // UPDATE STUDENT XP + STREAK
                        // ------------------------------------------

                        await query(
                            `
                            UPDATE students

                            SET
                                xp = ?,
                                streak = ?

                            WHERE student_id = ?
                            `,
                            [
                                newXP,
                                currentStreak,
                                studentId
                            ]
                        );


                        // ------------------------------------------
                        // LEARNING TIMELINE
                        // ------------------------------------------

                        await query(
                            `
                            INSERT INTO learning_timeline
                            (
                                student_id,
                                activity_type,
                                activity_description
                            )
                            VALUES
                            (?, ?, ?)
                            `,
                            [
                                studentId,
                                'Challenge',
                                `Completed daily challenge: ${challenge.title}`
                            ]
                        );


                        // ------------------------------------------
                        // NOTIFICATION
                        // ------------------------------------------

                        await query(
                            `
                            INSERT INTO notifications
                            (
                                student_id,
                                title,
                                message
                            )
                            VALUES
                            (?, ?, ?)
                            `,
                            [
                                studentId,
                                'Daily Challenge Completed',
                                `Great job! You earned ${xp} XP from today's challenge.`
                            ]
                        );


                        // ------------------------------------------
                        // BADGES
                        // ------------------------------------------

                        const badges =
                            await query(
                                `
                                SELECT
                                    badge_id,
                                    badge_name,
                                    description,
                                    icon,
                                    xp_required

                                FROM badges

                                ORDER BY xp_required ASC
                                `
                            );


                        const earnedBadges = [];


                        for (
                            const badge of badges
                        ) {

                            let shouldAward =
                                false;


                            const badgeName =
                                String(
                                    badge.badge_name ||
                                    ''
                                ).toLowerCase();


                            // First challenge
                            if (
                                badgeName ===
                                'first step'
                            ) {

                                const attemptRows =
                                    await query(
                                        `
                                        SELECT COUNT(*) AS total
                                        FROM challenge_attempts
                                        WHERE student_id = ?
                                          AND completed = TRUE
                                        `,
                                        [studentId]
                                    );


                                shouldAward =
                                    Number(
                                        attemptRows[0].total
                                    ) >= 1;

                            }

                            // Seven day streak
                            else if (
                                badgeName ===
                                'consistency king'
                            ) {

                                shouldAward =
                                    currentStreak >= 7;

                            }

                            // XP-based badges
                            else {

                                shouldAward =
                                    newXP >=
                                    Number(
                                        badge.xp_required
                                    );
                            }


                            if (
                                !shouldAward
                            ) {
                                continue;
                            }


                            const existingBadge =
                                await query(
                                    `
                                    SELECT
                                        student_badge_id

                                    FROM student_badges

                                    WHERE student_id = ?
                                      AND badge_id = ?

                                    LIMIT 1
                                    `,
                                    [
                                        studentId,
                                        badge.badge_id
                                    ]
                                );


                            if (
                                existingBadge.length === 0
                            ) {

                                await query(
                                    `
                                    INSERT INTO student_badges
                                    (
                                        student_id,
                                        badge_id
                                    )
                                    VALUES
                                    (?, ?)
                                    `,
                                    [
                                        studentId,
                                        badge.badge_id
                                    ]
                                );


                                earnedBadges.push(
                                    badge
                                );

                            }

                        }


                        // ------------------------------------------
                        // COMMIT
                        // ------------------------------------------

                        await new Promise(
                            (
                                resolveCommit,
                                rejectCommit
                            ) => {

                                connection.commit(
                                    err => {

                                        if (err) {
                                            rejectCommit(
                                                err
                                            );
                                        } else {
                                            resolveCommit();
                                        }

                                    }
                                );

                            }
                        );


                        connection.release();


                        resolve({
                            success: true,

                            correct: true,

                            message:
                                'Challenge completed successfully!',

                            xp_earned:
                                xp,

                            total_xp:
                                newXP,

                            current_streak:
                                currentStreak,

                            longest_streak:
                                longestStreak,

                            earned_badges:
                                earnedBadges,

                            challenge_title:
                                challenge.title
                        });

                    } catch (error) {

                        try {

                            connection.rollback(
                                () => {
                                    connection.release();
                                }
                            );

                        } catch {

                            connection.release();

                        }


                        reject(error);

                    }

                };


                run();

            }
        );

    });
};


// ==========================================================
// GET CORRECT ANSWER
// ==========================================================

const getCorrectAnswer = (
    questionId
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                option_text

            FROM options

            WHERE question_id = ?
              AND is_correct = TRUE

            ORDER BY option_id

            LIMIT 1
            `,
            [questionId],
            (err, results) => {

                if (err) {
                    return reject(err);
                }

                resolve(
                    results[0]?.option_text || ''
                );

            }
        );

    });

};


module.exports = {
    getDailyChallenges,
    getChallengeById,
    getChallengeQuestion,
    hasCompletedToday,
    completeChallenge
};