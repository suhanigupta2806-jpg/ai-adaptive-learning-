const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
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
} = require("../models/adminModel");


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const admin = await getAdminByEmail(email);

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const valid = await bcrypt.compare(
            password,
            admin.password
        );

        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            {
                admin_id: admin.admin_id,
                email: admin.email,
                role: "admin"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            success: true,
            token,
            admin: {
                admin_id: admin.admin_id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Admin login failed"
        });
    }
};


const dashboard = async (req, res) => {
    try {
        const stats = await getStats();

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load admin dashboard",
            error: error.message
        });
    }
};


const students = async (req, res) => {
    try {
        res.json({
            success: true,
            students: await getStudents()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load students"
        });
    }
};


const exams = async (req, res) => {
    try {
        res.json({
            success: true,
            exams: await getExams()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load exams"
        });
    }
};


const addExam = async (req, res) => {
    try {
        const { exam_name, description } = req.body;

        if (!exam_name) {
            return res.status(400).json({
                success: false,
                message: "Exam name is required"
            });
        }

        const examId = await createExam(
            exam_name,
            description
        );

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            exam_id: examId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create exam",
            error: error.message
        });
    }
};


const removeExam = async (req, res) => {
    try {
        await deleteExam(req.params.id);

        res.json({
            success: true,
            message: "Exam deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete exam",
            error: error.message
        });
    }
};


const subjects = async (req, res) => {
    try {
        res.json({
            success: true,
            subjects: await getSubjects()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load subjects"
        });
    }
};


const addSubject = async (req, res) => {
    try {
        const {
            exam_id,
            subject_name,
            description
        } = req.body;

        if (!exam_id || !subject_name) {
            return res.status(400).json({
                success: false,
                message: "Exam and subject name are required"
            });
        }

        const subjectId = await createSubject(
            exam_id,
            subject_name,
            description
        );

        res.status(201).json({
            success: true,
            message: "Subject created successfully",
            subject_id: subjectId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create subject",
            error: error.message
        });
    }
};


const removeSubject = async (req, res) => {
    try {
        await deleteSubject(req.params.id);

        res.json({
            success: true,
            message: "Subject deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete subject",
            error: error.message
        });
    }
};


const topics = async (req, res) => {
    try {
        res.json({
            success: true,
            topics: await getTopics()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load topics"
        });
    }
};


const addTopic = async (req, res) => {
    try {
        const {
            subject_id,
            topic_name,
            description
        } = req.body;

        if (!subject_id || !topic_name) {
            return res.status(400).json({
                success: false,
                message: "Subject and topic name are required"
            });
        }

        const topicId = await createTopic(
            subject_id,
            topic_name,
            description
        );

        res.status(201).json({
            success: true,
            message: "Topic created successfully",
            topic_id: topicId
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create topic"
        });
    }
};


const removeTopic = async (req, res) => {
    try {
        await deleteTopic(req.params.id);

        res.json({
            success: true,
            message: "Topic deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete topic"
        });
    }
};


const questions = async (req, res) => {
    try {
        res.json({
            success: true,
            questions: await getQuestions()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to load questions"
        });
    }
};


const addQuestion = async (req, res) => {
    try {
        const {
            topic_id,
            question_text,
            difficulty,
            explanation,
            options,
            correct_index
        } = req.body;

        if (
            !topic_id ||
            !question_text ||
            !Array.isArray(options) ||
            options.length !== 4 ||
            correct_index === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Topic, question, four options and correct answer are required"
            });
        }

        const questionId = await createQuestion(
            topic_id,
            question_text,
            difficulty,
            explanation,
            options,
            correct_index
        );

        res.status(201).json({
            success: true,
            message: "Question created successfully",
            question_id: questionId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to create question",
            error: error.message
        });
    }
};


const removeQuestion = async (req, res) => {
    try {
        await deleteQuestion(req.params.id);

        res.json({
            success: true,
            message: "Question deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete question"
        });
    }
};


module.exports = {
    adminLogin,
    dashboard,
    students,
    exams,
    addExam,
    removeExam,
    subjects,
    addSubject,
    removeSubject,
    topics,
    addTopic,
    removeTopic,
    questions,
    addQuestion,
    removeQuestion
};