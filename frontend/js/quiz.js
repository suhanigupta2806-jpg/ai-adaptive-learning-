// ============================================================
// AdaptiveLearn
// PRACTICE QUIZ
// COMPLETE INTERACTION FIX
// ============================================================

"use strict";


// ============================================================
// API / STORAGE
// ============================================================

const API_BASE_URL = "http://localhost:5000";

const TOKEN_KEY = "adaptiveLearnToken";
const USER_KEY = "adaptiveLearnUser";


// ============================================================
// URL PARAMETERS
// ============================================================

const urlParams =
    new URLSearchParams(window.location.search);

const selectedExamSlug =
    (urlParams.get("exam") || "")
        .trim()
        .toLowerCase();

const selectedSubjectSlug =
    (urlParams.get("subject") || "")
        .trim()
        .toLowerCase();

const selectedTopicSlug =
    (urlParams.get("topic") || "")
        .trim()
        .toLowerCase();

const requestedExamId =
    Number(urlParams.get("examId")) || null;

const requestedSubjectId =
    Number(urlParams.get("subjectId")) || null;

const requestedTopicId =
    Number(urlParams.get("topicId")) || null;

const adaptiveMode =
    urlParams.get("adaptive") === "1" ||
    urlParams.get("mode") === "adaptive";


// ============================================================
// EXAM NAMES
// ============================================================

const examNames = {

    esic: "ESIC UDC",

    oicl: "OICL Assistant",

    niacl: "NIACL Assistant"

};


// ============================================================
// SUBJECT NAMES
// ============================================================

const subjectNames = {

    english: "English Language",

    reasoning: "Reasoning Ability",

    quantitative: "Quantitative Aptitude",

    quant: "Quantitative Aptitude",

    general: "General Awareness",

    "general-awareness":
        "General Awareness"

};


// ============================================================
// TOPIC NAMES
// ============================================================

const topicNames = {

    grammar: "Grammar",

    vocabulary: "Vocabulary",

    "reading-comprehension":
        "Reading Comprehension",

    "coding-decoding":
        "Coding-Decoding",

    "blood-relations":
        "Blood Relations",

    syllogism: "Syllogism",

    percentage: "Percentage",

    "profit-loss":
        "Profit and Loss",

    "time-work":
        "Time and Work"

};


// ============================================================
// DOM
// ============================================================

let questionCount;
let timer;
let progressBar;
let topicLabel;
let questionText;
let optionsContainer;
let previousButton;
let submitButton;
let quizMessage;
let examNameElement;


// ============================================================
// QUIZ STATE
// ============================================================

let selectedExam = null;

let selectedSubject = null;

let selectedTopic = null;

let questions = [];

let currentQuestion = 0;

let userAnswers = [];

let quizFinished = false;


// ============================================================
// TIMER
// ============================================================

const totalTime = 10 * 60;

let timeLeft = totalTime;

let timerInterval = null;


// ============================================================
// HELPERS
// ============================================================

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[-_]+/g, " ")
        .replace(/\s+/g, " ");

}


function getToken() {

    return localStorage.getItem(
        TOKEN_KEY
    );

}


function getUser() {

    try {

        return JSON.parse(
            localStorage.getItem(
                USER_KEY
            ) || "null"
        );

    }

    catch {

        return null;

    }

}


function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(
    message,
    type = ""
) {

    if (!quizMessage) {
        return;
    }

    quizMessage.textContent =
        message || "";

    quizMessage.className =
        "quiz-message";

    if (type) {

        quizMessage.classList.add(
            type
        );

    }

}


// ============================================================
// API
// ============================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const token =
        getToken();

    const headers = {
        ...(options.headers || {})
    };


    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] =
            "application/json";

    }


    if (token) {

        headers["Authorization"] =
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

    }

    catch {

        throw new Error(
            "The server returned an invalid response."
        );

    }


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );

        window.location.href =
            "login.html";

        throw new Error(
            "Your session has expired."
        );

    }


    if (
        !response.ok ||
        data.success === false
    ) {

        throw new Error(
            data.message ||
            "Request failed."
        );

    }


    return data;

}


// ============================================================
// DISPLAY NAMES
// ============================================================

