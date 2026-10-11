const db = require('../config/database');

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};


// ==========================================================
// NOTIFICATIONS
// ==========================================================

const getNotifications = async (req, res) => {
    try {
        const notifications = await query(
            `
            SELECT
                notification_id,
                message,
                type,
                created_at,
                is_read
            FROM notifications
            WHERE student_id = ?
            ORDER BY created_at DESC
            `,
            [req.student.student_id]
        );

        res.json({
            success: true,
            notifications
        });

    } catch (error) {
        console.error('getNotifications error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error.message
        });
    }
};


const markNotificationRead = async (req, res) => {
    try {
        await query(
            `
            UPDATE notifications
            SET is_read = TRUE
            WHERE notification_id = ?
              AND student_id = ?
            `,
            [
                req.params.id,
                req.student.student_id
            ]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('markNotificationRead error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to update notification',
            error: error.message
        });
    }
};


// ==========================================================
// FEEDBACK
// ==========================================================

const submitFeedback = async (req, res) => {
    try {
        const {
            rating,
            comment
        } = req.body;

        if (
            rating === undefined ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        await query(
            `
            INSERT INTO feedback
            (
                student_id,
                rating,
                comment
            )
            VALUES (?, ?, ?)
            `,
            [
                req.student.student_id,
                rating,
                comment || ''
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error('submitFeedback error:', error);

        res.status(500).json({
            success: false,
            message: 'Failed to submit feedback',
            error: error.message
        });
    }
};


// ==========================================================
// ACHIEVEMENTS / BADGES
// ==========================================================

const getBadges = async (req, res) => {
    try {
        const studentId = req.student.student_id;


        // --------------------------------------------------
        // STUDENT XP + CURRENT STREAK
        // --------------------------------------------------

        const studentRows = await query(
            `
            SELECT
                student_id,
                name,
                xp,
                streak
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [studentId]
        );

        if (studentRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = studentRows[0];


        // --------------------------------------------------
        // LONGEST STREAK
        // --------------------------------------------------

        let longestStreak = Number(student.streak || 0);

        try {
            const streakRows = await query(
                `
                SELECT
                    current_streak,
                    longest_streak
                FROM streaks
                WHERE student_id = ?
                LIMIT 1
                `,
                [studentId]
            );

            if (streakRows.length > 0) {
                longestStreak = Math.max(
                    longestStreak,
                    Number(streakRows[0].longest_streak || 0),
                    Number(streakRows[0].current_streak || 0)
                );
            }
        } catch (streakError) {
            // The achievements page still works if the streaks
            // table does not have a row for this student.
            console.log(
                'Streak record not available:',
                streakError.message
            );
        }


        // --------------------------------------------------
        // QUIZ COUNT
        // --------------------------------------------------

        const quizRows = await query(
            `
            SELECT COUNT(*) AS quiz_count
            FROM quiz_attempts
            WHERE student_id = ?
            `,
            [studentId]
        );

        const quizCount =
            Number(quizRows[0]?.quiz_count || 0);


        // --------------------------------------------------
        // CHALLENGE COUNT
        // --------------------------------------------------

        let challengeCount = 0;

        try {
            const challengeRows = await query(
                `
                SELECT COUNT(*) AS challenge_count
                FROM challenge_attempts
                WHERE student_id = ?
                  AND completed = TRUE
                `,
                [studentId]
            );

            challengeCount =
                Number(
                    challengeRows[0]?.challenge_count || 0
                );

        } catch (challengeError) {
            console.log(
                'Challenge count unavailable:',
                challengeError.message
            );
        }


        // --------------------------------------------------
        // ALL BADGES
        // --------------------------------------------------

        const badges = await query(
            `
            SELECT
                b.badge_id,
                b.badge_name,
                b.description,
                b.icon,
                b.xp_required,
                sb.earned_at
            FROM badges b
            LEFT JOIN student_badges sb
                ON b.badge_id = sb.badge_id
                AND sb.student_id = ?
            ORDER BY b.badge_id ASC
            `,
            [studentId]
        );


        // --------------------------------------------------
        // DETERMINE ACHIEVEMENT PROGRESS
        // --------------------------------------------------

        const processedBadges = [];


        for (const badge of badges) {

            let target = 0;
            let current = 0;
            let earned = false;


            switch (badge.badge_name) {

                case 'First Step':
                    target = 1;
                    current = quizCount;
                    earned = quizCount >= 1;
                    break;


                case 'Quiz Starter':
                    target = 3;
                    current = quizCount;
                    earned = quizCount >= 3;
                    break;


                case 'Quick Learner':
                    target = 100;
                    current = Number(student.xp || 0);
                    earned = current >= 100;
                    break;


                case 'Focused Student':
                    target = 250;
                    current = Number(student.xp || 0);
                    earned = current >= 250;
                    break;


                case 'Knowledge Builder':
                    target = 500;
                    current = Number(student.xp || 0);
                    earned = current >= 500;
                    break;


                case 'Consistency King':
                    target = 7;
                    current = Math.max(
                        Number(student.streak || 0),
                        longestStreak
                    );
                    earned = current >= 7;
                    break;


                default:
                    target = Number(
                        badge.xp_required || 0
                    );

                    current = Number(
                        student.xp || 0
                    );

                    earned =
                        badge.earned_at !== null ||
                        current >= target;
            }


            // --------------------------------------------------
            // AUTO AWARD BADGE
            // --------------------------------------------------

            if (
                earned &&
                !badge.earned_at
            ) {

                try {

                    await query(
                        `
                        INSERT INTO student_badges
                        (
                            student_id,
                            badge_id
                        )
                        SELECT ?, ?
                        WHERE NOT EXISTS (
                            SELECT 1
                            FROM student_badges
                            WHERE student_id = ?
                              AND badge_id = ?
                        )
                        `,
                        [
                            studentId,
                            badge.badge_id,
                            studentId,
                            badge.badge_id
                        ]
                    );

                } catch (awardError) {

                    console.error(
                        `Failed to award ${badge.badge_name}:`,
                        awardError.message
                    );
                }
            }


            // --------------------------------------------------
            // PROGRESS %
            // --------------------------------------------------

            let progress = 0;

            if (earned) {
                progress = 100;
            } else if (target > 0) {
                progress = Math.min(
                    100,
                    Math.round(
                        (current / target) * 100
                    )
                );
            }


            processedBadges.push({
                badge_id: badge.badge_id,
                badge_name: badge.badge_name,
                description: badge.description,
                icon: badge.icon,
                xp_required: Number(
                    badge.xp_required || 0
                ),
                earned,
                earned_at: badge.earned_at || null,
                current,
                target,
                progress
            });
        }


        // --------------------------------------------------
        // RELOAD EARNED BADGES
        // --------------------------------------------------

        const earnedRows = await query(
            `
            SELECT
                sb.student_badge_id,
                sb.badge_id,
                b.badge_name,
                b.description,
                b.icon,
                sb.earned_at
            FROM student_badges sb
            INNER JOIN badges b
                ON b.badge_id = sb.badge_id
            WHERE sb.student_id = ?
            ORDER BY sb.earned_at DESC
            `,
            [studentId]
        );


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        res.json({
            success: true,

            student: {
                student_id: student.student_id,
                name: student.name,
                xp: Number(student.xp || 0),
                current_streak: Number(student.streak || 0),
                longest_streak: longestStreak,
                quiz_count: quizCount,
                challenge_count: challengeCount
            },

            badges: processedBadges,

            earned_badges: earnedRows,

            total_badges: processedBadges.length,

            earned_count: earnedRows.length
        });

    } catch (error) {

        console.error(
            'getBadges error:',
            error
        );

        res.status(500).json({
            success: false,
            message: 'Failed to fetch achievements',
            error: error.message
        });
    }
};


// ==========================================================
// EXPORTS
// ==========================================================

module.exports = {
    getNotifications,
    markNotificationRead,
    submitFeedback,
    getBadges
};