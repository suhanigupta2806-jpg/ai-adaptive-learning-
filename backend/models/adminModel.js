const db = require("../config/database");

const getAdminByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT admin_id, name, email, password
             FROM admins
             WHERE email = ?
             LIMIT 1`,
            [email],
            (err, results) => {
                if (err) reject(err);
                else resolve(results[0] || null);
            }
        );
    });
};

const getStats = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM students) AS students,
                (SELECT COUNT(*) FROM exams) AS exams,
                (SELECT COUNT(*) FROM subjects) AS subjects,
                (SELECT COUNT(*) FROM topics) AS topics,
                (SELECT COUNT(*) FROM questions) AS questions
        `;

        db.query(sql, (err, results) => {
            if (err) reject(err);
            else resolve(results[0]);
        });
    });
};

const getStudents = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT student_id, name, email, xp, streak, created_at
             FROM students
             ORDER BY student_id DESC`,
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

const getExams = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT exam_id, exam_name, description, created_at
             FROM exams
             ORDER BY exam_id`,
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

const createExam = (examName, description) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO exams (exam_name, description)
             VALUES (?, ?)`,
            [examName, description || null],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            }
        );
    });
};

const deleteExam = (examId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM exams WHERE exam_id = ?`,
            [examId],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            }
        );
    });
};

const getSubjects = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
                s.subject_id,
                s.subject_name,
                s.description,
                e.exam_id,
                e.exam_name
             FROM subjects s
             JOIN exams e ON e.exam_id = s.exam_id
             ORDER BY s.subject_id`,
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

const createSubject = (examId, name, description) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO subjects
             (exam_id, subject_name, description)
             VALUES (?, ?, ?)`,
            [examId, name, description || null],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            }
        );
    });
};

const deleteSubject = (subjectId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM subjects WHERE subject_id = ?`,
            [subjectId],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            }
        );
    });
};

const getTopics = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
                t.topic_id,
                t.topic_name,
                t.description,
                s.subject_id,
                s.subject_name,
                e.exam_id,
                e.exam_name
             FROM topics t
             JOIN subjects s ON s.subject_id = t.subject_id
             JOIN exams e ON e.exam_id = s.exam_id
             ORDER BY t.topic_id`,
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

const createTopic = (subjectId, name, description) => {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO topics
             (subject_id, topic_name, description)
             VALUES (?, ?, ?)`,
            [subjectId, name, description || null],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            }
        );
    });
};

const deleteTopic = (topicId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM topics WHERE topic_id = ?`,
            [topicId],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            }
        );
    });
};

const getQuestions = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT
                q.question_id,
                q.question_text,
                q.difficulty,
                q.explanation,
                t.topic_id,
                t.topic_name,
                s.subject_name,
                e.exam_name,
                (
                    SELECT o.option_text
                    FROM options o
                    WHERE o.question_id = q.question_id
                      AND o.is_correct = TRUE
                    LIMIT 1
                ) AS correct_option
             FROM questions q
             JOIN topics t ON t.topic_id = q.topic_id
             JOIN subjects s ON s.subject_id = t.subject_id
             JOIN exams e ON e.exam_id = s.exam_id
             ORDER BY q.question_id DESC`,
            (err, results) => {
                if (err) reject(err);
                else resolve(results);
            }
        );
    });
};

const createQuestion = async (
    topicId,
    questionText,
    difficulty,
    explanation,
    options,
    correctIndex
) => {
    const connection = await db.promise().getConnection();

    try {
        await connection.beginTransaction();

        const [questionResult] = await connection.query(
            `INSERT INTO questions
             (topic_id, question_text, difficulty, explanation)
             VALUES (?, ?, ?, ?)`,
            [
                topicId,
                questionText,
                difficulty || "Medium",
                explanation || null
            ]
        );

        const questionId = questionResult.insertId;

        for (let i = 0; i < options.length; i++) {
            await connection.query(
                `INSERT INTO options
                 (question_id, option_text, is_correct)
                 VALUES (?, ?, ?)`,
                [
                    questionId,
                    options[i],
                    i === Number(correctIndex)
                ]
            );
        }

        await connection.commit();

        return questionId;

    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteQuestion = (questionId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `DELETE FROM questions WHERE question_id = ?`,
            [questionId],
            (err, result) => {
                if (err) reject(err);
                else resolve(result.affectedRows);
            }
        );
    });
};

module.exports = {
    getAdminByEmail,
    getStats,
    getStudents,
    getExams,
    createExam,
    deleteExam,
    getSubjects,
    createSubject,
    deleteSubject,
    getTopics,
    createTopic,
    deleteTopic,
    getQuestions,
    createQuestion,
    deleteQuestion
};