function getExamDisplayName() {

    return (
        selectedExam?.exam_name ||
        examNames[selectedExamSlug] ||
        selectedExamSlug ||
        "Practice"
    );

}


function getSubjectDisplayName() {

    return (
        selectedSubject?.subject_name ||
        subjectNames[selectedSubjectSlug] ||
        selectedSubjectSlug ||
        "Subject"
    );

}


function getTopicDisplayName() {

    return (
        selectedTopic?.topic_name ||
        topicNames[selectedTopicSlug] ||
        selectedTopicSlug ||
        "Practice"
    );

}


// ============================================================
// RESOLVE EXAM
// ============================================================

async function resolveExam() {

    const data =
        await apiRequest(
            "/api/exams"
        );


    const exams =
        Array.isArray(data.exams)
            ? data.exams
            : [];


    if (requestedExamId) {

        const exam =
            exams.find(
                item =>
                    Number(item.exam_id) ===
                    requestedExamId
            );


        if (exam) {

            return exam;

        }

    }


    const wantedName =
        examNames[selectedExamSlug] ||
        selectedExamSlug;


    const exam =
        exams.find(
            item =>
                normalize(item.exam_name) ===
                normalize(wantedName)
        );


    if (!exam) {

        throw new Error(
            "Selected exam was not found."
        );

    }


    return exam;

}


// ============================================================
// RESOLVE SUBJECT
// ============================================================

async function resolveSubject(
    examId
) {

    const data =
        await apiRequest(
            `/api/exams/${examId}/subjects`
        );


    const subjects =
        Array.isArray(data.subjects)
            ? data.subjects
            : [];


    if (requestedSubjectId) {

        const subject =
            subjects.find(
                item =>
                    Number(item.subject_id) ===
                    requestedSubjectId
            );


        if (subject) {

            return subject;

        }

        throw new Error(
            "Selected subject was not found for this exam."
        );

    }


    const wantedName =
        subjectNames[selectedSubjectSlug] ||
        selectedSubjectSlug;


    const subject =
        subjects.find(
            item =>
                normalize(item.subject_name) ===
                normalize(wantedName)
        );


    if (!subject) {

        throw new Error(
            "Selected subject was not found."
        );

    }


    return subject;

}


// ============================================================
// RESOLVE TOPIC
// ============================================================

async function resolveTopic(
    subjectId
) {

    const data =
        await apiRequest(
            `/api/exams/subjects/${subjectId}/topics`
        );


    const topics =
        Array.isArray(data.topics)
            ? data.topics
            : [];


    if (requestedTopicId) {

        const topic =
            topics.find(
                item =>
                    Number(item.topic_id) ===
                    requestedTopicId
            );


        if (topic) {

            return topic;

        }

        throw new Error(
            "Selected topic was not found for this subject."
        );

    }


    const wantedName =
        topicNames[selectedTopicSlug] ||
        selectedTopicSlug;


    const topic =
        topics.find(
            item =>
                normalize(item.topic_name) ===
                normalize(wantedName)
        );


    if (!topic) {

        throw new Error(
            "Selected topic was not found."
        );

    }


    return topic;

}


// ============================================================
// VALIDATE QUESTION
// ============================================================

function isValidQuestion(
    question
) {

    return (

        question &&

        Number(question.question_id) > 0 &&

        question.question_text &&

        Array.isArray(question.options) &&

        question.options.length >= 2

    );

}


// ============================================================
// LOAD QUIZ
// ============================================================

