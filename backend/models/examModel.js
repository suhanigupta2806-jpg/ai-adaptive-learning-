const db = require('../config/database');

const getAllExams = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT exam_id, exam_name, description, created_at
             FROM exams
             ORDER BY exam_id`,
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

const getExamById = (examId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT exam_id, exam_name, description
             FROM exams
             WHERE exam_id = ?`,
            [examId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0] || null);
                }
            }
        );
    });
};

const getSubjectsByExam = (examId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT subject_id, exam_id, subject_name, description
             FROM subjects
             WHERE exam_id = ?
             ORDER BY subject_id`,
            [examId],
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

const getTopicsBySubject = (subjectId) => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT topic_id, subject_id, topic_name, description
             FROM topics
             WHERE subject_id = ?
             ORDER BY topic_id`,
            [subjectId],
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

module.exports = {
    getAllExams,
    getExamById,
    getSubjectsByExam,
    getTopicsBySubject
};