// ==========================================================
// DAILY CHALLENGE
// AI ADAPTIVE LEARNING
// ==========================================================

const API_BASE_URL =
    "http://localhost:5000";

const TOKEN_KEY =
    "adaptiveLearnToken";

const USER_KEY =
    "adaptiveLearnUser";


let currentChallenge = null;

let selectedOptionId = null;

let submitting = false;


// ==========================================================
// INITIAL LOAD
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudent();

        loadDailyChallenge();

    }
);


// ==========================================================
// AUTHENTICATION
// ==========================================================

function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function getStudent() {

    try {

        const raw =
            localStorage.getItem(
                USER_KEY
            );


        if (!raw) {
            return null;
        }


        return JSON.parse(raw);

    } catch {

        return null;

    }

}


// ==========================================================
// STUDENT INFORMATION
// ==========================================================

function loadStudent() {

    const student =
        getStudent();


    if (!student) {
        return;
    }


    const name =
        student.name ||
        "Student";


    const avatar =
        document.querySelector(
            ".avatar"
        );


    if (avatar) {

        avatar.textContent =
            name
                .charAt(0)
                .toUpperCase();

    }


    const profileName =
        document.querySelector(
            ".profile-btn span:last-child"
        );


    if (profileName) {

        profileName.textContent =
            name;

    }


    const heroStreak =
        document.getElementById(
            "heroStreak"
        );


    if (heroStreak) {

        heroStreak.textContent =
            `${Number(student.streak || 0)} 🔥`;

    }

}


// ==========================================================
// EXAM ID
// ==========================================================

function getExamId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const queryExam =
        params.get("exam_id") ||
        params.get("examId");


    if (
        queryExam &&
        Number(queryExam) > 0
    ) {

        return Number(
            queryExam
        );

    }


    const student =
        getStudent();


    const exam =
        student?.exam || "";


    const normalized =
        exam
            .toLowerCase()
            .trim();


    if (
        normalized.includes(
            "oicl"
        )
    ) {

        return 2;

    }


    if (
        normalized.includes(
            "niacl"
        )
    ) {

        return 3;

    }


    return 1;

}


// ==========================================================
// API REQUEST
// ==========================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();


    const headers = {
        "Content-Type":
            "application/json",

        ...(options.headers || {})
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                ...options,
                headers
            }
        );


    let data;


    try {

        data =
            await response.json();

    } catch {

        data = {
            success: false,
            message:
                "Invalid server response."
        };

    }


    if (
        response.status === 401
    ) {

        showToast(
            "Your session has expired. Please login again."
        );


        return data;

    }


    return data;

}


// ==========================================================
// LOAD DAILY CHALLENGE
// ==========================================================

async function loadDailyChallenge() {

    const token =
        getToken();


    if (!token) {

        showUnavailable(
            "Please login to access the Daily Challenge."
        );

        return;

    }


    try {

        const examId =
            getExamId();


        const data =
            await apiRequest(
                `/api/challenges/daily?exam_id=${examId}`
            );


        if (
            !data ||
            !data.success
        ) {

            showUnavailable(
                data?.message ||
                "Unable to load today's challenge."
            );

            return;

        }


        if (
            data.completed_today ||
            !data.challenge
        ) {

            showCompletedToday(
                data.message
            );

            return;

        }


        currentChallenge =
            data.challenge;


        renderChallenge(
            currentChallenge
        );

    } catch (error) {

        console.error(
            "Daily challenge load error:",
            error
        );


        showUnavailable(
            "Unable to connect to the backend server."
        );

    }

}


// ==========================================================
// RENDER CHALLENGE
// ==========================================================

function renderChallenge(
    challenge
) {

    selectedOptionId =
        null;


    submitting =
        false;


    const title =
        document.getElementById(
            "challengeTitle"
        );


    if (title) {

        title.textContent =
            challenge.title ||
            "Daily Skill Challenge";

    }


    const question =
        document.getElementById(
            "questionText"
        );


    if (question) {

        question.textContent =
            challenge.question_text ||
            challenge.description ||
            "Complete today's learning challenge.";

    }


    const xp =
        document.getElementById(
            "heroXP"
        );


    if (xp) {

        xp.textContent =
            `+${Number(challenge.xp_reward || 0)} XP`;

    }


    const difficulty =
        document.getElementById(
            "difficultyBadge"
        );


    if (difficulty) {

        difficulty.textContent =
            challenge.difficulty ||
            "Medium";

    }


    // Update topic information
    updateTopicInfo(
        challenge
    );


    // Render options
    renderOptions(
        challenge.options || []
    );


    // Question number
    const questionNumber =
        document.querySelector(
            ".question-number"
        );


    if (questionNumber) {

        questionNumber.textContent =
            "Question 1 of 1";

    }


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Submit Challenge";

    }


    hideResult();

}


