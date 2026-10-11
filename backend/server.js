require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const quizRoutes = require("./routes/quizRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const studyPlanRoutes = require("./routes/studyPlanRoutes");
const miscRoutes = require("./routes/miscRoutes");
const adaptiveRoutes = require("./routes/adaptiveRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: "*"
    })
);

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// ============================================================
// DATABASE CHECK
// ============================================================

db.query("SELECT 1", (error) => {

    if (error) {
        console.error(
            "Database connection failed:",
            error.message
        );
    } else {
        console.log(
            "MySQL database connected successfully"
        );
    }

});


// ============================================================
// ROUTES
// ============================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/exams",
    examRoutes
);

app.use(
    "/api/quiz",
    quizRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api/challenges",
    challengeRoutes
);

app.use(
    "/api/study-plans",
    studyPlanRoutes
);

app.use(
    "/api/misc",
    miscRoutes
);

app.use(
    "/api/adaptive",
    adaptiveRoutes
);


// ============================================================
// ADMIN
// ============================================================

app.use(
    "/api/admin",
    adminRoutes
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message:
            "AI Adaptive Learning API is running"
    });

});


// ============================================================
// 404
// ============================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// ============================================================
// ERROR HANDLER
// ============================================================

app.use((error, req, res, next) => {

    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });

});


// ============================================================
// START SERVER
// ============================================================

app.listen(
    PORT,
    () => {

        console.log(
            `Server running on http://localhost:${PORT}`
        );

    }
);