async function loadQuiz() {

    if (!getToken()) {

        window.location.href =
            "login.html";

        return;

    }


    try {

        setLoading(true);


        selectedExam =
            await resolveExam();


        // ====================================================
        // ADAPTIVE PRACTICE
        // ====================================================

        if (adaptiveMode) {

            selectedSubject = null;

            selectedTopic = null;


            const adaptiveData =
                await apiRequest(
                    `/api/adaptive/${selectedExam.exam_id}?limit=10`
                );


            questions =
                Array.isArray(
                    adaptiveData.questions
                )
                    ? adaptiveData.questions.filter(
                        isValidQuestion
                    )
                    : [];


            if (
                questions.length === 0
            ) {

                throw new Error(
                    "No adaptive questions are available for this exam."
                );

            }


            sessionStorage.setItem(
                "adaptiveQuizStrategy",
                adaptiveData.strategy ||
                "balanced"
            );


            sessionStorage.setItem(
                "adaptiveFocusedTopics",
                JSON.stringify(
                    adaptiveData.focused_topics ||
                    []
                )
            );


            if (examNameElement) {

                examNameElement.textContent =
                    `${getExamDisplayName()} • Adaptive Practice`;

            }


            if (topicLabel) {

                topicLabel.textContent =
                    "Adaptive Practice";

            }

        }


        // ====================================================
        // NORMAL TOPIC PRACTICE
        // ====================================================

        else {

            selectedSubject =
                await resolveSubject(
                    selectedExam.exam_id
                );


            selectedTopic =
                await resolveTopic(
                    selectedSubject.subject_id
                );


            const normalData =
                await apiRequest(
                    `/api/quiz/topic/${selectedTopic.topic_id}?limit=10`
                );


            questions =
                Array.isArray(
                    normalData.questions
                )
                    ? normalData.questions.filter(
                        isValidQuestion
                    )
                    : [];


            if (
                questions.length === 0
            ) {

                throw new Error(
                    "No questions are available for this topic."
                );

            }


            if (examNameElement) {

                examNameElement.textContent =
                    `${getExamDisplayName()} • Practice Quiz`;

            }


            if (topicLabel) {

                topicLabel.textContent =
                    getTopicDisplayName();

            }

        }


        // ====================================================
        // INITIALIZE STATE
        // ====================================================

        currentQuestion = 0;

        userAnswers =
            new Array(
                questions.length
            ).fill(null);

        quizFinished = false;

        timeLeft = totalTime;


        // ====================================================
        // SHOW FIRST QUESTION
        // ====================================================

        displayQuestion();

        startTimer();


        showMessage(
            `${questions.length} questions loaded.`,
            "success"
        );


        setLoading(false);

    }

    catch (error) {

        console.error(
            "Quiz loading error:",
            error
        );


        setLoading(false);


        showMessage(
            error.message ||
            "Unable to load quiz.",
            "error"
        );


        if (questionText) {

            questionText.textContent =
                "Unable to load questions.";

        }


        if (optionsContainer) {

            optionsContainer.innerHTML = `

                <div class="quiz-error">

                    ${escapeHTML(
                        error.message ||
                        "Please try again."
                    )}

                </div>

            `;

        }


        if (submitButton) {

            submitButton.disabled =
                true;

        }

    }

}


// ============================================================
// LOADING STATE
// ============================================================

function setLoading(
    loading
) {

    if (loading) {

        if (questionText) {

            questionText.textContent =
                "Loading questions...";

        }


        if (optionsContainer) {

            optionsContainer.innerHTML = `

                <div class="quiz-loading">

                    Preparing your personalized practice...

                </div>

            `;

        }


        if (submitButton) {

            submitButton.disabled =
                true;

        }

    }

    else {

        if (submitButton) {

            submitButton.disabled =
                false;

        }

    }

}


// ============================================================
// DISPLAY QUESTION
// ============================================================