// ==========================================================
// TOPIC INFORMATION
// ==========================================================

function updateTopicInfo(
    challenge
) {

    const topicInfo =
        document.querySelector(
            ".topic-info"
        );


    if (!topicInfo) {
        return;
    }


    topicInfo.innerHTML = `
        <span>📚 ${escapeHtml(
            challenge.subject_name ||
            "General"
        )}</span>

        <span>🎯 ${
            Number(challenge.accuracy || 0) < 60
                ? "Weak Topic"
                : "Practice Topic"
        }</span>

        <span>⏱ 5–10 minutes</span>
    `;

}


// ==========================================================
// RENDER ANSWER OPTIONS
// ==========================================================

function renderOptions(
    options
) {

    const container =
        document.getElementById(
            "options"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    options.forEach(
        function (option) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.textContent =
                option.option_text;


            button.dataset.optionId =
                option.option_id;


            button.addEventListener(
                "click",
                function () {

                    selectAnswer(
                        button,
                        option.option_id
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


// ==========================================================
// SELECT ANSWER
// ==========================================================

function selectAnswer(
    button,
    optionId
) {

    if (submitting) {
        return;
    }


    const container =
        document.getElementById(
            "options"
        );


    if (container) {

        container
            .querySelectorAll(
                "button"
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        "selected"
                    );

                }
            );

    }


    button.classList.add(
        "selected"
    );


    selectedOptionId =
        Number(optionId);


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            false;

    }

}


// ==========================================================
// SUBMIT CHALLENGE
// ==========================================================

async function submitChallenge() {

    if (
        submitting ||
        !currentChallenge
    ) {
        return;
    }


    if (!selectedOptionId) {

        showToast(
            "Please select an answer first."
        );

        return;

    }


    submitting =
        true;


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Checking...";

    }


    try {

        const data =
            await apiRequest(
                `/api/challenges/${currentChallenge.challenge_id}/complete`,
                {
                    method: "POST",

                    body: JSON.stringify({
                        question_id:
                            currentChallenge.question_id,

                        option_id:
                            selectedOptionId,

                        proof:
                            "Completed daily challenge"
                    })
                }
            );


        if (
            data &&
            data.correct
        ) {

            handleSuccessfulCompletion(
                data
            );

        } else {

            handleWrongAnswer(
                data
            );

            submitting =
                false;


            if (submitBtn) {

                submitBtn.disabled =
                    false;

                submitBtn.textContent =
                    "Try Again";

            }

        }

    } catch (error) {

        console.error(
            "Challenge submission error:",
            error
        );


        showToast(
            "Unable to submit challenge."
        );


        submitting =
            false;


        if (submitBtn) {

            submitBtn.disabled =
                false;

            submitBtn.textContent =
                "Submit Challenge";

        }

    }

}


// ==========================================================
// SUCCESS
// ==========================================================

function handleSuccessfulCompletion(
    data
) {

    const resultBox =
        document.getElementById(
            "resultBox"
        );


    if (resultBox) {

        resultBox.classList.remove(
            "hidden"
        );

    }


    const resultIcon =
        document.getElementById(
            "resultIcon"
        );


    if (resultIcon) {

        resultIcon.textContent =
            "🎉";

    }


    const resultTitle =
        document.getElementById(
            "resultTitle"
        );


    if (resultTitle) {

        resultTitle.textContent =
            "Challenge Completed!";

    }


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (resultMessage) {

        resultMessage.textContent =
            `Excellent work! Your streak is now ${data.current_streak} day${
                Number(data.current_streak) === 1
                    ? ""
                    : "s"
            }.`;

    }


    const earnedXP =
        document.getElementById(
            "earnedXP"
        );


    if (earnedXP) {

        earnedXP.textContent =
            `+${Number(data.xp_earned || 0)} XP`;

    }


    const heroXP =
        document.getElementById(
            "heroXP"
        );


    if (heroXP) {

        heroXP.textContent =
            `+${Number(data.xp_earned || 0)} XP`;

    }


    const heroStreak =
        document.getElementById(
            "heroStreak"
        );


    if (heroStreak) {

        heroStreak.textContent =
            `${Number(data.current_streak || 0)} 🔥`;

    }


    // Save updated student information
    updateStoredStudent(
        data
    );


    // Disable options
    const options =
        document.querySelectorAll(
            "#options button"
        );


    options.forEach(
        function (button) {

            button.disabled =
                true;

        }
    );


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

        submitBtn.textContent =
            "Completed ✓";

    }


    if (
        data.earned_badges &&
        data.earned_badges.length > 0
    ) {

        showToast(
            `🏆 New badge unlocked: ${data.earned_badges[0].badge_name}`
        );

    } else {

        showToast(
            `🎉 +${data.xp_earned} XP earned!`
        );

    }

}


// ==========================================================
// WRONG ANSWER
// ==========================================================

function handleWrongAnswer(
    data
) {

    const resultBox =
        document.getElementById(
            "resultBox"
        );


    if (resultBox) {

        resultBox.classList.remove(
            "hidden"
        );

    }


    const resultIcon =
        document.getElementById(
            "resultIcon"
        );


    if (resultIcon) {

        resultIcon.textContent =
            "💡";

    }


    const resultTitle =
        document.getElementById(
            "resultTitle"
        );


    if (resultTitle) {

        resultTitle.textContent =
            "Try Again";

    }


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    if (resultMessage) {

        let message =
            data?.message ||
            "That answer isn't correct.";


        if (
            data?.correct_answer
        ) {

            message +=
                ` Correct answer: ${data.correct_answer}.`;

        }


        if (
            data?.explanation
        ) {

            message +=
                ` ${data.explanation}`;

        }


        resultMessage.textContent =
            message;

    }


    const earnedXP =
        document.getElementById(
            "earnedXP"
        );


    if (earnedXP) {

        earnedXP.textContent =
            "+0 XP";

    }


    showToast(
        "Not quite — try another answer."
    );

}


// ==========================================================
// HIDE RESULT
// ==========================================================

function hideResult() {

    const resultBox =
        document.getElementById(
            "resultBox"
        );


    if (resultBox) {

        resultBox.classList.add(
            "hidden"
        );

    }

}


// ==========================================================
// TODAY COMPLETED
// ==========================================================

function showCompletedToday(
    message
) {

    currentChallenge =
        null;


    const title =
        document.getElementById(
            "challengeTitle"
        );


    if (title) {

        title.textContent =
            "Today's Challenge Complete!";

    }


    const question =
        document.getElementById(
            "questionText"
        );


    if (question) {

        question.textContent =
            message ||
            "Great job! Come back tomorrow for a new challenge.";

    }


    const options =
        document.getElementById(
            "options"
        );


    if (options) {

        options.innerHTML = `
            <div style="
                padding: 20px;
                text-align: center;
                font-weight: 600;
            ">
                🎉 Daily challenge completed!
            </div>
        `;

    }


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.style.display =
            "none";

    }


    const resultBox =
        document.getElementById(
            "resultBox"
        );


    if (resultBox) {

        resultBox.classList.add(
            "hidden"
        );

    }

}


