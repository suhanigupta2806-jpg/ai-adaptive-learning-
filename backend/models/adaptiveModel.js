const db = require("../config/database");

// ============================================================
// GET ADAPTIVE QUESTIONS
// ============================================================

const getAdaptiveQuestions = (
    studentId,
    examId,
    limit = 10
) => {

    return new Promise((resolve, reject) => {

        // ==================================================
        // STEP 1
        // GET STUDENT PERFORMANCE
        // ==================================================

        const performanceSql = `

            SELECT
                sp.topic_id,
                sp.accuracy

            FROM student_progress sp

            JOIN topics t
                ON sp.topic_id = t.topic_id

            JOIN subjects s
                ON t.subject_id = s.subject_id

            WHERE
                sp.student_id = ?
                AND s.exam_id = ?

            ORDER BY
                sp.accuracy ASC

        `;

        db.query(
            performanceSql,
            [
                studentId,
                examId
            ],
            (performanceError, performanceRows) => {

                if (performanceError) {
                    return reject(performanceError);
                }

                // ==================================================
                // STEP 2
                // CLASSIFY PERFORMANCE
                // ==================================================

                const weakTopics =
                    performanceRows.filter(
                        row => Number(row.accuracy) < 60
                    );

                const improvementTopics =
                    performanceRows.filter(row => {

                        const accuracy =
                            Number(row.accuracy);

                        return (
                            accuracy >= 60 &&
                            accuracy < 70
                        );

                    });

                const strongTopics =
                    performanceRows.filter(
                        row => Number(row.accuracy) >= 70
                    );

                // ==================================================
                // STEP 3
                // GET ALL TOPICS FOR THIS EXAM
                // ==================================================

                const topicSql = `

                    SELECT
                        t.topic_id,
                        t.topic_name,
                        s.subject_id,
                        s.subject_name

                    FROM topics t

                    JOIN subjects s
                        ON t.subject_id = s.subject_id

                    WHERE
                        s.exam_id = ?

                    ORDER BY
                        s.subject_id,
                        t.topic_id

                `;

                db.query(
                    topicSql,
                    [examId],
                    (topicError, topicRows) => {

                        if (topicError) {
                            return reject(topicError);
                        }

                        if (
                            !topicRows ||
                            topicRows.length === 0
                        ) {

                            return resolve({
                                questions: [],
                                strategy: "balanced",
                                focused_topics: []
                            });

                        }

                        // ==================================================
                        // STEP 4
                        // BUILD PRIORITY MAP
                        // ==================================================

                        const weakIds =
                            new Set(
                                weakTopics.map(
                                    row => Number(row.topic_id)
                                )
                            );

                        const improvementIds =
                            new Set(
                                improvementTopics.map(
                                    row => Number(row.topic_id)
                                )
                            );

                        const strongIds =
                            new Set(
                                strongTopics.map(
                                    row => Number(row.topic_id)
                                )
                            );

                        /*
                         * Priority:
                         *
                         * 1 = weak
                         * 2 = improving
                         * 3 = no history
                         * 4 = strong
                         */

                        const prioritizedTopics =
                            topicRows
                                .map(topic => {

                                    const id =
                                        Number(topic.topic_id);

                                    let priority;

                                    if (weakIds.has(id)) {
                                        priority = 1;
                                    }
                                    else if (
                                        improvementIds.has(id)
                                    ) {
                                        priority = 2;
                                    }
                                    else if (
                                        strongIds.has(id)
                                    ) {
                                        priority = 4;
                                    }
                                    else {
                                        priority = 3;
                                    }

                                    return {
                                        ...topic,
                                        priority
                                    };

                                })
                                .sort((a, b) => {

                                    return (
                                        a.priority -
                                        b.priority
                                    );

                                });

                        const selectedTopicIds =
                            prioritizedTopics.map(
                                topic =>
                                    Number(topic.topic_id)
                            );

                        if (selectedTopicIds.length === 0) {
                            return resolve({
                                questions: [],
                                strategy: "balanced",
                                focused_topics: []
                            });
                        }

                        // ==================================================
                        // STEP 5
                        // BUILD PLACEHOLDERS
                        // ==================================================

                        const placeholders =
                            selectedTopicIds
                                .map(() => "?")
                                .join(",");

                        // ==================================================
                        // DIFFICULTY ORDER
                        // ==================================================

                        let difficultyOrder;

                        if (weakTopics.length > 0) {

                            difficultyOrder = `

                                CASE

                                    WHEN q.difficulty = 'Easy'
                                        THEN 1

                                    WHEN q.difficulty = 'Medium'
                                        THEN 2

                                    WHEN q.difficulty = 'Hard'
                                        THEN 3

                                    ELSE 4

                                END

                            `;

                        }
                        else if (
                            improvementTopics.length > 0
                        ) {

                            difficultyOrder = `

                                CASE

                                    WHEN q.difficulty = 'Medium'
                                        THEN 1

                                    WHEN q.difficulty = 'Easy'
                                        THEN 2

                                    WHEN q.difficulty = 'Hard'
                                        THEN 3

                                    ELSE 4

                                END

                            `;

                        }
                        else {

                            difficultyOrder = `

                                CASE

                                    WHEN q.difficulty = 'Medium'
                                        THEN 1

                                    WHEN q.difficulty = 'Hard'
                                        THEN 2

                                    WHEN q.difficulty = 'Easy'
                                        THEN 3

                                    ELSE 4

                                END

                            `;

                        }

                        // ==================================================
                        // TOPIC PRIORITY
                        // ==================================================

                        const topicPrioritySql = `

                            CASE

                                ${prioritizedTopics
                                    .map(topic => `

                                        WHEN q.topic_id =
                                            ${Number(topic.topic_id)}
                                        THEN ${topic.priority}

                                    `)
                                    .join("")}

                                ELSE 5

                            END

                        `;

                        // ==================================================
                        // STEP 6
                        // GET QUESTIONS
                        //
                        // IMPORTANT:
                        // Duplicate question_text inside the SAME TOPIC
                        // is removed before the adaptive quiz receives it.
                        // ==================================================

                        const questionSql = `

                            SELECT
                                q.question_id,
                                q.topic_id,
                                q.question_text,
                                q.difficulty,
                                q.explanation,
                                t.topic_name,
                                s.subject_name

                            FROM questions q

                            JOIN topics t
                                ON q.topic_id = t.topic_id

                            JOIN subjects s
                                ON t.subject_id = s.subject_id

                            WHERE
                                s.exam_id = ?

                                AND q.topic_id IN (
                                    ${placeholders}
                                )

                                AND q.question_id IN (

                                    SELECT
                                        MIN(q2.question_id)

                                    FROM questions q2

                                    JOIN topics t2
                                        ON q2.topic_id =
                                           t2.topic_id

                                    JOIN subjects s2
                                        ON t2.subject_id =
                                           s2.subject_id

                                    WHERE
                                        s2.exam_id = ?

                                        AND q2.topic_id IN (
                                            ${placeholders}
                                        )

                                    GROUP BY
                                        q2.topic_id,
                                        q2.question_text

                                )

                            ORDER BY
                                ${topicPrioritySql},
                                ${difficultyOrder},
                                RAND()

                            LIMIT ?

                        `;

                        const safeLimit =
                            Math.min(
                                Math.max(
                                    Number(limit) || 10,
                                    1
                                ),
                                30
                            );

                        const params = [

                            Number(examId),

                            ...selectedTopicIds,

                            Number(examId),

                            ...selectedTopicIds,

                            safeLimit

                        ];

                        // ==================================================
                        // STEP 7
                        // GET QUESTIONS
                        // ==================================================

                        db.query(
                            questionSql,
                            params,
                            async (
                                questionError,
                                questionRows
                            ) => {

                                if (questionError) {
                                    return reject(
                                        questionError
                                    );
                                }

                                try {

                                    const finalQuestions = [];

                                    // ==================================================
                                    // STEP 8
                                    // LOAD OPTIONS USING question_id
                                    // ==================================================

                                    for (
                                        const question
                                        of questionRows
                                    ) {

                                        const options =
                                            await new Promise(
                                                (
                                                    resolveOptions,
                                                    rejectOptions
                                                ) => {

                                                    db.query(

                                                        `

                                                            SELECT
                                                                option_id,
                                                                option_text

                                                            FROM options

                                                            WHERE
                                                                question_id = ?

                                                            ORDER BY
                                                                option_id

                                                        `,

                                                        [
                                                            question.question_id
                                                        ],

                                                        (
                                                            optionError,
                                                            optionRows
                                                        ) => {

                                                            if (
                                                                optionError
                                                            ) {

                                                                return rejectOptions(
                                                                    optionError
                                                                );

                                                            }

                                                            resolveOptions(
                                                                optionRows || []
                                                            );

                                                        }

                                                    );

                                                }
                                            );

                                        // ==================================================
                                        // ONLY QUESTIONS WITH VALID OPTIONS
                                        // ==================================================

                                        if (
                                            options.length >= 2
                                        ) {

                                            finalQuestions.push({

                                                ...question,

                                                options

                                            });

                                        }

                                    }

                                    // ==================================================
                                    // STEP 9
                                    // DETERMINE STRATEGY
                                    // ==================================================

                                    let strategy =
                                        "balanced";

                                    if (
                                        weakTopics.length > 0
                                    ) {

                                        strategy =
                                            "weak_topic_focus";

                                    }
                                    else if (
                                        improvementTopics.length > 0
                                    ) {

                                        strategy =
                                            "improvement_focus";

                                    }

                                    // ==================================================
                                    // STEP 10
                                    // RETURN RESULT
                                    // ==================================================

                                    resolve({

                                        questions:
                                            finalQuestions,

                                        strategy,

                                        focused_topics:
                                            prioritizedTopics
                                                .filter(
                                                    topic =>
                                                        topic.priority <= 2
                                                )
                                                .map(
                                                    topic =>
                                                        Number(
                                                            topic.topic_id
                                                        )
                                                )

                                    });

                                }
                                catch (error) {

                                    reject(error);

                                }

                            }

                        );

                    }

                );

            }

        );

    });

};


// ============================================================
// EXPORT
// ============================================================

module.exports = {
    getAdaptiveQuestions
};