function displayQuestion() {

    const question =
        questions[currentQuestion];


    if (!question) {

        return;

    }


    // ========================================================
    // QUESTION COUNT
    // ========================================================

    if (questionCount) {

        questionCount.textContent =
            `Question ${currentQuestion + 1} of ${questions.length}`;

    }


    // ========================================================
    // PROGRESS
    // ========================================================

    if (progressBar) {

        const percentage =
            (
                (currentQuestion + 1) /
                questions.length
            ) * 100;


        progressBar.style.width =
            `${percentage}%`;

    }


    // ========================================================
    // TOPIC
    // ========================================================

    if (topicLabel) {

        topicLabel.textContent =
            selectedTopic
                ? getTopicDisplayName()
                : "Adaptive Practice";

    }


    // ========================================================
    // QUESTION
    // ========================================================

    if (questionText) {

        questionText.textContent =
            question.question_text;

    }


    // ========================================================
    // OPTIONS
    //
    // IMPORTANT:
    // We use event delegation instead of creating a separate
    // listener for every button.
    // This makes selection reliable.
    // ========================================================

    if (optionsContainer) {

        optionsContainer.innerHTML = "";


        question.options.forEach(
            (
                option,
                index
            ) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "option";


                button.dataset.optionId =
                    String(
                        option.option_id
                    );


                button.setAttribute(
                    "aria-label",
                    `Option ${String.fromCharCode(65 + index)}`
                );


                const letter =
                    document.createElement(
                        "span"
                    );


                letter.className =
                    "option-letter";


                letter.textContent =
                    String.fromCharCode(
                        65 + index
                    );


                const text =
                    document.createElement(
                        "span"
                    );


                text.className =
                    "option-text";


                text.textContent =
                    option.option_text;


                button.appendChild(
                    letter
                );


                button.appendChild(
                    text
                );


                // Restore previous answer.

                if (
                    userAnswers[currentQuestion] !==
                    null &&

                    Number(
                        userAnswers[currentQuestion]
                    ) ===
                    Number(
                        option.option_id
                    )
                ) {

                    button.classList.add(
                        "selected"
                    );

                    button.setAttribute(
                        "aria-pressed",
                        "true"
                    );

                }

                else {

                    button.setAttribute(
                        "aria-pressed",
                        "false"
                    );

                }


                optionsContainer.appendChild(
                    button
                );

            }
        );

    }


    // ========================================================
    // PREVIOUS
    // ========================================================

    if (previousButton) {

        previousButton.disabled =
            currentQuestion === 0;

    }


    // ========================================================
    // NEXT / SUBMIT BUTTON
    // ========================================================

    if (submitButton) {

        if (
            currentQuestion ===
            questions.length - 1
        ) {

            submitButton.textContent =
                "Submit Test ✓";

        }

        else {

            submitButton.textContent =
                "Next Question →";

        }


        submitButton.disabled =
            false;

    }


    showMessage(
        "",
        ""
    );

}


// ============================================================
// OPTION SELECTION
//
// EVENT DELEGATION
// ============================================================

function handleOptionClick(
    event
) {

    const optionButton =
        event.target.closest(
            ".option"
        );


    if (!optionButton) {

        return;

    }


    if (
        !optionsContainer.contains(
            optionButton
        )
    ) {

        return;

    }


    if (quizFinished) {

        return;

    }


    const optionId =
        Number(
            optionButton.dataset.optionId
        );


    if (
        !Number.isInteger(optionId) ||
        optionId <= 0
    ) {

        return;

    }


    // ========================================================
    // SAVE ANSWER
    // ========================================================

    userAnswers[currentQuestion] =
        optionId;


    // ========================================================
    // REMOVE OLD SELECTION
    // ========================================================

    optionsContainer
        .querySelectorAll(
            ".option"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "selected"
                );

                button.setAttribute(
                    "aria-pressed",
                    "false"
                );

            }
        );


    // ========================================================
    // SELECT CLICKED ANSWER
    // ========================================================

    optionButton.classList.add(
        "selected"
    );


    optionButton.setAttribute(
        "aria-pressed",
        "true"
    );


    showMessage(
        "Answer selected.",
        "success"
    );

}


// ============================================================
// NEXT / SUBMIT
// ============================================================

