"use strict";

const db = require("../config/database");


// ============================================================
// HELPER: QUERY DATABASE
// ============================================================

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}


// ============================================================
// GET QUESTIONS BY TOPIC
// ============================================================

const getQuestionsByTopic = async (
    topicId,
    limit = 10
) => {

    const safeTopicId = Number(topicId);

    const safeLimit = Math.max(
        1,
        Math.min(
            Number(limit) || 10,
            50
        )
    );

    if (
        !Number.isInteger(safeTopicId) ||
        safeTopicId <= 0
    ) {
        throw new Error("Valid topic ID is required");
    }


    // --------------------------------------------------------
    // Get questions first
    // --------------------------------------------------------

    const questionRows = await query(
    `
    SELECT
        q.question_id,
        q.topic_id,
        q.question_text,
        q.difficulty,
        q.explanation,
        t.topic_name
    FROM questions q
    INNER JOIN topics t
        ON q.topic_id = t.topic_id
    WHERE q.topic_id = ?
    ORDER BY q.question_id ASC
LIMIT ${safeLimit}
    `,
    [safeTopicId]
);


    if (!questionRows || questionRows.length === 0) {
        return [];
    }


    const questionIds = questionRows.map(
        question => Number(question.question_id)
    );


    const placeholders = questionIds
        .map(() => "?")
        .join(",");


    // --------------------------------------------------------
    // Get exactly the options belonging to those questions
    // --------------------------------------------------------

    const optionRows = await query(
        `
        SELECT
            option_id,
            question_id,
            option_text,
            is_correct
        FROM options
        WHERE question_id IN (${placeholders})
        ORDER BY question_id, option_id
        `,
        questionIds
    );


    // --------------------------------------------------------
    // Build option map
    // --------------------------------------------------------

    const optionMap = new Map();

    questionIds.forEach(questionId => {
        optionMap.set(questionId, []);
    });


    for (const option of optionRows) {

        const questionId =
            Number(option.question_id);

        if (!optionMap.has(questionId)) {
            optionMap.set(questionId, []);
        }

        const options =
            optionMap.get(questionId);

        // Only first 4 options for each question
        if (options.length < 4) {
            options.push({
                option_id:
                    Number(option.option_id),

                option_text:
                    option.option_text
            });
        }
    }


    // --------------------------------------------------------
    // Attach options to the correct question
    // --------------------------------------------------------

    return questionRows
        .map(question => {

            const questionId =
                Number(question.question_id);

            return {
                question_id:
                    questionId,

                topic_id:
                    Number(question.topic_id),

                question_text:
                    question.question_text,

                difficulty:
                    question.difficulty,

                explanation:
                    question.explanation,

                options:
                    optionMap.get(questionId) || []
            };
        })
        .filter(question =>
            question.options.length === 4
        );
};



// ============================================================
// GET MOCK TEST QUESTIONS
// ============================================================

const getMockTestQuestions = async (
    examId,
    limit = 20
) => {

    const safeExamId = Number(examId);

    const safeLimit = Math.max(
        1,
        Math.min(
            Number(limit) || 20,
            100
        )
    );


    if (
        !Number.isInteger(safeExamId) ||
        safeExamId <= 0
    ) {
        throw new Error("Valid exam ID is required");
    }


    // --------------------------------------------------------
    // Get questions belonging ONLY to this exam
    // --------------------------------------------------------

    const questionRows = await query(
        `
        SELECT
            q.question_id,
            q.topic_id,
            q.question_text,
            q.difficulty,
            q.explanation,
            t.topic_name,
            s.subject_name
        FROM questions q

        INNER JOIN topics t
            ON q.topic_id = t.topic_id

        INNER JOIN subjects s
            ON t.subject_id = s.subject_id

        WHERE s.exam_id = ?

        ORDER BY RAND()
        LIMIT ${safeLimit}
        `,
        [safeExamId]
    );


    if (!questionRows || questionRows.length === 0) {
        return [];
    }


    const questionIds = questionRows.map(
        question => Number(question.question_id)
    );


    const placeholders = questionIds
        .map(() => "?")
        .join(",");


    // --------------------------------------------------------
    // Get options by question_id
    // --------------------------------------------------------

    const optionRows = await query(
        `
        SELECT
            option_id,
            question_id,
            option_text
        FROM options
        WHERE question_id IN (${placeholders})
        ORDER BY question_id, option_id
        `,
        questionIds
    );


    const optionMap = new Map();


    questionIds.forEach(questionId => {
        optionMap.set(questionId, []);
    });


    for (const option of optionRows) {

        const questionId =
            Number(option.question_id);

        if (!optionMap.has(questionId)) {
            optionMap.set(questionId, []);
        }

        const options =
            optionMap.get(questionId);

        if (options.length < 4) {

            options.push({
                option_id:
                    Number(option.option_id),

                option_text:
                    option.option_text
            });

        }
    }


    return questionRows
        .map(question => {

            const questionId =
                Number(question.question_id);

            return {

                question_id:
                    questionId,

                topic_id:
                    Number(question.topic_id),

                topic_name:
                    question.topic_name,

                subject_name:
                    question.subject_name,

                question_text:
                    question.question_text,

                difficulty:
                    question.difficulty,

                explanation:
                    question.explanation,

                options:
                    optionMap.get(questionId) || []

            };

        })
        .filter(question =>
            question.options.length === 4
        );
};