// ==========================================================
// UNAVAILABLE
// ==========================================================

function showUnavailable(
    message
) {

    const title =
        document.getElementById(
            "challengeTitle"
        );


    if (title) {

        title.textContent =
            "Daily Challenge";

    }


    const question =
        document.getElementById(
            "questionText"
        );


    if (question) {

        question.textContent =
            message ||
            "Unable to load today's challenge.";

    }


    const options =
        document.getElementById(
            "options"
        );


    if (options) {

        options.innerHTML = `
            <div style="
                padding: 20px;
                text-align: center;
            ">
                ⚠️ ${escapeHtml(
                    message ||
                    "Challenge unavailable."
                )}
            </div>
        `;

    }


    const submitBtn =
        document.getElementById(
            "submitBtn"
        );


    if (submitBtn) {

        submitBtn.disabled =
            true;

    }

}


// ==========================================================
// UPDATE LOCAL STUDENT
// ==========================================================

function updateStoredStudent(
    data
) {

    const student =
        getStudent();


    if (!student) {
        return;
    }


    student.xp =
        Number(
            data.total_xp ??
            student.xp ??
            0
        );


    student.streak =
        Number(
            data.current_streak ??
            student.streak ??
            0
        );


    try {

        localStorage.setItem(
            USER_KEY,
            JSON.stringify(
                student
            )
        );

    } catch {
        // Ignore localStorage errors
    }


    // Also update statistics if it exists
    try {

        const statsRaw =
            localStorage.getItem(
                "adaptiveLearnStatistics"
            );


        if (statsRaw) {

            const stats =
                JSON.parse(
                    statsRaw
                );


            stats.xp =
                student.xp;

            stats.streak =
                student.streak;


            localStorage.setItem(
                "adaptiveLearnStatistics",
                JSON.stringify(
                    stats
                )
            );

        }

    } catch {
        // Ignore localStorage errors
    }

}


// ==========================================================
// NAVIGATION
// ==========================================================

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


function showNotification() {

    showToast(
        "Notifications are available on your dashboard."
    );

}


// ==========================================================
// TOAST
// ==========================================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !toastMessage
    ) {
        return;
    }


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}


// ==========================================================
// HTML ESCAPE
// ==========================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================

window.selectAnswer =
    selectAnswer;

window.submitChallenge =
    submitChallenge;

window.goToDashboard =
    goToDashboard;

window.showNotification =
    showNotification;