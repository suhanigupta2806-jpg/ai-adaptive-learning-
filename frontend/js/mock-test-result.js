/* =========================================
   MOCK TEST RESULT JAVASCRIPT
   AdaptiveLearn
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       GET MOCK TEST RESULT
    ========================================= */

    const resultData =
        sessionStorage.getItem("mockTestResult");


    /* =========================================
       IF RESULT DOES NOT EXIST
    ========================================= */

    if (!resultData) {

        showNoResult();

        return;
    }


    /* =========================================
       PARSE RESULT
    ========================================= */

    let result;

    try {

        result = JSON.parse(resultData);

    } catch (error) {

        console.error(
            "Unable to read mock test result:",
            error
        );

        showNoResult();

        return;
    }


    /* =========================================
       BASIC VALUES
    ========================================= */

    const exam =
        result.examName ||
        result.exam ||
        sessionStorage.getItem("mockTestExamName") ||
        "Selected Exam";


    const total =
        Number(result.total) || 0;


    const correct =
        Number(result.correct) || 0;


    const wrong =
        Number(result.wrong) || 0;


    const unanswered =
        Number(result.unanswered) ||
        Math.max(
            total - correct - wrong,
            0
        );


    const accuracy =
        Number(result.accuracy) || 0;


    const timeTaken =
        result.timeTaken ||
        "00:00";


    /* =========================================
       DISPLAY BASIC INFORMATION
    ========================================= */

    document.getElementById(
        "examName"
    ).textContent = exam;


    document.getElementById(
        "score"
    ).textContent = accuracy + "%";


    document.getElementById(
        "totalQuestions"
    ).textContent = total;


    document.getElementById(
        "correctAnswers"
    ).textContent = correct;


    document.getElementById(
        "wrongAnswers"
    ).textContent = wrong;


    document.getElementById(
        "unansweredAnswers"
    ).textContent = unanswered;


    document.getElementById(
        "accuracy"
    ).textContent = accuracy + "%";


    document.getElementById(
        "timeTaken"
    ).textContent = timeTaken;


    document.getElementById(
        "performancePercent"
    ).textContent = accuracy + "%";


    /* =========================================
       PERFORMANCE PROGRESS BAR
    ========================================= */

    setTimeout(function () {

        document.getElementById(
            "progressFill"
        ).style.width = accuracy + "%";

    }, 300);


    /* =========================================
       PERFORMANCE MESSAGE
    ========================================= */

    const resultTitle =
        document.getElementById(
            "resultTitle"
        );


    const resultMessage =
        document.getElementById(
            "resultMessage"
        );


    const performanceMessage =
        document.getElementById(
            "performanceMessage"
        );


    const recommendationText =
        document.getElementById(
            "recommendationText"
        );


    const nextStep =
        document.getElementById(
            "nextStep"
        );


    if (accuracy >= 70) {

        resultTitle.textContent =
            "Excellent Mock Test Performance! 🎉";


        resultMessage.textContent =
            "You have achieved the target accuracy level. Your overall preparation is progressing well.";


        performanceMessage.textContent =
            "Your accuracy is at or above the 70% target. You are showing good preparation across the mock test. Continue practicing regularly and focus on maintaining consistency.";


        recommendationText.textContent =
            "Your performance indicates good overall preparation. You can now focus on improving speed, reducing mistakes, and strengthening any individual subject that scored lower.";


        nextStep.textContent =
            "Attempt another mock test or practice your lowest-scoring subject.";

    }

    else if (accuracy >= 50) {

        resultTitle.textContent =
            "Good Progress — Keep Improving 👍";


        resultMessage.textContent =
            "You have a moderate level of preparation, but some areas still need improvement.";


        performanceMessage.textContent =
            "Your accuracy is below the 70% target but above 50%. You have a reasonable understanding of the exam concepts, but more consistent practice is recommended.";


        recommendationText.textContent =
            "The system recommends reviewing your weaker subjects and attempting additional practice questions before taking another full mock test.";


        nextStep.textContent =
            "Practice your weak subjects and retake a mock test.";

    }

    else {

        resultTitle.textContent =
            "More Preparation Recommended 📚";


        resultMessage.textContent =
            "Your current mock test score indicates that you need more practice before attempting the exam at full difficulty.";


        performanceMessage.textContent =
            "Your accuracy is below 50%. Focus on building fundamental concepts, reviewing incorrect answers, and practicing your weak subjects regularly.";


        recommendationText.textContent =
            "The adaptive system recommends prioritizing your weakest subjects and topics before attempting another full mock test.";


        nextStep.textContent =
            "Revise weak subjects and complete targeted practice first.";

    }


    /* =========================================
       SUBJECT PERFORMANCE
    ========================================= */

    displaySubjectPerformance(
        result.subjectPerformance
    );


    /* =========================================
       FOCUS AREAS
    ========================================= */

    displayFocusAreas(
        result.subjectPerformance
    );


    /* =========================================
       ANSWER REVIEW
    ========================================= */

    displayAnswerReview(
        result.questions
    );


    /* =========================================
       SAVE SIMPLE MOCK TEST HISTORY
    ========================================= */

    saveMockTestHistory(
        result,
        exam,
        accuracy
    );

});


