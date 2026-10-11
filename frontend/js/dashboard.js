"use strict";

/* =========================================================
   ADAPTIVELEARN DASHBOARD
   LIVE DATA + DASHBOARD NAVIGATION
   ========================================================= */

const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "adaptiveLearnToken";
const USER_KEY = "adaptiveLearnUser";

let dashboardData = {
    student: {
        name: "Student",
        email: "",
        exam: ""
    },

    stats: {
        progress: 0,
        streak: 0,
        xp: 0,
        accuracy: 0,
        quizzes: 0
    },

    mastery: {},

    timeline: [],

    badges: []
};


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    clearDemoValues();

    setupNavigation();

    setupDashboardInteractions();

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    await loadDashboard();
});


/* =========================================================
   CLEAR OLD DEMO VALUES
   ========================================================= */

function clearDemoValues() {

    document
        .querySelectorAll(".stat-card .stat-value")
        .forEach(function (element) {
            element.textContent = "—";
        });

    document
        .querySelectorAll(".weak-area .weak-info strong")
        .forEach(function (element) {
            element.textContent = "—";
        });

    document
        .querySelectorAll(".weak-area .progress-fill")
        .forEach(function (bar) {
            bar.style.width = "0%";
        });

    document
        .querySelectorAll(".chart .chart-bar")
        .forEach(function (bar) {
            bar.style.height = "0%";
        });
}


/* =========================================================
   LOAD DASHBOARD FROM BACKEND
   ========================================================= */

