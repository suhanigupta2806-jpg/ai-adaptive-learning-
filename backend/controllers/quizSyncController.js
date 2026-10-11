const db = require("../config/database");


// ============================================================
// SYNC EXISTING FRONTEND QUIZ RESULT TO MYSQL
// ============================================================

const syncQuizResult = async (req, res) => {

    let connection;

    try {

        connection = await new Promise((resolve, reject) => {

            db.getConnection((err, conn) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }

            });

        });


        const studentId =
            req.student.student_id;

        const {
            exam,
            examName,
            subject,
            topic,
            topicName,
            total,
            correct,
            wrong,
            accuracy,
            timeTaken,
            questions
        } = req.body;


        // =====================================================
        // VALIDATION
        // =====================================================

        if (!examName || !topicName) {

            connection.release();

            return res.status(400).json({

                success: false,

                message:
                    "Exam and topic information are required."

            });

        }


        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {

            connection.release();

            return res.status(400).json({

                success: false,

                message:
                    "Quiz questions are required."

            });

        }


        await new Promise((resolve, reject) => {

            connection.beginTransaction(err => {

                if (err) {
                    reject(err);
                } else {
                    resolve();
                }

            });

        });


        // =====================================================
        // FIND EXAM
        // =====================================================

        const examRows =
            await new Promise((resolve, reject) => {

                connection.query(

                    `
                    SELECT
                        exam_id,
                        exam_name
                    FROM exams
                    WHERE exam_name = ?
                    LIMIT 1
                    `,

                    [examName],

                    (err, results) => {

                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }

                    }

                );

            });


        if (examRows.length === 0) {

            throw new Error(
                "Selected exam was not found in database."
            );

        }


        const examId =
            examRows[0].exam_id;


        // =====================================================
        // FIND TOPIC
        // =====================================================

        const topicRows =
            await new Promise((resolve, reject) => {

                connection.query(

                    `
                    SELECT
                        t.topic_id,
                        t.topic_name,
                        s.subject_id,
                        s.subject_name,
                        e.exam_id,
                        e.exam_name
                    FROM topics t

                    INNER JOIN subjects s
                        ON t.subject_id = s.subject_id

                    INNER JOIN exams e
                        ON s.exam_id = e.exam_id

                    WHERE e.exam_id = ?
                    AND t.topic_name = ?

                    LIMIT 1
                    `,

                    [
                        examId,
                        topicName
                    ],

                    (err, results) => {

                        if (err) {
                            reject(err);
                        } else {
                            resolve(results);
                        }

                    }

                );

            });


        if (topicRows.length === 0) {

            throw new Error(
                "Selected topic was not found in database."
            );

        }


        const topicId =
            topicRows[0].topic_id;


        // =====================================================
        // CREATE QUIZ ATTEMPT
        // =====================================================

        const [attemptResult] =
            await new Promise((resolve, reject) => {

                connection.query(

                    `
                    INSERT INTO quiz_attempts
                    (
                        student_id,
                        exam_id,
                        score,
                        total_questions,
                        correct_answers,
                        started_at,
                        completed_at
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        CURRENT_TIMESTAMP,
                        CURRENT_TIMESTAMP
                    )
                    `,

                    [
                        studentId,
                        examId,
                        Number(accuracy) || 0,
                        Number(total) || questions.length,
                        Number(correct) || 0
                    ],

                    (err, results) => {

                        if (err) {
                            reject(err);
                        } else {
                            resolve([results]);
                        }

                    }

                );

            });


        const attemptId =
            attemptResult.insertId;


        // =====================================================
        // PROCESS EACH QUESTION
        // =====================================================

        let matchedQuestions = 0;

        let databaseCorrect = 0;

        const topicAttempted = questions.length;


        for (const question of questions) {

            const questionText =
                question.question;


            if (!questionText) {
                continue;
            }


            // -------------------------------------------------
            // FIND QUESTION
            // -------------------------------------------------

            const questionRows =
                await new Promise((resolve, reject) => {

                    connection.query(

                        `
                        SELECT
                            question_id,
                            topic_id
                        FROM questions
                        WHERE topic_id = ?
                        AND question_text = ?
                        LIMIT 1
                        `,

                        [
                            topicId,
                            questionText
                        ],

                        (err, results) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }

                        }

                    );

                });


            if (questionRows.length === 0) {
                continue;
            }


            const questionId =
                questionRows[0].question_id;


            matchedQuestions++;


            // -------------------------------------------------
            // FIND SELECTED OPTION
            // -------------------------------------------------

            let selectedOptionId = null;

            let isCorrect = false;


            const selectedText =
                question.selected;


            if (
                selectedText &&
                selectedText !== "Not Answered"
            ) {

                const optionRows =
                    await new Promise((resolve, reject) => {

                        connection.query(

                            `
                            SELECT
                                option_id,
                                is_correct
                            FROM options
                            WHERE question_id = ?
                            AND option_text = ?
                            ORDER BY option_id
                            LIMIT 1
                            `,

                            [
                                questionId,
                                selectedText
                            ],

                            (err, results) => {

                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(results);
                                }

                            }

                        );

                    });


                if (optionRows.length > 0) {

                    selectedOptionId =
                        optionRows[0].option_id;

                    isCorrect =
                        Number(
                            optionRows[0].is_correct
                        ) === 1;

                }

            }


            if (isCorrect) {
                databaseCorrect++;
            }


            // -------------------------------------------------
            // SAVE ANSWER
            // -------------------------------------------------

            await new Promise((resolve, reject) => {

                connection.query(

                    `
                    INSERT INTO quiz_answers
                    (
                        attempt_id,
                        question_id,
                        selected_option_id,
                        is_correct
                    )

                    VALUES (?, ?, ?, ?)
                    `,

                    [
                        attemptId,
                        questionId,
                        selectedOptionId,
                        isCorrect ? 1 : 0
                    ],

                    err => {

                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }

                    }

                );

            });

        }


        // =====================================================
        // UPDATE ACTUAL DATABASE SCORE
        // =====================================================

        const databaseTotal =
            matchedQuestions;


        const databaseScore =
            databaseTotal > 0
                ? Number(
                    (
                        databaseCorrect /
                        databaseTotal *
                        100
                    ).toFixed(2)
                )
                : Number(accuracy) || 0;


        await new Promise((resolve, reject) => {

            connection.query(

                `
                UPDATE quiz_attempts

                SET
                    score = ?,
                    total_questions = ?,
                    correct_answers = ?,
                    completed_at = CURRENT_TIMESTAMP

                WHERE attempt_id = ?
                `,

                [
                    databaseScore,
                    databaseTotal || Number(total) || 0,
                    databaseCorrect,
                    attemptId
                ],

                err => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }

                }

            );

        });


        // =====================================================
        // UPDATE STUDENT PROGRESS
        // =====================================================

        if (databaseTotal > 0) {

            const existingProgress =
                await new Promise((resolve, reject) => {

                    connection.query(

                        `
                        SELECT *
                        FROM student_progress

                        WHERE student_id = ?
                        AND topic_id = ?

                        LIMIT 1
                        `,

                        [
                            studentId,
                            topicId
                        ],

                        (err, results) => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve(results[0] || null);
                            }

                        }

                    );

                });


            if (existingProgress) {

                const attempted =
                    Number(
                        existingProgress.questions_attempted
                    ) +
                    databaseTotal;


                const correctTotal =
                    Number(
                        existingProgress.questions_correct
                    ) +
                    databaseCorrect;


                const newAccuracy =
                    attempted > 0
                        ? Number(
                            (
                                correctTotal /
                                attempted *
                                100
                            ).toFixed(2)
                        )
                        : 0;


                await new Promise((resolve, reject) => {

                    connection.query(

                        `
                        UPDATE student_progress

                        SET
                            questions_attempted = ?,
                            questions_correct = ?,
                            accuracy = ?,
                            mastery_level = ?,
                            last_attempted_at =
                                CURRENT_TIMESTAMP

                        WHERE progress_id = ?
                        `,

                        [
                            attempted,
                            correctTotal,
                            newAccuracy,
                            newAccuracy,
                            existingProgress.progress_id
                        ],

                        err => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }

                        }

                    );

                });

            } else {

                const newAccuracy =
                    databaseTotal > 0
                        ? Number(
                            (
                                databaseCorrect /
                                databaseTotal *
                                100
                            ).toFixed(2)
                        )
                        : 0;


                await new Promise((resolve, reject) => {

                    connection.query(

                        `
                        INSERT INTO student_progress
                        (
                            student_id,
                            topic_id,
                            questions_attempted,
                            questions_correct,
                            accuracy,
                            mastery_level,
                            last_attempted_at
                        )

                        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                        `,

                        [
                            studentId,
                            topicId,
                            databaseTotal,
                            databaseCorrect,
                            newAccuracy,
                            newAccuracy
                        ],

                        err => {

                            if (err) {
                                reject(err);
                            } else {
                                resolve();
                            }

                        }

                    );

                });

            }

        }


        // =====================================================
        // COMMIT
        // =====================================================

        await new Promise((resolve, reject) => {

            connection.commit(err => {

                if (err) {
                    reject(err);
                } else {
                    resolve();
                }

            });

        });


        connection.release();


        // =====================================================
        // RESPONSE
        // =====================================================

        res.json({

            success: true,

            message:
                "Quiz result successfully saved to MySQL.",

            result: {

                attempt_id:
                    attemptId,

                exam_id:
                    examId,

                topic_id:
                    topicId,

                total_questions:
                    databaseTotal,

                correct_answers:
                    databaseCorrect,

                score:
                    databaseScore

            }

        });


    } catch (error) {

        console.error(
            "Quiz result sync error:",
            error
        );


        if (connection) {

            try {
                await new Promise(resolve => {
                    connection.rollback(() => resolve());
                });
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }

            connection.release();

        }


        res.status(500).json({

            success: false,

            message:
                "Failed to save quiz result.",

            error:
                error.message

        });

    }

};


module.exports = {
    syncQuizResult
};