function handleNextClick() {

    if (quizFinished) {

        return;

    }


    const selected =
        userAnswers[currentQuestion];


    // ========================================================
    // DO NOT ALLOW SKIPPING
    // ========================================================

    if (
        selected === null ||
        selected === undefined ||
        Number(selected) <= 0
    ) {

        showMessage(
            "Please select an answer before continuing.",
            "error"
        );


        // Highlight options area slightly.

        if (optionsContainer) {

            optionsContainer.classList.add(
                "answer-required"
            );


            setTimeout(
                () => {

                    optionsContainer.classList.remove(
                        "answer-required"
                    );

                },
                500
            );

        }


        return;

    }


    // ========================================================
    // LAST QUESTION
    // ========================================================

    if (
        currentQuestion ===
        questions.length - 1
    ) {

        finishQuiz(false);

        return;

    }


    // ========================================================
    // NEXT QUESTION
    // ========================================================

    currentQuestion++;


    displayQuestion();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// PREVIOUS
// ============================================================

function handlePreviousClick() {

    if (quizFinished) {

        return;

    }


    if (
        currentQuestion <= 0
    ) {

        return;

    }


    currentQuestion--;


    displayQuestion();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ============================================================
// TIME FORMAT
// ============================================================

function formatTime(
    seconds
) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remainingSeconds =
        seconds % 60;


    return (

        String(minutes)
            .padStart(2, "0")

        +

        ":"

        +

        String(remainingSeconds)
            .padStart(2, "0")

    );

}


// ============================================================
// TIMER
// ============================================================

function updateTimer() {

    if (!timer) {

        return;

    }


    timer.textContent =
        `⏱ ${formatTime(timeLeft)}`;


    if (
        timeLeft <= 60
    ) {

        timer.classList.add(
            "warning"
        );

    }

    else {

        timer.classList.remove(
            "warning"
        );

    }

}


function startTimer() {

    clearInterval(
        timerInterval
    );


    updateTimer();


    timerInterval =
        setInterval(
            () => {

                if (quizFinished) {

                    clearInterval(
                        timerInterval
                    );

                    return;

                }


                timeLeft--;


                updateTimer();


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    finishQuiz(true);

                }

            },
            1000
        );

}


// ============================================================
// SUBMIT QUIZ TO BACKEND
// ============================================================

