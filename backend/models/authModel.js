const db = require('../config/database');


// ============================================================
// FIND STUDENT BY EMAIL
// ============================================================

const findStudentByEmail = (email) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT *
            FROM students
            WHERE email = ?
            LIMIT 1
            `,
            [email],

            (err, results) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(
                        results[0] || null
                    );

                }

            }
        );

    });

};


// ============================================================
// CREATE STUDENT
// ============================================================

const createStudent = (
    name,
    email,
    targetExam,
    password
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            INSERT INTO students
            (
                name,
                email,
                target_exam,
                password
            )
            VALUES (?, ?, ?, ?)
            `,
            [
                name,
                email,
                targetExam,
                password
            ],

            (err, result) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(
                        result.insertId
                    );

                }

            }
        );

    });

};


// ============================================================
// FIND STUDENT BY ID
// ============================================================

const findStudentById = (studentId) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            SELECT
                student_id,
                name,
                email,
                target_exam,
                xp,
                streak,
                created_at
            FROM students
            WHERE student_id = ?
            LIMIT 1
            `,
            [studentId],

            (err, results) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(
                        results[0] || null
                    );

                }

            }
        );

    });

};


// ============================================================
// UPDATE STUDENT PROFILE
// ============================================================

const updateStudentProfile = (
    studentId,
    name,
    email
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            UPDATE students
            SET
                name = ?,
                email = ?
            WHERE student_id = ?
            `,
            [
                name,
                email,
                studentId
            ],

            (err, result) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(result);

                }

            }
        );

    });

};


// ============================================================
// UPDATE PASSWORD
// ============================================================

const updateStudentPassword = (
    studentId,
    hashedPassword
) => {

    return new Promise((resolve, reject) => {

        db.query(
            `
            UPDATE students
            SET password = ?
            WHERE student_id = ?
            `,
            [
                hashedPassword,
                studentId
            ],

            (err, result) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(result);

                }

            }
        );

    });

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    findStudentByEmail,

    createStudent,

    findStudentById,

    updateStudentProfile,

    updateStudentPassword

};