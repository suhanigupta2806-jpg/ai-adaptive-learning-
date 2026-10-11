const express = require("express");

const {
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
} = require("../controllers/adminController");

const authenticateAdmin =
    require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/login", adminLogin);

router.get(
    "/dashboard",
    authenticateAdmin,
    dashboard
);

router.get(
    "/students",
    authenticateAdmin,
    students
);

router.get(
    "/exams",
    authenticateAdmin,
    exams
);

router.post(
    "/exams",
    authenticateAdmin,
    addExam
);

router.delete(
    "/exams/:id",
    authenticateAdmin,
    removeExam
);

router.get(
    "/subjects",
    authenticateAdmin,
    subjects
);

router.post(
    "/subjects",
    authenticateAdmin,
    addSubject
);

router.delete(
    "/subjects/:id",
    authenticateAdmin,
    removeSubject
);

router.get(
    "/topics",
    authenticateAdmin,
    topics
);

router.post(
    "/topics",
    authenticateAdmin,
    addTopic
);

router.delete(
    "/topics/:id",
    authenticateAdmin,
    removeTopic
);

router.get(
    "/questions",
    authenticateAdmin,
    questions
);

router.post(
    "/questions",
    authenticateAdmin,
    addQuestion
);

router.delete(
    "/questions/:id",
    authenticateAdmin,
    removeQuestion
);

module.exports = router;