async function submitQuizToBackend() {

    const token =
        getToken();


    const user =
        getUser();


    if (!token) {

        throw new Error(
            "Authentication session is missing."
        );

    }


    if (
        !user ||
        !user.student_id
    ) {

        throw new Error(
            "Student session is missing. Please login again."
        );

    }


    const answers =
        questions.map(
            (
                question,
                index
            ) => {

                const selectedOptionId =
                    userAnswers[index];


                return {

                    question_id:
                        Number(
                            question.question_id
                        ),

                    selected_option_id:
                        selectedOptionId === null ||
                        selectedOptionId === undefined
                            ? null
                            : Number(
                                selectedOptionId
                            )

                };

            }
        );


    const response =
        await fetch(
            `${API_BASE_URL}/api/quiz/submit`,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${token}`

                },

                body:
                    JSON.stringify({

                        exam_id:
                            Number(
                                selectedExam.exam_id
                            ),

                        answers:
                            answers

                    })

            }
        );


    let data;


    try {

        data =
            await response.json();

    }

    catch {

        throw new Error(
            "The server returned an invalid response."
        );

    }


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            TOKEN_KEY
        );

        localStorage.removeItem(
            USER_KEY
        );


        window.location.href =
            "login.html";


        throw new Error(
            "Your login session has expired."
        );

    }


    if (
        !response.ok ||
        !data.success
    ) {

        throw new Error(
            data.message ||
            "Quiz result could not be saved."
        );

    }


    return data.result;

}


// ============================================================
// FINISH QUIZ
// ============================================================

async function finishQuiz(
    autoSubmitted = false
) {

    if (quizFinished) {

        return;

    }


    quizFinished = true;


    clearInterval(
        timerInterval
    );


    if (submitButton) {

        submitButton.disabled =
            true;


        submitButton.textContent =
            "Saving Result...";

    }


    if (previousButton) {

        previousButton.disabled =
            true;

    }


    showMessage(
        autoSubmitted
            ? "Time is up. Saving your result..."
            : "Saving your result...",
        "info"
    );


    try {

        const backendResult =
            await submitQuizToBackend();


        const timeTaken =
            totalTime -
            timeLeft;


        const focusedTopics =
            JSON.parse(
                sessionStorage.getItem(
                    "adaptiveFocusedTopics"
                ) || "[]"
            );


        const quizResult = {

            exam:
                selectedExamSlug,

            examId:
                Number(
                    selectedExam.exam_id
                ),

            examName:
                getExamDisplayName(),

            subject:
                selectedSubject
                    ? getSubjectDisplayName()
                    : "Adaptive Practice",

            subjectId:
                selectedSubject
                    ? Number(
                        selectedSubject.subject_id
                    )
                    : null,

            topic:
                selectedTopic
                    ? selectedTopicSlug
                    : "adaptive",

            topicName:
                selectedTopic
                    ? getTopicDisplayName()
                    : "Adaptive Practice",

            topicId:
                selectedTopic
                    ? Number(
                        selectedTopic.topic_id
                    )
                    : null,

            adaptive:
                adaptiveMode,

            adaptiveStrategy:
                sessionStorage.getItem(
                    "adaptiveQuizStrategy"
                ) || null,

            focusedTopics:
                focusedTopics,

            score:
                Number(
                    backendResult.correct_answers
                ),

            correct:
                Number(
                    backendResult.correct_answers
                ),

            wrong:
                Number(
                    backendResult.wrong_answers
                ),

            unanswered:
                Number(
                    backendResult.unanswered_answers
                ),

            total:
                Number(
                    backendResult.total_questions
                ),

            accuracy:
                Number(
                    backendResult.score
                ),

            timeTaken:
                timeTaken,

            timeTakenFormatted:
                formatTime(
                    timeTaken
                ),

            autoSubmitted:
                autoSubmitted,

            userAnswers:
                userAnswers,

            questions:
                backendResult.questions ||
                [],

            subjectPerformance:
                backendResult.subjectPerformance ||
                {},

            attempt_id:
                backendResult.attempt_id,

            completedAt:
                new Date().toISOString()

        };


        sessionStorage.setItem(
            "quizResult",
            JSON.stringify(
                quizResult
            )
        );


        localStorage.setItem(
            "lastQuizResult",
            JSON.stringify(
                quizResult
            )
        );


        sessionStorage.setItem(
            "quizResultBackendSynced",
            "true"
        );


        sessionStorage.setItem(
            "quizAttemptId",
            String(
                backendResult.attempt_id
            )
        );


        window.location.href =
            "result.html";

    }

    catch (error) {

        console.error(
            "Quiz submission error:",
            error
        );


        quizFinished = false;


        showMessage(
            error.message ||
            "Unable to save quiz result.",
            "error"
        );


        if (submitButton) {

            submitButton.disabled =
                false;


            submitButton.textContent =
                currentQuestion ===
                questions.length - 1
                    ? "Submit Test ✓"
                    : "Next Question →";

        }


        if (previousButton) {

            previousButton.disabled =
                currentQuestion === 0;

        }

    }

}


// ============================================================
// INITIALIZE DOM
// ============================================================

function initializeQuizPage() {

    questionCount =
        document.getElementById(
            "questionCount"
        );

    timer =
        document.getElementById(
            "timer"
        );

    progressBar =
        document.getElementById(
            "progressBar"
        );

    topicLabel =
        document.getElementById(
            "topicLabel"
        );

    questionText =
        document.getElementById(
            "questionText"
        );

    optionsContainer =
        document.getElementById(
            "optionsContainer"
        );

    previousButton =
        document.getElementById(
            "previousButton"
        );

    submitButton =
        document.getElementById(
            "submitButton"
        );

    quizMessage =
        document.getElementById(
            "quizMessage"
        );

    examNameElement =
        document.getElementById(
            "examName"
        );


    // ========================================================
    // OPTION CLICK
    // ========================================================

    if (optionsContainer) {

        optionsContainer.addEventListener(
            "click",
            handleOptionClick
        );

    }


    // ========================================================
    // NEXT / SUBMIT
    // ========================================================

    if (submitButton) {

        submitButton.addEventListener(
            "click",
            handleNextClick
        );

    }


    // ========================================================
    // PREVIOUS
    // ========================================================

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            handlePreviousClick
        );

    }


    // ========================================================
    // KEYBOARD SUPPORT
    // ========================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                const active =
                    document.activeElement;


                if (
                    active &&
                    active.classList.contains(
                        "option"
                    )
                ) {

                    event.preventDefault();

                    handleNextClick();

                }

            }

        }
    );


    // ========================================================
    // START
    // ========================================================

    loadQuiz();

}


// ============================================================
// DOM READY
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeQuizPage
    );

}

else {

    initializeQuizPage();

}