/* =========================================
   SUBJECT PERFORMANCE
========================================= */

function displaySubjectPerformance(
    subjectPerformance
) {

    const container =
        document.getElementById(
            "subjectPerformance"
        );


    container.innerHTML = "";


    if (
        !subjectPerformance ||
        typeof subjectPerformance !== "object"
    ) {

        container.innerHTML = `

            <div class="subject-card">

                <strong>
                    Subject analysis is not available.
                </strong>

            </div>

        `;

        return;
    }


    const subjects =
        Object.keys(subjectPerformance);


    if (subjects.length === 0) {

        container.innerHTML = `

            <div class="subject-card">

                <strong>
                    Subject analysis is not available.
                </strong>

            </div>

        `;

        return;
    }


    subjects.forEach(function (subject) {

        const data =
            subjectPerformance[subject];


        const total =
            Number(data.total) || 0;


        const correct =
            Number(data.correct) || 0;


        const wrong =
            Number(data.wrong) || 0;


        const unanswered =
            Number(data.unanswered) || 0;


        const accuracy =
            Number(data.accuracy) || 0;


        const card =
            document.createElement("div");


        card.className =
            "subject-card";


        card.innerHTML = `

            <div class="subject-header">

                <span class="subject-name">
                    ${subject}
                </span>

                <span class="subject-percent">
                    ${accuracy}%
                </span>

            </div>


            <div class="subject-progress">

                <div
                    class="subject-progress-fill"
                    style="width: ${accuracy}%">
                </div>

            </div>


            <div class="subject-details">

                <span>
                    Correct: ${correct}
                </span>

                <span>
                    Wrong: ${wrong}
                </span>

                <span>
                    Total: ${total}
                </span>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================================
   FOCUS AREAS
========================================= */

function displayFocusAreas(
    subjectPerformance
) {

    const container =
        document.getElementById(
            "focusAreas"
        );


    container.innerHTML = "";


    if (
        !subjectPerformance ||
        typeof subjectPerformance !== "object"
    ) {

        container.innerHTML = `

            <div class="focus-item">

                <strong>
                    No focus area available
                </strong>

                <span>
                    Complete another mock test to generate
                    subject-level recommendations.
                </span>

            </div>

        `;

        return;
    }


    const subjects =
        Object.keys(subjectPerformance);


    const sortedSubjects =
        subjects.sort(function (a, b) {

            return (
                Number(
                    subjectPerformance[a].accuracy
                ) -
                Number(
                    subjectPerformance[b].accuracy
                )
            );

        });


    const weakestSubjects =
        sortedSubjects.slice(0, 2);


    weakestSubjects.forEach(function (subject) {

        const data =
            subjectPerformance[subject];


        const accuracy =
            Number(data.accuracy) || 0;


        const item =
            document.createElement("div");


        item.className =
            "focus-item";


        if (accuracy < 50) {

            item.innerHTML = `

                <strong>
                    ⚠ ${subject}
                </strong>

                <span>
                    Accuracy: ${accuracy}% —
                    This is currently a high-priority
                    area for improvement.
                </span>

            `;

        }

        else if (accuracy < 70) {

            item.innerHTML = `

                <strong>
                    📌 ${subject}
                </strong>

                <span>
                    Accuracy: ${accuracy}% —
                    Additional practice is recommended
                    to reach the target level.
                </span>

            `;

        }

        else {

            item.innerHTML = `

                <strong>
                    ⭐ ${subject}
                </strong>

                <span>
                    Accuracy: ${accuracy}% —
                    Performance is currently at the
                    target level.
                </span>

            `;

        }


        container.appendChild(item);

    });

}


/* =========================================
   ANSWER REVIEW
========================================= */

function displayAnswerReview(
    questions
) {

    const container =
        document.getElementById(
            "reviewContainer"
        );


    container.innerHTML = "";


    if (
        !questions ||
        !Array.isArray(questions) ||
        questions.length === 0
    ) {

        container.innerHTML = `

            <div class="review-question">

                <h3>
                    Detailed review is not available.
                </h3>

                <p>
                    Complete a mock test using the
                    latest mock test system to view
                    question-by-question analysis.
                </p>

            </div>

        `;

        return;
    }


    questions.forEach(
        function (question, index) {

            const selected =
                question.selected;


            const correct =
                question.correct;


            const explanation =
                question.explanation ||
                "No explanation is available for this question.";


            const isUnanswered =
                selected === null ||
                selected === undefined ||
                selected === "";


            const isCorrect =
                !isUnanswered &&
                selected === correct;


            let cardClass =
                "review-question";


            if (isCorrect) {

                cardClass +=
                    " correct";

            }

            else if (isUnanswered) {

                cardClass +=
                    " unanswered";

            }

            else {

                cardClass +=
                    " incorrect";

            }


            const reviewCard =
                document.createElement("div");


            reviewCard.className =
                cardClass;


            /* =================================
               QUESTION TEXT
            ================================= */

            const subject =
                question.subject ||
                "General";


            const topic =
                question.topic ||
                "General Topic";


            let answerHTML = "";


            if (isUnanswered) {

                answerHTML = `

                    <div class="answer-row">

                        <span class="answer-label">
                            Your Answer:
                        </span>

                        <span class="unanswered-answer">
                            ⭕ Not Answered
                        </span>

                    </div>

                `;

            }

            else if (isCorrect) {

                answerHTML = `

                    <div class="answer-row">

                        <span class="answer-label">
                            Your Answer:
                        </span>

                        <span class="correct-answer">
                            ✅ ${escapeHTML(selected)}
                        </span>

                    </div>

                `;

            }

            else {

                answerHTML = `

                    <div class="answer-row">

                        <span class="answer-label">
                            Your Answer:
                        </span>

                        <span class="wrong-answer">
                            ❌ ${escapeHTML(selected)}
                        </span>

                    </div>

                `;

            }


            reviewCard.innerHTML = `

                <span class="question-meta">

                    ${escapeHTML(subject)}
                    •
                    ${escapeHTML(topic)}

                </span>


                <h3>

                    Question ${index + 1}:
                    ${escapeHTML(
                        question.question ||
                        "Question unavailable"
                    )}

                </h3>


                ${answerHTML}


                <div class="answer-row">

                    <span class="answer-label">
                        Correct Answer:
                    </span>

                    <span class="correct-answer">

                        ✅
                        ${escapeHTML(
                            correct ||
                            "Not Available"
                        )}

                    </span>

                </div>


                <div class="explanation">

                    <strong>
                        Explanation:
                    </strong>

                    ${escapeHTML(explanation)}

                </div>

            `;


            container.appendChild(
                reviewCard
            );

        }
    );

}


/* =========================================
   NO RESULT HANDLER
========================================= */

function showNoResult() {

    document.getElementById(
        "examName"
    ).textContent = "No Test Result";


    document.getElementById(
        "resultTitle"
    ).textContent = "No Mock Test Result Found";


    document.getElementById(
        "resultMessage"
    ).textContent =
        "Please complete a mock test before viewing this page.";


    document.getElementById(
        "performanceMessage"
    ).textContent =
        "No performance data is available yet.";


    document.getElementById(
        "recommendationText"
    ).textContent =
        "Start a mock test to generate your personalized performance analysis.";


    document.getElementById(
        "nextStep"
    ).textContent =
        "Go to Mock Test and start your first test.";


    document.getElementById(
        "reviewContainer"
    ).innerHTML = `

        <div class="review-question">

            <h3>
                No result available.
            </h3>

            <p>
                Please complete a mock test first.
            </p>

        </div>

    `;


    document.getElementById(
        "subjectPerformance"
    ).innerHTML = `

        <div class="subject-card">

            <strong>
                No subject data available.
            </strong>

        </div>

    `;


    document.getElementById(
        "focusAreas"
    ).innerHTML = `

        <div class="focus-item">

            <strong>
                No focus areas yet
            </strong>

            <span>
                Complete a mock test to identify
                your weaker subjects.
            </span>

        </div>

    `;

}


/* =========================================
   SAVE MOCK TEST HISTORY
========================================= */

function saveMockTestHistory(
    result,
    exam,
    accuracy
) {

    const historyKey =
        "adaptiveLearnMockTestHistory";


    let history = [];


    try {

        const stored =
            localStorage.getItem(
                historyKey
            );


        if (stored) {

            history =
                JSON.parse(stored);

        }

    } catch (error) {

        history = [];

    }


    if (!Array.isArray(history)) {

        history = [];

    }


    const historyItem = {

        exam: exam,

        accuracy: accuracy,

        total: result.total || 0,

        correct: result.correct || 0,

        wrong: result.wrong || 0,

        unanswered: result.unanswered || 0,

        timeTaken:
            result.timeTaken || "00:00",

        date:
            new Date().toISOString()

    };


    history.push(historyItem);


    /* Keep only the latest 10 tests */

    if (history.length > 10) {

        history =
            history.slice(
                history.length - 10
            );

    }


    localStorage.setItem(
        historyKey,
        JSON.stringify(history)
    );

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

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