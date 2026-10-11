// ============================================================
// AI ADAPTIVE LEARNING SYSTEM
// TOPICS.JS - COMPLETE REPLACEMENT
// ============================================================

const API_BASE_URL = "http://localhost:5000";

// ------------------------------------------------------------
// URL PARAMETERS
// ------------------------------------------------------------

const urlParams = new URLSearchParams(window.location.search);

const examSlug = urlParams.get("exam") || "";
const subjectSlug = urlParams.get("subject") || "";

let examId = urlParams.get("examId");
let subjectId = urlParams.get("subjectId");


// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const examLabel = document.getElementById("examLabel");
const profileExam = document.getElementById("profileExam");
const subjectTitle = document.getElementById("subjectTitle");

const topicsHeading = document.getElementById("topicsHeading");
const topicCount = document.getElementById("topicCount");
const topicsGrid = document.getElementById("topicsGrid");

const subjectMastery = document.getElementById("subjectMastery");
const subjectProgress = document.getElementById("subjectProgress");

const recommendationTitle = document.getElementById("recommendationTitle");
const recommendationText = document.getElementById("recommendationText");
const weakTopicButton = document.getElementById("weakTopicButton");

const backToSubjects = document.getElementById("backToSubjects");


// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function createSlug(value) {
    return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}


function normalize(value) {
    return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "");
}


function getExamNameFromSlug(slug) {
    const exams = {
        esic: "ESIC UDC",
        oicl: "OICL Assistant",
        niacl: "NIACL Assistant"
    };

    return exams[slug.toLowerCase()] || "";
}


function getSubjectNameFromSlug(slug) {
    const subjects = {
        reasoning: "Reasoning Ability",
        "reasoning-ability": "Reasoning Ability",

        quantitative: "Quantitative Aptitude",
        "quantitative-aptitude": "Quantitative Aptitude",

        english: "English Language",
        "english-language": "English Language",

        "general-awareness": "General Awareness"
    };

    return subjects[slug.toLowerCase()] || "";
}


// ------------------------------------------------------------
// API HELPER
// ------------------------------------------------------------

async function apiRequest(url) {
    const token = localStorage.getItem("adaptiveLearnToken");

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "GET",
        headers
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("Invalid response from server.");
    }

    if (!response.ok || data.success === false) {
        throw new Error(
            data.message || "Unable to load data from server."
        );
    }

    return data;
}


// ------------------------------------------------------------
// FIND EXAM
// ------------------------------------------------------------

async function resolveExam() {

    if (examId) {
        const data = await apiRequest(`/api/exams/${examId}`);
        return data.exam;
    }

    const data = await apiRequest("/api/exams");

    const examName = getExamNameFromSlug(examSlug);

    const exam = data.exams.find(item => {
        return normalize(item.exam_name) === normalize(examName);
    });

    if (!exam) {
        throw new Error("Exam not found.");
    }

    examId = exam.exam_id;

    return exam;
}


// ------------------------------------------------------------
// FIND SUBJECT
// ------------------------------------------------------------

async function resolveSubject(currentExamId) {

    if (subjectId) {
        const data = await apiRequest(
            `/api/exams/subjects/${subjectId}/topics`
        );

        return {
            subjectId: Number(subjectId),
            topics: data.topics
        };
    }

    const data = await apiRequest(
        `/api/exams/${currentExamId}/subjects`
    );

    const subjectName = getSubjectNameFromSlug(subjectSlug);

    const subject = data.subjects.find(item => {
        return normalize(item.subject_name) === normalize(subjectName);
    });

    if (!subject) {
        throw new Error("Subject not found.");
    }

    subjectId = subject.subject_id;

    return {
        subjectId: subject.subject_id,
        subject: subject
    };
}


// ------------------------------------------------------------
// LOAD TOPICS
// ------------------------------------------------------------

async function loadTopics() {

    try {

        showLoading();

        const exam = await resolveExam();

        const subjectData = await resolveSubject(exam.exam_id);

        const currentSubjectId = subjectData.subjectId;

        const topicsData = await apiRequest(
            `/api/exams/subjects/${currentSubjectId}/topics`
        );

        const topics = topicsData.topics || [];

        const subjectName =
            subjectData.subject?.subject_name ||
            getSubjectNameFromSlug(subjectSlug) ||
            "Topics";

        updatePageHeader(
            exam,
            subjectName,
            topics.length
        );

        renderTopics(
            topics,
            exam,
            currentSubjectId
        );

        setupRecommendation(
            topics,
            exam,
            currentSubjectId
        );

        updateBackButton(exam);

    } catch (error) {

        console.error("Topics loading error:", error);

        showError(
            error.message ||
            "Unable to load topics."
        );
    }
}


// ------------------------------------------------------------
// PAGE HEADER
// ------------------------------------------------------------

function updatePageHeader(exam, subjectName, count) {

    if (examLabel) {
        examLabel.textContent = exam.exam_name;
    }

    if (profileExam) {
        profileExam.textContent = exam.exam_name;
    }

    if (subjectTitle) {
        subjectTitle.textContent = subjectName;
    }

    if (topicsHeading) {
        topicsHeading.textContent = `${subjectName} Topics`;
    }

    if (topicCount) {
        topicCount.textContent =
            `${count} ${count === 1 ? "Topic" : "Topics"}`;
    }

    if (subjectMastery) {
        subjectMastery.textContent = "0%";
    }

    if (subjectProgress) {
        subjectProgress.style.width = "0%";
    }
}


// ------------------------------------------------------------
// RENDER TOPICS
// ------------------------------------------------------------

