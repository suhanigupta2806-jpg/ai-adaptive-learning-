/* =========================================
   MOCK TEST QUIZ
   AdaptiveLearn
   LIVE MYSQL VERSION
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const API_BASE_URL =
            "http://localhost:5000";


        const TOKEN_KEY =
            "adaptiveLearnToken";


        // =========================================
        // SELECTED EXAM
        // =========================================

        const selectedExam =
            sessionStorage.getItem(
                "mockTestExam"
            ) || "esic";


        const selectedExamName =
            sessionStorage.getItem(
                "mockTestExamName"
            ) || "ESIC UDC";


        const examIds = {
            esic: 1,
            oicl: 2,
            niacl: 3
        };


        const examId =
            examIds[selectedExam] || 1;


        // =========================================
        // VARIABLES
        // =========================================

        let mockQuestions = [];

        let currentQuestion = 0;

        let userAnswers = [];

        let quizFinished = false;

        let timerInterval = null;

        const totalTime =
            20 * 60;

        let timeLeft =
            totalTime;

        let startedAt =
            null;


        // =========================================
        // HTML ELEMENTS
        // =========================================

        const examNameElement =
            document.getElementById(
                "examName"
            );


        const examHeadingElement =
            document.getElementById(
                "examHeading"
            );


        const questionText =
            document.getElementById(
                "questionText"
            );


        const questionCount =
            document.getElementById(
                "questionCount"
            );


        const currentQuestionNumber =
            document.getElementById(
                "currentQuestionNumber"
            );


        const totalQuestions =
            document.getElementById(
                "totalQuestions"
            );


        const subjectLabel =
            document.getElementById(
                "subjectLabel"
            );


        const topicLabel =
            document.getElementById(
                "topicLabel"
            );


        const optionsContainer =
            document.getElementById(
                "optionsContainer"
            );


        const progressBar =
            document.getElementById(
                "progressBar"
            );


        const previousButton =
            document.getElementById(
                "previousButton"
            );


        const nextButton =
            document.getElementById(
                "nextButton"
            );


        const submitButton =
            document.getElementById(
                "submitButton"
            );


        const quizMessage =
            document.getElementById(
                "quizMessage"
            );


        const timerElement =
            document.getElementById(
                "timer"
            );


        const timerBox =
            document.querySelector(
                ".timer-box"
            );


        const questionPalette =
            document.getElementById(
                "questionPalette"
            );


        const answeredCount =
            document.getElementById(
                "answeredCount"
            );


        const remainingCount =
            document.getElementById(
                "remainingCount"
            );


        const submitModal =
            document.getElementById(
                "submitModal"
            );


        const submitMessage =
            document.getElementById(
                "submitMessage"
            );


        const cancelSubmit =
            document.getElementById(
                "cancelSubmit"
            );


        const confirmSubmit =
            document.getElementById(
                "confirmSubmit"
            );


        // =========================================
        // CHECK HTML
        // =========================================

        const requiredElements = [
            examNameElement,
            examHeadingElement,
            questionText,
            questionCount,
            currentQuestionNumber,
            totalQuestions,
            subjectLabel,
            topicLabel,
            optionsContainer,
            progressBar,
            previousButton,
            nextButton,
            submitButton,
            quizMessage,
            timerElement,
            timerBox,
            questionPalette,
            answeredCount,
            remainingCount,
            submitModal,
            submitMessage,
            cancelSubmit,
            confirmSubmit
        ];


        if (
            requiredElements.some(
                element => !element
            )
        ) {

            console.error(
                "Mock Test Quiz: required HTML element missing."
            );

            return;

        }


        // =========================================
        // HEADER
        // =========================================

        examNameElement.textContent =
            selectedExamName;


        examHeadingElement.textContent =
            selectedExamName;


        // =========================================
        // LOAD MOCK TEST FROM BACKEND
        // =========================================

        async function loadMockTest() {

            const token =
                localStorage.getItem(
                    TOKEN_KEY
                );


            if (!token) {

                showError(
                    "Please login before starting a mock test."
                );

                return;

            }


            quizMessage.textContent =
                "Loading questions from MySQL...";


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/quiz/mock-test/${examId}?limit=20`,
                        {
                            method: "GET",

                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Unable to load mock test."
                    );

                }


                mockQuestions =
                    Array.isArray(
                        data.questions
                    )
                        ? data.questions
                        : [];


                if (
                    mockQuestions.length === 0
                ) {

                    throw new Error(
                        "No questions are available for this exam."
                    );

                }


                userAnswers =
                    new Array(
                        mockQuestions.length
                    ).fill(null);


                totalQuestions.textContent =
                    mockQuestions.length;


                startedAt =
                    new Date().toISOString();


                createQuestionPalette();

                displayQuestion();

                startTimer();


                quizMessage.textContent =
                    `Live mock test loaded with ${mockQuestions.length} question(s).`;

            }

            catch (error) {

                console.error(
                    "Mock test load error:",
                    error
                );


                showError(
                    error.message
                );

            }

        }


        // =========================================
        // DISPLAY QUESTION
        // =========================================

        function displayQuestion() {

            const question =
                mockQuestions[
                    currentQuestion
                ];


            if (!question) {
                return;
            }


            questionText.textContent =
                question.question_text ||
                "Question unavailable";


            questionCount.textContent =
                currentQuestion + 1;


            currentQuestionNumber.textContent =
                currentQuestion + 1;


            subjectLabel.textContent =
                question.subject ||
                "General";


            topicLabel.textContent =
                question.topic ||
                "General Topic";


            optionsContainer.innerHTML =
                "";


            (
                question.options || []
            ).forEach(
                function (
                    option,
                    index
                ) {

                    const label =
                        document.createElement(
                            "label"
                        );


                    label.className =
                        "option-label";


                    const selected =
                        userAnswers[
                            currentQuestion
                        ] ===
                        Number(
                            option.option_id
                        );


                    if (selected) {

                        label.classList.add(
                            "selected"
                        );

                    }


                    const radio =
                        document.createElement(
                            "input"
                        );


                    radio.type =
                        "radio";


                    radio.name =
                        "mockAnswer";


                    radio.value =
                        option.option_id;


                    radio.checked =
                        selected;


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


                    label.appendChild(
                        radio
                    );


                    label.appendChild(
                        letter
                    );


                    label.appendChild(
                        text
                    );


                    radio.addEventListener(
                        "change",
                        function () {

                            userAnswers[
                                currentQuestion
                            ] =
                                Number(
                                    option.option_id
                                );


                            updateOptionStyle();

                            updatePalette();

                            updateSummary();

                            quizMessage.textContent =
                                "";

                        }
                    );


                    optionsContainer.appendChild(
                        label
                    );

                }
            );


            updateOptionStyle();

            updateNavigation();

            updateProgress();

            updatePalette();

            updateSummary();

        }


        // =========================================
        // OPTION STYLE
        // =========================================

        function updateOptionStyle() {

            const labels =
                document.querySelectorAll(
                    ".option-label"
                );


            labels.forEach(
                function (
                    label,
                    index
                ) {

                    const option =
                        mockQuestions[
                            currentQuestion
                        ]?.options?.[
                            index
                        ];


                    if (
                        option &&
                        userAnswers[
                            currentQuestion
                        ] ===
                        Number(
                            option.option_id
                        )
                    ) {

                        label.classList.add(
                            "selected"
                        );

                    }

                    else {

                        label.classList.remove(
                            "selected"
                        );

                    }

                }
            );

        }


        // =========================================
        // NAVIGATION
        // =========================================

        function updateNavigation() {

            previousButton.disabled =
                currentQuestion === 0;


            if (
                currentQuestion ===
                mockQuestions.length - 1
            ) {

                nextButton.style.display =
                    "none";

            }

            else {

                nextButton.style.display =
                    "block";

            }

        }


        // =========================================
        // PROGRESS
        // =========================================

        function updateProgress() {

            if (
                mockQuestions.length === 0
            ) {

                return;

            }


            const percentage =
                (
                    (
                        currentQuestion + 1
                    ) /
                    mockQuestions.length
                ) * 100;


            progressBar.style.width =
                `${percentage}%`;

        }


        // =========================================
        // QUESTION PALETTE
        // =========================================

        function createQuestionPalette() {

            questionPalette.innerHTML =
                "";


            mockQuestions.forEach(
                function (
                    _,
                    index
                ) {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "palette-button";


                    button.textContent =
                        index + 1;


                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                quizFinished
                            ) {

                                return;

                            }


                            currentQuestion =
                                index;


                            quizMessage.textContent =
                                "";


                            displayQuestion();

                        }
                    );


                    questionPalette.appendChild(
                        button
                    );

                }
            );

        }


        // =========================================
        // UPDATE PALETTE
        // =========================================

        function updatePalette() {

            const buttons =
                document.querySelectorAll(
                    ".palette-button"
                );


            buttons.forEach(
                function (
                    button,
                    index
                ) {

                    button.classList.remove(
                        "current",
                        "answered"
                    );


                    if (
                        index ===
                        currentQuestion
                    ) {

                        button.classList.add(
                            "current"
                        );

                    }


                    if (
                        userAnswers[
                            index
                        ] !== null
                    ) {

                        button.classList.add(
                            "answered"
                        );

                    }

                }
            );

        }


        // =========================================
        // SUMMARY
        // =========================================

        function updateSummary() {

            const answered =
                userAnswers.filter(
                    answer =>
                        answer !== null
                ).length;


            const remaining =
                mockQuestions.length -
                answered;


            answeredCount.textContent =
                answered;


            remainingCount.textContent =
                remaining;

        }


        // =========================================
        // NEXT
        // =========================================

        nextButton.addEventListener(
            "click",
            function () {

                if (
                    currentQuestion <
                    mockQuestions.length - 1
                ) {

                    currentQuestion++;

                    displayQuestion();

                }

            }
        );


        // =========================================
        // PREVIOUS
        // =========================================

        previousButton.addEventListener(
            "click",
            function () {

                if (
                    currentQuestion > 0
                ) {

                    currentQuestion--;

                    displayQuestion();

                }

            }
        );


        // =========================================
        // SUBMIT BUTTON
        // =========================================

        submitButton.addEventListener(
            "click",
            function () {

                const unanswered =
                    userAnswers.filter(
                        answer =>
                            answer === null
                    ).length;


                if (
                    unanswered > 0
                ) {

                    submitMessage.textContent =
                        `You have ${unanswered} unanswered question(s). Do you still want to submit the test?`;

                }

                else {

                    submitMessage.textContent =
                        "You have answered all questions. Are you sure you want to submit the test?";

                }


                submitModal.classList.add(
                    "show"
                );

            }
        );


        // =========================================
        // CANCEL
        // =========================================

        cancelSubmit.addEventListener(
            "click",
            function () {

                submitModal.classList.remove(
                    "show"
                );

            }
        );


        // =========================================
        // CONFIRM
        // =========================================

        confirmSubmit.addEventListener(
            "click",
            function () {

                submitMockTest(
                    false
                );

            }
        );


        // =========================================
        // TIMER
        // =========================================

        function startTimer() {

            updateTimerDisplay();


            timerInterval =
                setInterval(
                    function () {

                        if (
                            quizFinished
                        ) {

                            clearInterval(
                                timerInterval
                            );

                            return;

                        }


                        timeLeft--;


                        updateTimerDisplay();


                        if (
                            timeLeft <= 0
                        ) {

                            clearInterval(
                                timerInterval
                            );


                            submitModal.classList.remove(
                                "show"
                            );


                            submitMockTest(
                                true
                            );

                        }

                    },
                    1000
                );

        }


        // =========================================
        // TIMER DISPLAY
        // =========================================

        function updateTimerDisplay() {

            const minutes =
                Math.floor(
                    timeLeft / 60
                );


            const seconds =
                timeLeft % 60;


            timerElement.textContent =
                `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


            timerBox.classList.remove(
                "warning",
                "danger"
            );


            if (
                timeLeft <= 60
            ) {

                timerBox.classList.add(
                    "danger"
                );

            }

            else if (
                timeLeft <= 300
            ) {

                timerBox.classList.add(
                    "warning"
                );

            }

        }


        // =========================================
        // SUBMIT TO BACKEND
        // =========================================

        async function submitMockTest(
            autoSubmitted
        ) {

            if (
                quizFinished
            ) {

                return;

            }


            quizFinished =
                true;


            clearInterval(
                timerInterval
            );


            submitModal.classList.remove(
                "show"
            );


            submitButton.disabled =
                true;


            confirmSubmit.disabled =
                true;


            quizMessage.textContent =
                "Submitting mock test and updating your performance...";


            const token =
                localStorage.getItem(
                    TOKEN_KEY
                );


            const answers =
                mockQuestions.map(
                    function (
                        question,
                        index
                    ) {

                        return {

                            question_id:
                                Number(
                                    question.question_id
                                ),

                            selected_option_id:
                                userAnswers[
                                    index
                                ] === null
                                    ? null
                                    : Number(
                                        userAnswers[
                                            index
                                        ]
                                    )

                        };

                    }
                );


            try {

                const response =
                    await fetch(
                        `${API_BASE_URL}/api/quiz/submit`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`

                            },

                            body:
    JSON.stringify({

        exam_id:
            examId,

        answers:
            answers

    })

                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Mock test submission failed."
                    );

                }


                const result =
                    data.result;


                const timeUsed =
                    totalTime -
                    timeLeft;


                const minutesUsed =
                    Math.floor(
                        timeUsed / 60
                    );


                const secondsUsed =
                    timeUsed % 60;


                const timeTaken =
                    `${String(minutesUsed).padStart(2, "0")}:${String(secondsUsed).padStart(2, "0")}`;


                const resultData = {

                    type:
                        "mock-test",

                    attemptId:
                        result.attempt_id,

                    exam:
                        selectedExam,

                    examName:
                        selectedExamName,

                    total:
                        Number(
                            result.total_questions
                        ) || mockQuestions.length,

                    correct:
                        Number(
                            result.correct_answers
                        ) || 0,

                    wrong:
                        Number(
                            result.wrong_answers
                        ) || 0,

                    unanswered:
                        Number(
                            result.unanswered_answers
                        ) || 0,

                    accuracy:
                        Number(
                            result.score
                        ) || 0,

                    score:
                        Number(
                            result.score
                        ) || 0,

                    timeTaken:
                        timeTaken,

                    autoSubmitted:
                        autoSubmitted,

                    subjectPerformance:
                        result.subjectPerformance ||
                        {},

                    questions:
                        result.questions ||
                        [],

                    completedAt:
                        new Date().toISOString()

                };


                sessionStorage.setItem(
                    "mockTestResult",
                    JSON.stringify(
                        resultData
                    )
                );


                localStorage.setItem(
                    "lastMockTestResult",
                    JSON.stringify(
                        resultData
                    )
                );


                window.location.href =
                    "mock-test-result.html";

            }

            catch (error) {

                console.error(
                    "Mock test submission error:",
                    error
                );


                quizFinished =
                    false;


                confirmSubmit.disabled =
                    false;


                submitButton.disabled =
                    false;


                quizMessage.textContent =
                    error.message ||
                    "Unable to submit the mock test.";


                submitModal.classList.add(
                    "show"
                );

            }

        }


        // =========================================
        // ERROR
        // =========================================

        function showError(
            message
        ) {

            quizMessage.textContent =
                message ||
                "Unable to load the mock test.";


            questionText.textContent =
                "Mock test could not be loaded.";


            optionsContainer.innerHTML = `

                <div style="
                    padding:20px;
                    text-align:center;
                ">

                    ⚠️
                    ${escapeHTML(
                        message ||
                        "Please try again."
                    )}

                </div>

            `;


            previousButton.disabled =
                true;


            nextButton.disabled =
                true;


            submitButton.disabled =
                true;

        }


        // =========================================
        // HTML ESCAPE
        // =========================================

        function escapeHTML(
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


        // =========================================
        // START
        // =========================================

        loadMockTest();

    }
);