async function loadDashboard() {

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/dashboard/`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json"
                }
            }
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {
            handleAuthenticationFailure();
            return;
        }

        const data = await response.json();

        if (
            !response.ok ||
            !data.success ||
            !data.dashboard
        ) {
            throw new Error(
                data.message || "Failed to load dashboard"
            );
        }

        mapDashboardData(data.dashboard);

        renderDashboard();

    } catch (error) {

        console.error(
            "Dashboard API error:",
            error
        );

        showToast(
            "Unable to load live dashboard data. Make sure the backend is running."
        );
    }
}


/* =========================================================
   MAP BACKEND DATA
   ========================================================= */

function mapDashboardData(data) {

    const student = data.student || {};
    const quizStats = data.quiz_stats || {};

    const progressRows = data.progress || [];

    let totalAttempted = 0;
    let totalCorrect = 0;

    progressRows.forEach(function (item) {

        totalAttempted +=
            Number(item.questions_attempted) || 0;

        totalCorrect +=
            Number(item.questions_correct) || 0;
    });

    const accuracy =
        totalAttempted > 0
            ? Math.round(
                (totalCorrect / totalAttempted) * 100
            )
            : Math.round(
                Number(quizStats.average_score) || 0
            );

    dashboardData.student = {

        name:
            student.name ||
            "Student",

        email:
            student.email ||
            "",

        exam:
            getSelectedExamName() ||
            "Adaptive Learning"
    };

    dashboardData.stats = {

        progress: accuracy,

        streak:
            Number(student.streak) || 0,

        xp:
            Number(student.xp) || 0,

        accuracy: accuracy,

        quizzes:
            Number(quizStats.total_quizzes) || 0
    };


    /* =====================================================
       SUBJECT PERFORMANCE
       ===================================================== */

    dashboardData.mastery = {};

    progressRows.forEach(function (item) {

        const subject =
            item.subject_name || "Other";

        if (!dashboardData.mastery[subject]) {

            dashboardData.mastery[subject] = {

                attempted: 0,

                correct: 0,

                accuracy: 0,

                topics: []
            };
        }

        const group =
            dashboardData.mastery[subject];

        group.attempted +=
            Number(item.questions_attempted) || 0;

        group.correct +=
            Number(item.questions_correct) || 0;

        group.topics.push(item);

        group.accuracy =
            group.attempted > 0
                ? Math.round(
                    (group.correct / group.attempted) * 100
                )
                : 0;
    });


    dashboardData.timeline =
        Array.isArray(data.timeline)
            ? data.timeline
            : [];


    dashboardData.badges =
        Array.isArray(data.badges)
            ? data.badges
            : [];
}


/* =========================================================
   GET SELECTED EXAM
   ========================================================= */

function getSelectedExamName() {

    try {

        const user =
            JSON.parse(
                localStorage.getItem(USER_KEY) || "null"
            );

        if (!user) {
            return "";
        }

        return (
            user.exam_name ||
            user.target_exam ||
            user.exam ||
            ""
        );

    } catch (error) {

        return "";
    }
}


/* =========================================================
   RENDER DASHBOARD
   ========================================================= */

function renderDashboard() {

    updateStudentInformation();

    updateStats();

    updateMastery();

    updateTimeline();

    updateAchievements();

    updatePerformanceChart();
}


/* =========================================================
   STUDENT INFORMATION
   ========================================================= */

function updateStudentInformation() {

    const heading =
        document.querySelector(".top-header h1");

    if (heading) {

        heading.textContent =
            `Good morning, ${dashboardData.student.name}! 👋`;
    }


    const profileName =
        document.querySelector(".profile-info strong");

    if (profileName) {

        profileName.textContent =
            dashboardData.student.name;
    }


    const profileExam =
        document.querySelector(".profile-info small");

    if (profileExam) {

        profileExam.textContent =
            dashboardData.student.exam;
    }


    const avatar =
        document.querySelector(".avatar");

    if (avatar) {

        avatar.textContent =
            dashboardData.student.name
                .trim()
                .charAt(0)
                .toUpperCase() || "S";
    }
}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStats() {

    const values =
        document.querySelectorAll(
            ".stat-card .stat-value"
        );

    if (values.length >= 4) {

        values[0].textContent =
            `${dashboardData.stats.progress}%`;

        values[1].textContent =
            `${dashboardData.stats.streak} ${
                dashboardData.stats.streak === 1
                    ? "Day"
                    : "Days"
            }`;

        values[2].textContent =
            dashboardData.stats.xp.toLocaleString();

        values[3].textContent =
            `${dashboardData.stats.accuracy}%`;
    }


    const changes =
        document.querySelectorAll(
            ".stat-card .stat-change"
        );

    if (changes[0]) {

        changes[0].textContent =
            `${dashboardData.stats.quizzes} completed quiz${
                dashboardData.stats.quizzes === 1
                    ? ""
                    : "zes"
            }`;
    }

    if (changes[1]) {

        changes[1].textContent =
            dashboardData.stats.streak > 0
                ? "Keep it going! 🔥"
                : "Start your streak today!";
    }

    if (changes[2]) {

        changes[2].textContent =
            "Earn XP through quizzes and challenges";
    }

    if (changes[3]) {

        changes[3].textContent =
            `${dashboardData.stats.accuracy}% overall accuracy`;
    }
}


/* =========================================================
   UPDATE SUBJECT / WEAK AREAS
   ========================================================= */

function updateMastery() {

    const weakAreas =
        document.querySelectorAll(".weak-area");

    const subjects = [
        "Quantitative Aptitude",
        "Reasoning Ability",
        "English Language",
        "General Awareness"
    ];

    weakAreas.forEach(function (area, index) {

        const subject =
            subjects[index];

        const subjectData =
            dashboardData.mastery[subject];

        const accuracy =
            subjectData
                ? Number(subjectData.accuracy) || 0
                : 0;


        const label =
            area.querySelector(
                ".weak-info span:first-child"
            );

        const percentage =
            area.querySelector(
                ".weak-info strong"
            );

        const progress =
            area.querySelector(
                ".progress-fill"
            );


        if (label) {
            label.textContent = subject;
        }

        if (percentage) {
            percentage.textContent =
                `${accuracy}%`;
        }

        if (progress) {

            progress.style.width =
                `${accuracy}%`;

            progress.classList.remove(
                "red-fill",
                "orange-fill",
                "yellow-fill",
                "green-fill"
            );

            if (accuracy < 50) {

                progress.classList.add(
                    "red-fill"
                );

            } else if (accuracy < 60) {

                progress.classList.add(
                    "orange-fill"
                );

            } else if (accuracy < 70) {

                progress.classList.add(
                    "yellow-fill"
                );

            } else {

                progress.classList.add(
                    "green-fill"
                );
            }
        }
    });
}


/* =========================================================
   LEARNING TIMELINE
   ========================================================= */

function updateTimeline() {

    let section =
        document.getElementById(
            "learningTimeline"
        );

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "learningTimeline";

        section.className =
            "card learning-timeline-card";

        const main =
            document.querySelector(".main-content");

        if (main) {

            main.appendChild(section);
        }
    }

    if (!section) {
        return;
    }


    const activities =
        dashboardData.timeline;


    let html = `

        <div class="timeline-heading">

            <div>

                <h2>Learning Timeline</h2>

                <div class="timeline-subtitle">
                    Your recent learning journey
                </div>

            </div>

            <a
                href="activity.html"
                class="achievement-count"
                style="text-decoration:none;"
            >
                View All →
            </a>

        </div>

        <div class="timeline">
    `;


    if (!activities.length) {

        html += `

            <div class="timeline-item">

                <div class="timeline-dot"></div>

                <div class="timeline-content">

                    <div class="timeline-title">
                        No learning activity yet
                    </div>

                    <div class="timeline-description">
                        Complete a quiz or challenge to start
                        building your learning timeline.
                    </div>

                    <div class="timeline-time">
                        —
                    </div>

                </div>

            </div>
        `;

    } else {

        activities
            .slice(0, 10)
            .forEach(function (activity) {

                html += `

                    <div class="timeline-item completed">

                        <div class="timeline-dot"></div>

                        <div class="timeline-content">

                            <div class="timeline-title">
                                ${escapeHTML(
                                    activity.activity_type ||
                                    "Learning Activity"
                                )}
                            </div>

                            <div class="timeline-description">
                                ${escapeHTML(
                                    activity.activity_description ||
                                    ""
                                )}
                            </div>

                            <div class="timeline-time">
                                ${formatDate(
                                    activity.activity_date
                                )}
                            </div>

                        </div>

                    </div>
                `;
            });
    }


    html += `
        </div>
    `;

    section.innerHTML = html;
}


/* =========================================================
   ACHIEVEMENTS
   ========================================================= */

function updateAchievements() {

    let section =
        document.getElementById(
            "achievementsSection"
        );

    if (!section) {

        section =
            document.createElement("section");

        section.id =
            "achievementsSection";

        section.className =
            "card achievements-card";

        const timeline =
            document.getElementById(
                "learningTimeline"
            );

        if (timeline) {

            timeline.parentNode.insertBefore(
                section,
                timeline
            );
        }
    }

    if (!section) {
        return;
    }


    const badges =
        dashboardData.badges;


    let html = `

        <div class="timeline-heading">

            <div>

                <h2>Achievements</h2>

                <div class="timeline-subtitle">
                    Your earned learning milestones
                </div>

            </div>

            <a
                href="achievements.html"
                class="achievement-count"
                style="text-decoration:none;"
            >
                View All →
            </a>

        </div>

        <div class="achievement-grid">
    `;


    if (!badges.length) {

        html += `

            <div class="achievement-item locked">

                <div class="achievement-icon">
                    🏆
                </div>

                <div class="achievement-name">
                    No achievements yet
                </div>

                <div class="achievement-status">
                    Complete quizzes and challenges
                </div>

            </div>
        `;

    } else {

        badges
            .slice(0, 6)
            .forEach(function (badge) {

                html += `

                    <div class="achievement-item unlocked">

                        <div class="achievement-icon">
                            ${
                                badge.icon ||
                                "🏆"
                            }
                        </div>

                        <div class="achievement-name">
                            ${escapeHTML(
                                badge.badge_name ||
                                "Achievement"
                            )}
                        </div>

                        <div class="achievement-status">
                            Unlocked ✓
                        </div>

                    </div>
                `;
            });
    }


    html += `
        </div>
    `;

    section.innerHTML = html;
}


/* =========================================================
   PERFORMANCE CHART
   ========================================================= */

function updatePerformanceChart() {

    const bars =
        document.querySelectorAll(
            ".chart .chart-bar"
        );

    if (!bars.length) {
        return;
    }

    /*
     * We do NOT create fake daily scores.
     * The detailed Performance Overview page
     * contains the real topic-wise information.
     */

    bars.forEach(function (bar) {

        bar.style.height = "0%";
    });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    const href =
                        item.getAttribute("href");

                    if (
                        !href ||
                        href === "#"
                    ) {

                        return;
                    }

                    /*
                     * Normal page links are allowed
                     * to navigate normally.
                     */

                    if (!href.startsWith("#")) {
                        return;
                    }

                    event.preventDefault();

                    const target =
                        document.querySelector(href);

                    if (target) {

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                }
            );
        });
}


/* =========================================================
   DASHBOARD BUTTONS / CARDS
   ========================================================= */

function setupDashboardInteractions() {

    /* -----------------------------------------------------
       PROFILE
       ----------------------------------------------------- */

    const profile =
        document.querySelector(".profile");

    if (profile) {

        profile.style.cursor = "pointer";

        profile.setAttribute(
            "title",
            "Open your profile"
        );

        profile.addEventListener(
            "click",
            function () {

                window.location.href =
                    "profile.html";
            }
        );
    }


    /* -----------------------------------------------------
       NOTIFICATION
       ----------------------------------------------------- */

    const notification =
        document.querySelector(".notification");

    if (notification) {

        notification.style.cursor = "pointer";

        notification.setAttribute(
            "title",
            "View notifications"
        );

        notification.addEventListener(
            "click",
            function () {

                window.location.href =
                    "notifications.html";
            }
        );
    }


    /* -----------------------------------------------------
       ANALYSIS BUTTONS
       ----------------------------------------------------- */

    document
        .querySelectorAll(".analysis-button")
        .forEach(function (button) {

            const text =
                button.textContent
                    .trim()
                    .toLowerCase();


            /* View Full Study Plan */

            if (
                text.includes(
                    "view full study plan"
                )
            ) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        window.location.href =
                            "study-plan.html";
                    }
                );
            }


            /* View All Activity */

            else if (
                text.includes(
                    "view all activity"
                )
            ) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        window.location.href =
                            "activity.html";
                    }
                );
            }


            /* View Detailed Analysis */

            else if (
                text.includes(
                    "view detailed analysis"
                )
            ) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        window.location.href =
                            "performance.html";
                    }
                );
            }
        });


    /* -----------------------------------------------------
       SETTINGS
       ----------------------------------------------------- */

    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            const text =
                item.textContent
                    .trim()
                    .toLowerCase();

            if (
                text.includes("settings")
            ) {

                item.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        window.location.href =
                            "settings.html";
                    }
                );
            }
        });


    /* -----------------------------------------------------
       ACHIEVEMENTS
       ----------------------------------------------------- */

    document
        .querySelectorAll(".menu-item")
        .forEach(function (item) {

            const text =
                item.textContent
                    .trim()
                    .toLowerCase();

            if (
                text.includes("achievements")
            ) {

                item.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        window.location.href =
                            "achievements.html";
                    }
                );
            }
        });


    /* -----------------------------------------------------
       ACHIEVEMENT PROMO BUTTON
       ----------------------------------------------------- */

    const promoButton =
        document.querySelector(
            ".promo-button"
        );

    if (promoButton) {

        promoButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "achievements.html";
            }
        );
    }


    /* -----------------------------------------------------
       PERFORMANCE OVERVIEW CARD
       ----------------------------------------------------- */

    document
        .querySelectorAll(".card")
        .forEach(function (card) {

            const heading =
                card.querySelector(
                    ".card-heading h2"
                );

            if (!heading) {
                return;
            }

            const title =
                heading.textContent
                    .trim()
                    .toLowerCase();

            if (
                title.includes(
                    "performance overview"
                )
            ) {

                card.style.cursor =
                    "pointer";

                card.setAttribute(
                    "title",
                    "Open detailed performance overview"
                );

                card.addEventListener(
                    "click",
                    function (event) {

                        /*
                         * Don't interfere with controls
                         * inside the card.
                         */

                        if (
                            event.target.closest(
                                "a, button, input, select"
                            )
                        ) {
                            return;
                        }

                        window.location.href =
                            "performance.html";
                    }
                );
            }
        });
}


/* =========================================================
   EXAM HELPERS
   ========================================================= */

function getSelectedExamCode() {

    const user =
        getStoredUser();

    const exam =
        user.target_exam ||
        user.exam ||
        "ESIC UDC";

    const normalized =
        String(exam).toLowerCase();

    if (normalized.includes("oicl")) {
        return "oicl";
    }

    if (normalized.includes("niacl")) {
        return "niacl";
    }

    return "esic";
}


function getStoredUser() {

    try {

        const raw =
            localStorage.getItem(
                USER_KEY
            );

        return raw
            ? JSON.parse(raw)
            : {};

    } catch (error) {

        return {};
    }
}


/* =========================================================
   EXISTING DASHBOARD FUNCTIONS
   ========================================================= */

function practiceSubject(subject) {

    window.location.href =
        `subjects.html?exam=${getSelectedExamCode()}&subject=${encodeURIComponent(subject)}`;
}


function goToStudyPlan() {

    window.location.href =
        "study-plan.html";
}


function startStudyTask(subject) {

    practiceSubject(subject);
}


function goToSubjects() {

    window.location.href =
        `subjects.html?exam=${getSelectedExamCode()}`;
}


function openExams() {

    window.location.href =
        "exams.html";
}


function continueExam(exam) {

    if (exam) {

        window.location.href =
            `exams.html?exam=${encodeURIComponent(exam)}`;

    } else {

        window.location.href =
            "exams.html";
    }
}


function startDailyChallenge() {

    window.location.href =
        "daily-challenge.html";
}


function showAllActivity() {

    window.location.href =
        "activity.html";
}


/* =========================================================
   AUTHENTICATION FAILURE
   ========================================================= */

function handleAuthenticationFailure() {

    localStorage.removeItem(
        TOKEN_KEY
    );

    localStorage.removeItem(
        USER_KEY
    );

    localStorage.removeItem(
        "adaptiveLearnLoggedIn"
    );

    window.location.href =
        "login.html";
}


/* =========================================================
   DATE FORMAT
   ========================================================= */

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const oldToast =
        document.querySelector(
            ".dashboard-toast"
        );

    if (oldToast) {
        oldToast.remove();
    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "dashboard-toast";

    toast.textContent =
        message;

    toast.style.position =
        "fixed";

    toast.style.bottom =
        "25px";

    toast.style.right =
        "25px";

    toast.style.zIndex =
        "9999";

    toast.style.padding =
        "13px 18px";

    toast.style.borderRadius =
        "10px";

    toast.style.background =
        "#111827";

    toast.style.color =
        "#ffffff";

    toast.style.fontSize =
        "14px";

    toast.style.boxShadow =
        "0 8px 25px rgba(0,0,0,.15)";

    document.body.appendChild(
        toast
    );

    setTimeout(
        function () {

            if (toast) {
                toast.remove();
            }

        },
        3000
    );
}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.practiceSubject =
    practiceSubject;

window.goToStudyPlan =
    goToStudyPlan;

window.startStudyTask =
    startStudyTask;

window.goToSubjects =
    goToSubjects;

window.openExams =
    openExams;

window.continueExam =
    continueExam;

window.startDailyChallenge =
    startDailyChallenge;

window.showAllActivity =
    showAllActivity;