function renderTopics(topics, exam, currentSubjectId) {

    if (!topicsGrid) {
        return;
    }

    topicsGrid.innerHTML = "";

    if (!topics.length) {

        topicsGrid.innerHTML = `
            <div class="empty-state">
                <h3>No topics available</h3>
                <p>
                    Topics for this subject have not been added yet.
                </p>
            </div>
        `;

        return;
    }

    topics.forEach((topic, index) => {

        const topicName =
            topic.topic_name ||
            `Topic ${index + 1}`;

        const topicSlug = createSlug(topicName);

        const card = document.createElement("div");

        card.className = "topic-card";

        card.innerHTML = `
            <div class="topic-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="topic-main">

                <div class="topic-heading">

                    <h3>
                        ${escapeHTML(topicName)}
                    </h3>

                    <span class="status medium">
                        New
                    </span>

                </div>

                <p>
                    ${escapeHTML(
                        topic.description ||
                        "Practice questions and improve your understanding of this topic."
                    )}
                </p>

                <div class="topic-progress">

                    <div class="progress-info">
                        <span>Mastery</span>
                        <strong>0%</strong>
                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill medium"
                            style="width:0%"
                        ></div>

                    </div>

                </div>

                <div class="topic-footer">

                    <span>
                        Ready to practice
                    </span>

                    <a
                        href="quiz.html?exam=${encodeURIComponent(examSlug || createSlug(exam.exam_name))}&examId=${exam.exam_id}&subjectId=${currentSubjectId}&topicId=${topic.topic_id}&topic=${encodeURIComponent(topicSlug)}"
                    >
                        Practice →
                    </a>

                </div>

            </div>
        `;

        topicsGrid.appendChild(card);
    });
}


// ------------------------------------------------------------
// RECOMMENDATION
// ------------------------------------------------------------

function setupRecommendation(topics, exam, currentSubjectId) {

    if (!topics.length) {
        return;
    }

    const weakestTopic = findWeakestTopic(topics);

    const topicName =
        weakestTopic.topic_name ||
        "this topic";

    if (recommendationTitle) {
        recommendationTitle.textContent =
            `Focus on ${topicName}`;
    }

    if (recommendationText) {
        recommendationText.textContent =
            `Start practicing ${topicName} to improve your performance and build stronger exam preparation.`;
    }

    if (weakTopicButton) {

        const topicSlug = createSlug(topicName);

        weakTopicButton.href =
            `quiz.html?exam=${encodeURIComponent(
                examSlug || createSlug(exam.exam_name)
            )}&examId=${exam.exam_id}&subjectId=${currentSubjectId}&topicId=${weakestTopic.topic_id}&topic=${encodeURIComponent(topicSlug)}`;
    }
}


// ------------------------------------------------------------
// FIND WEAKEST TOPIC
// ------------------------------------------------------------

function findWeakestTopic(topics) {

    let performanceData = null;

    try {

        const stored =
            localStorage.getItem("adaptiveLearnPerformance");

        if (stored) {
            performanceData = JSON.parse(stored);
        }

    } catch (error) {

        console.warn(
            "Could not read performance data.",
            error
        );
    }

    if (!performanceData) {
        return topics[0];
    }

    let weakest = topics[0];
    let weakestScore = 101;

    topics.forEach(topic => {

        const topicId = String(topic.topic_id);

        let score = 0;

        if (
            performanceData[topicId] !== undefined
        ) {
            score = Number(
                performanceData[topicId]
            );
        }

        if (score < weakestScore) {
            weakestScore = score;
            weakest = topic;
        }
    });

    return weakest;
}


// ------------------------------------------------------------
// LOADING STATE
// ------------------------------------------------------------

function showLoading() {

    if (!topicsGrid) {
        return;
    }

    topicsGrid.innerHTML = `
        <div class="loading-state">
            <h3>Loading topics...</h3>
            <p>
                Fetching topics from the learning system.
            </p>
        </div>
    `;

    if (topicCount) {
        topicCount.textContent = "Loading...";
    }
}


// ------------------------------------------------------------
// ERROR STATE
// ------------------------------------------------------------

function showError(message) {

    if (!topicsGrid) {
        return;
    }

    topicsGrid.innerHTML = `
        <div class="empty-state">

            <h3>Unable to load topics</h3>

            <p>
                ${escapeHTML(message)}
            </p>

            <button
                type="button"
                onclick="location.reload()"
            >
                Try Again
            </button>

        </div>
    `;

    if (topicCount) {
        topicCount.textContent = "0 Topics";
    }
}


// ------------------------------------------------------------
// BACK BUTTON
// ------------------------------------------------------------

function updateBackButton(exam) {

    if (!backToSubjects) {
        return;
    }

    backToSubjects.href =
        `subjects.html?exam=${encodeURIComponent(
            examSlug || createSlug(exam.exam_name)
        )}&examId=${exam.exam_id}`;
}


// ------------------------------------------------------------
// SIDEBAR LOGOUT
// ------------------------------------------------------------

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            '[data-action="logout"], .logout, #logout'
        );

    logoutButtons.forEach(button => {

        button.addEventListener("click", function(event) {

            event.preventDefault();

            localStorage.removeItem(
                "adaptiveLearnToken"
            );

            localStorage.removeItem(
                "adaptiveLearnUser"
            );

            localStorage.removeItem(
                "adaptiveLearnStatistics"
            );

            localStorage.removeItem(
                "adaptiveLearnLoggedIn"
            );

            window.location.href = "login.html";
        });
    });
}


// ------------------------------------------------------------
// INITIALIZE
// ------------------------------------------------------------

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setupLogout();

        loadTopics();

    }
);