// ============================================================
// SUBMIT QUIZ
// ============================================================

const submitQuiz = async ({
    studentId,
    examId,
    answers
}) => {

    const safeStudentId =
        Number(studentId);

    const safeExamId =
        Number(examId);


    if (
        !Number.isInteger(safeStudentId) ||
        safeStudentId <= 0
    ) {
        throw new Error("Valid student ID is required");
    }


    if (
        !Number.isInteger(safeExamId) ||
        safeExamId <= 0
    ) {
        throw new Error("Valid exam ID is required");
    }


    if (
        !Array.isArray(answers) ||
        answers.length === 0
    ) {
        throw new Error("Quiz answers are required");
    }


    let connection;


    try {

        connection = await new Promise(
            (resolve, reject) => {

                db.getConnection(
                    (error, conn) => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve(conn);
                        }

                    }
                );

            }
        );


        // ----------------------------------------------------
        // START TRANSACTION
        // ----------------------------------------------------

        await new Promise(
            (resolve, reject) => {

                connection.beginTransaction(
                    error => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }

                    }
                );

            }
        );


        // ----------------------------------------------------
        // Validate exam
        // ----------------------------------------------------

        const examRows =
            await connectionQuery(
                connection,
                `
                SELECT exam_id, exam_name
                FROM exams
                WHERE exam_id = ?
                LIMIT 1
                `,
                [safeExamId]
            );


        if (examRows.length === 0) {
            throw new Error(
                "Selected exam was not found."
            );
        }


        // ----------------------------------------------------
        // Create attempt
        // ----------------------------------------------------

        const attemptResult =
            await connectionQuery(
                connection,
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
                    0,
                    0,
                    0,
                    CURRENT_TIMESTAMP,
                    NULL
                )
                `,
                [
                    safeStudentId,
                    safeExamId
                ]
            );


        const attemptId =
            attemptResult.insertId;


        let correctAnswers = 0;
        let unansweredAnswers = 0;
        let matchedQuestions = 0;

        const savedQuestions = [];

        const topicStats = new Map();


        // ----------------------------------------------------
        // Process every submitted question
        // ----------------------------------------------------

        for (const answer of answers) {

            const questionId =
                Number(answer.question_id);


            const selectedOptionId =
                answer.selected_option_id === null ||
                answer.selected_option_id === undefined ||
                answer.selected_option_id === ""
                    ? null
                    : Number(
                        answer.selected_option_id
                    );


            if (
                !Number.isInteger(questionId) ||
                questionId <= 0
            ) {
                continue;
            }


            // ------------------------------------------------
            // Find question and verify it belongs to exam
            // ------------------------------------------------

            const questionRows =
                await connectionQuery(
                    connection,
                    `
                    SELECT
                        q.question_id,
                        q.topic_id,
                        q.question_text,
                        q.explanation,
                        t.topic_name,
                        s.subject_name
                    FROM questions q

                    INNER JOIN topics t
                        ON q.topic_id = t.topic_id

                    INNER JOIN subjects s
                        ON t.subject_id = s.subject_id

                    WHERE q.question_id = ?
                    AND s.exam_id = ?

                    LIMIT 1
                    `,
                    [
                        questionId,
                        safeExamId
                    ]
                );


            if (questionRows.length === 0) {
                continue;
            }


            const question =
                questionRows[0];


            matchedQuestions++;


            // ------------------------------------------------
            // Check selected option
            // ------------------------------------------------

            let isCorrect = false;


            if (
                Number.isInteger(
                    selectedOptionId
                )
            ) {

                const optionRows =
                    await connectionQuery(
                        connection,
                        `
                        SELECT
                            option_id,
                            is_correct
                        FROM options
                        WHERE option_id = ?
                        AND question_id = ?
                        LIMIT 1
                        `,
                        [
                            selectedOptionId,
                            questionId
                        ]
                    );


                if (optionRows.length > 0) {

                    isCorrect =
                        Number(
                            optionRows[0].is_correct
                        ) === 1;

                }

            } else {

                unansweredAnswers++;

            }


            if (isCorrect) {
                correctAnswers++;
            }


            // ------------------------------------------------
            // Save answer
            // ------------------------------------------------

            await connectionQuery(
                connection,
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
                ]
            );


            // ------------------------------------------------
            // Topic performance
            // ------------------------------------------------

            const topicId =
                Number(question.topic_id);


            if (!topicStats.has(topicId)) {

                topicStats.set(
                    topicId,
                    {
                        topic_id:
                            topicId,

                        topic_name:
                            question.topic_name,

                        subject_name:
                            question.subject_name,

                        attempted: 0,

                        correct: 0
                    }
                );

            }


            const stats =
                topicStats.get(topicId);


            stats.attempted++;


            if (isCorrect) {
                stats.correct++;
            }


            savedQuestions.push({
                question_id:
                    question.question_id,

                question_text:
                    question.question_text,

                topic_id:
                    question.topic_id,

                topic_name:
                    question.topic_name,

                subject_name:
                    question.subject_name,

                explanation:
                    question.explanation
            });

        }


        // ----------------------------------------------------
        // Calculate result
        // ----------------------------------------------------

        const totalQuestions =
            matchedQuestions;


        const score =
            totalQuestions > 0
                ? Number(
                    (
                        correctAnswers /
                        totalQuestions *
                        100
                    ).toFixed(2)
                )
                : 0;


        const wrongAnswers =
            Math.max(
                0,
                totalQuestions -
                correctAnswers -
                unansweredAnswers
            );


        // ----------------------------------------------------
        // Update attempt
        // ----------------------------------------------------

        await connectionQuery(
            connection,
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
                score,
                totalQuestions,
                correctAnswers,
                attemptId
            ]
        );


        // ----------------------------------------------------
        // Update student_progress
        // ----------------------------------------------------

        for (const stats of topicStats.values()) {

            const existingRows =
                await connectionQuery(
                    connection,
                    `
                    SELECT
                        progress_id,
                        questions_attempted,
                        questions_correct
                    FROM student_progress
                    WHERE student_id = ?
                    AND topic_id = ?
                    LIMIT 1
                    `,
                    [
                        safeStudentId,
                        stats.topic_id
                    ]
                );


            if (existingRows.length > 0) {

                const existing =
                    existingRows[0];


                const attempted =
                    Number(
                        existing.questions_attempted
                    ) +
                    stats.attempted;


                const correct =
                    Number(
                        existing.questions_correct
                    ) +
                    stats.correct;


                const accuracy =
                    attempted > 0
                        ? Number(
                            (
                                correct /
                                attempted *
                                100
                            ).toFixed(2)
                        )
                        : 0;


                await connectionQuery(
                    connection,
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
                        correct,
                        accuracy,
                        accuracy,
                        existing.progress_id
                    ]
                );

            } else {

                const accuracy =
                    stats.attempted > 0
                        ? Number(
                            (
                                stats.correct /
                                stats.attempted *
                                100
                            ).toFixed(2)
                        )
                        : 0;


                await connectionQuery(
                    connection,
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
                    VALUES
                    (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    `,
                    [
                        safeStudentId,
                        stats.topic_id,
                        stats.attempted,
                        stats.correct,
                        accuracy,
                        accuracy
                    ]
                );

            }

        }


        // ----------------------------------------------------
        // Subject performance
        // ----------------------------------------------------

        const subjectPerformance = {};


        for (const stats of topicStats.values()) {

            const subject =
                stats.subject_name;


            if (!subjectPerformance[subject]) {

                subjectPerformance[subject] = {
                    attempted: 0,
                    correct: 0
                };

            }


            subjectPerformance[subject].attempted +=
                stats.attempted;


            subjectPerformance[subject].correct +=
                stats.correct;

        }


        Object.keys(subjectPerformance)
            .forEach(subject => {

                const item =
                    subjectPerformance[subject];

                item.accuracy =
                    item.attempted > 0
                        ? Number(
                            (
                                item.correct /
                                item.attempted *
                                100
                            ).toFixed(2)
                        )
                        : 0;

            });


        // ----------------------------------------------------
        // COMMIT
        // ----------------------------------------------------

        await new Promise(
            (resolve, reject) => {

                connection.commit(
                    error => {

                        if (error) {
                            reject(error);
                        } else {
                            resolve();
                        }

                    }
                );

            }
        );


        connection.release();


        // ----------------------------------------------------
        // Final response
        // ----------------------------------------------------

        return {

            attempt_id:
                attemptId,

            exam_id:
                safeExamId,

            total_questions:
                totalQuestions,

            correct_answers:
                correctAnswers,

            wrong_answers:
                wrongAnswers,

            unanswered_answers:
                unansweredAnswers,

            score:
                score,

            questions:
                savedQuestions,

            subjectPerformance:
                subjectPerformance

        };


    } catch (error) {

        if (connection) {

            try {

                await new Promise(
                    resolve => {

                        connection.rollback(
                            () => resolve()
                        );

                    }
                );

            } catch (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError
                );

            }

            connection.release();

        }


        throw error;
    }
};



// ============================================================
// CONNECTION QUERY HELPER
// ============================================================

function connectionQuery(
    connection,
    sql,
    params = []
) {

    return new Promise(
        (resolve, reject) => {

            connection.query(
                sql,
                params,
                (error, results) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(results);
                    }

                }
            );

        }
    );
}



// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    getQuestionsByTopic,

    getMockTestQuestions,

    submitQuiz

};