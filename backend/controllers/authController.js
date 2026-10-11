const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    findStudentByEmail,
    createStudent,
    findStudentById,
    updateStudentProfile,
    updateStudentPassword
} = require('../models/authModel');


// ============================================================
// REGISTER STUDENT
// ============================================================

const registerStudent = async (req, res) => {

    try {

        const name =
            String(req.body.name || '').trim();

        const email =
            String(req.body.email || '')
                .trim()
                .toLowerCase();

        const password =
            String(req.body.password || '');

        const targetExam =
            String(req.body.target_exam || '').trim();


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !name ||
            !email ||
            !password ||
            !targetExam
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Name, email, password and target exam are required'

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    'Password must contain at least 6 characters'

            });

        }


        const validExams = [

            'ESIC UDC',

            'OICL Assistant',

            'NIACL Assistant'

        ];


        if (!validExams.includes(targetExam)) {

            return res.status(400).json({

                success: false,

                message:
                    'Please select a valid target exam'

            });

        }


        // ----------------------------------------------------
        // CHECK EMAIL
        // ----------------------------------------------------

        const existingStudent =
            await findStudentByEmail(email);


        if (existingStudent) {

            return res.status(409).json({

                success: false,

                message:
                    'Email already registered'

            });

        }


        // ----------------------------------------------------
        // HASH PASSWORD
        // ----------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ----------------------------------------------------
        // CREATE STUDENT
        // ----------------------------------------------------

        const studentId =
            await createStudent(
                name,
                email,
                targetExam,
                hashedPassword
            );


        // ----------------------------------------------------
        // CREATE JWT
        // ----------------------------------------------------

        const token =
            jwt.sign(

                {
                    student_id:
                        studentId,

                    email:
                        email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        '7d'
                }

            );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        res.status(201).json({

            success: true,

            message:
                'Registration successful',

            token,

            student: {

                student_id:
                    studentId,

                name:
                    name,

                email:
                    email,

                target_exam:
                    targetExam,

                xp:
                    0,

                streak:
                    0

            }

        });

    }

    catch (error) {

        console.error(
            'Registration error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Registration failed',

            error:
                error.message

        });

    }

};


// ============================================================
// LOGIN STUDENT
// ============================================================

const loginStudent = async (req, res) => {

    try {

        const email =
            String(req.body.email || '')
                .trim()
                .toLowerCase();

        const password =
            String(req.body.password || '');


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    'Email and password are required'

            });

        }


        // ----------------------------------------------------
        // FIND STUDENT
        // ----------------------------------------------------

        const student =
            await findStudentByEmail(email);


        if (!student) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password'

            });

        }


        // ----------------------------------------------------
        // CHECK PASSWORD
        // ----------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                student.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    'Invalid email or password'

            });

        }


        // ----------------------------------------------------
        // CREATE JWT
        // ----------------------------------------------------

        const token =
            jwt.sign(

                {
                    student_id:
                        student.student_id,

                    email:
                        student.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        '7d'
                }

            );


        // ----------------------------------------------------
        // RESPONSE
        // ----------------------------------------------------

        res.json({

            success: true,

            message:
                'Login successful',

            token,

            student: {

                student_id:
                    student.student_id,

                name:
                    student.name,

                email:
                    student.email,

                target_exam:
                    student.target_exam || '',

                xp:
                    Number(student.xp || 0),

                streak:
                    Number(student.streak || 0)

            }

        });

    }

    catch (error) {

        console.error(
            'Login error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Login failed',

            error:
                error.message

        });

    }

};


// ============================================================
// GET PROFILE
// ============================================================

const getProfile = async (req, res) => {

    try {

        const student =
            await findStudentById(
                req.student.student_id
            );


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    'Student not found'

            });

        }


        res.json({

            success: true,

            student:
                student

        });

    }

    catch (error) {

        console.error(
            'Get profile error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Could not fetch profile',

            error:
                error.message

        });

    }

};


// ============================================================
// UPDATE PROFILE
// ============================================================

const updateProfile = async (req, res) => {

    try {

        const studentId =
            req.student.student_id;


        const name =
            String(req.body.name || '')
                .trim();


        const email =
            String(req.body.email || '')
                .trim()
                .toLowerCase();


        if (!name || !email) {

            return res.status(400).json({

                success: false,

                message:
                    'Name and email are required'

            });

        }


        const existingStudent =
            await findStudentByEmail(email);


        if (
            existingStudent &&
            Number(existingStudent.student_id) !==
            Number(studentId)
        ) {

            return res.status(409).json({

                success: false,

                message:
                    'Email is already used by another account'

            });

        }


        await updateStudentProfile(

            studentId,

            name,

            email

        );


        const updatedStudent =
            await findStudentById(
                studentId
            );


        if (!updatedStudent) {

            return res.status(404).json({

                success: false,

                message:
                    'Student not found'

            });

        }


        const token =
            jwt.sign(

                {
                    student_id:
                        updatedStudent.student_id,

                    email:
                        updatedStudent.email
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        '7d'
                }

            );


        res.json({

            success: true,

            message:
                'Profile updated successfully',

            token:

                token,

            student:
                updatedStudent

        });

    }

    catch (error) {

        console.error(
            'Update profile error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Could not update profile',

            error:
                error.message

        });

    }

};


// ============================================================
// FORGOT PASSWORD
// ============================================================
//
// This is a project/demo password reset.
// The user verifies the registered email and
// chooses a new password.
//
// For a production system, OTP/email verification
// should be added.
// ============================================================

const forgotPassword = async (req, res) => {

    try {

        const email =
            String(req.body.email || '')
                .trim()
                .toLowerCase();

        const newPassword =
            String(req.body.new_password || '');

        const confirmPassword =
            String(req.body.confirm_password || '');


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !email ||
            !newPassword ||
            !confirmPassword
        ) {

            return res.status(400).json({

                success: false,

                message:
                    'Email, new password and confirm password are required'

            });

        }


        if (newPassword.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    'New password must contain at least 6 characters'

            });

        }


        if (newPassword !== confirmPassword) {

            return res.status(400).json({

                success: false,

                message:
                    'Passwords do not match'

            });

        }


        // ----------------------------------------------------
        // FIND ACCOUNT
        // ----------------------------------------------------

        const student =
            await findStudentByEmail(email);


        if (!student) {

            return res.status(404).json({

                success: false,

                message:
                    'No account found with this email address'

            });

        }


        // ----------------------------------------------------
        // HASH NEW PASSWORD
        // ----------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );


        // ----------------------------------------------------
        // UPDATE PASSWORD
        // ----------------------------------------------------

        await updateStudentPassword(

            student.student_id,

            hashedPassword

        );


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        res.json({

            success: true,

            message:
                'Password reset successfully'

        });

    }

    catch (error) {

        console.error(
            'Forgot password error:',
            error
        );


        res.status(500).json({

            success: false,

            message:
                'Could not reset password',

            error:
                error.message

        });

    }

};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

    registerStudent,

    loginStudent,

    getProfile,

    updateProfile,

    forgotPassword

};