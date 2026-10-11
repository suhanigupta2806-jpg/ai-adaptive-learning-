/* =========================================
   RESULT PAGE JAVASCRIPT
   AdaptiveLearn

   Phase 9.7
   Existing Result UI + MySQL Sync
========================================= */


document.addEventListener(
    "DOMContentLoaded",
    async function () {


    // =====================================================
    // GET QUIZ RESULT
    // =====================================================

    const resultData =
        sessionStorage.getItem("quizResult");


    // =====================================================
    // NO RESULT
    // =====================================================

    if (!resultData) {

        document.getElementById(
            "resultMessage"
        ).textContent =
            "No quiz result was found. Please attempt a quiz first.";

        document.getElementById(
            "performanceMessage"
        ).textContent =
            "Complete a quiz to view your performance analysis.";

        document.getElementById(
            "recommendationText"
        ).textContent =
            "Your personalized recommendation will appear after you complete a quiz.";

        document.getElementById(
            "weakTopicMessage"
        ).textContent =
            "No weak topic has been identified yet.";

        return;
    }


    // =====================================================
    // CONVERT JSON
    // =====================================================

    let result;

    try {

        result =
            JSON.parse(resultData);

    } catch (error) {

        console.error(
            "Invalid quiz result data:",
            error
        );

        return;
    }


    // =====================================================
    // VALUES
    // =====================================================

    const total =
        Number(result.total) || 0;

    const correct =
        Number(result.correct) || 0;

    const wrong =
        Number(result.wrong) || 0;

    const accuracy =
        Number(result.accuracy) || 0;

    const topic =
        result.topicName ||
        result.topic ||
        "Selected Topic";

    const exam =
        result.examName ||
        result.exam ||
        "Selected Exam";

    const subject =
        result.subject ||
        "Selected Subject";

    const timeTaken =
        result.timeTakenFormatted ||
        result.timeTaken ||
        "00:00";


    // =====================================================
    // DISPLAY EXAM / SUBJECT / TOPIC
    // =====================================================

    document.getElementById(
        "examName"
    ).textContent =
        exam;

    document.getElementById(
        "subjectName"
    ).textContent =
        subject;

    document.getElementById(
        "topicName"
    ).textContent =
        topic;


    // =====================================================
    // DISPLAY SCORE
    // =====================================================

    document.getElementById(
        "score"
    ).textContent =
        accuracy + "%";


    // =====================================================
    // DISPLAY STATISTICS
    // =====================================================

    document.getElementById(
        "totalQuestions"
    ).textContent =
        total;

    document.getElementById(
        "correctAnswers"
    ).textContent =
        correct;

    document.getElementById(
        "wrongAnswers"
    ).textContent =
        wrong;

    document.getElementById(
        "accuracy"
    ).textContent =
        accuracy + "%";


    // =====================================================
    // DISPLAY TIME
    // =====================================================

    document.getElementById(
        "timeTaken"
    ).textContent =
        timeTaken;


    // =====================================================
    // PERFORMANCE %
    // =====================================================

    document.getElementById(
        "performancePercent"
    ).textContent =
        accuracy + "%";


    // =====================================================
    // PROGRESS BAR
    // =====================================================

    setTimeout(
        function () {

            const progressFill =
                document.getElementById(
                    "progressFill"
                );

            if (progressFill) {

                progressFill.style.width =
                    accuracy + "%";

            }

        },
        300
    );


    // =====================================================
    // EXISTING PERFORMANCE LOGIC
    // =====================================================

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

    const weakTopicMessage =
        document.getElementById(
            "weakTopicMessage"
        );


    if (accuracy >= 70) {

        resultTitle.textContent =
            "Excellent Performance! 🎉";

        resultMessage.textContent =
            "You have demonstrated a good understanding of this topic.";

        performanceMessage.textContent =
            "Your accuracy is at or above the target level. You are performing well in this topic. Continue practicing to maintain your performance.";

        recommendationText.textContent =
            "Your performance indicates good mastery of " +
            topic +
            ". You can move to another topic or attempt a higher difficulty level.";

        nextStep.textContent =
            "Move to the next topic or try a harder practice set.";

        weakTopicMessage.textContent =
            "Strong Topic: " +
            topic +
            ". Your current performance is good, so additional basic practice is not the immediate priority.";

    }

    else if (accuracy >= 50) {

        resultTitle.textContent =
            "Good, But There Is Room to Improve 👍";

        resultMessage.textContent =
            "You have a moderate understanding of this topic.";

        performanceMessage.textContent =
            "Your accuracy is at a medium level. You understand some concepts, but additional practice can help improve your consistency and accuracy.";

        recommendationText.textContent =
            "Your performance suggests medium mastery of " +
            topic +
            ". We recommend additional practice, especially on questions that you answered incorrectly.";

        nextStep.textContent =
            "Practice this topic again.";

        weakTopicMessage.textContent =
            "Focus Area: " +
            topic +
            ". This topic needs additional practice before moving to more difficult questions.";

    }

    else {

        resultTitle.textContent =
            "More Practice Recommended 📚";

        resultMessage.textContent =
            "This topic appears to be one of your weaker areas.";

        performanceMessage.textContent =
            "Your accuracy is below the target level. Review the concepts related to this topic and attempt another practice set.";

        recommendationText.textContent =
            "The system has identified " +
            topic +
            " as a weak area based on your quiz performance. More practice is recommended before moving ahead.";

        nextStep.textContent =
            "Revise the topic and attempt another practice test.";

        weakTopicMessage.textContent =
            "⚠ Weak Topic Detected: " +
            topic +
            ". Your accuracy is below 50%, so this topic should be given higher priority in your study plan.";

    }


    // =====================================================
    // ANSWER REVIEW
    // =====================================================

    const reviewContainer =
        document.getElementById(
            "reviewContainer"
        );


    if (
        result.questions &&
        result.questions.length > 0
    ) {

        reviewContainer.innerHTML = "";


        result.questions.forEach(
            function (question, index) {


            const reviewCard =
                document.createElement(
                    "div"
                );


            const isCorrect =
                question.selected ===
                question.correct;


            reviewCard.className =
                "review-question " +
                (
                    isCorrect
                        ? "correct"
                        : "incorrect"
                );


            const selectedAnswer =
                question.selected ||
                "Not Answered";


            const correctAnswer =
                question.correct ||
                "Not Available";


            const explanation =
                question.explanation ||
                "No explanation is available for this question.";


            reviewCard.innerHTML = `

                <h3>
                    Question ${index + 1}:
                    ${question.question}
                </h3>

                <div class="answer-row">

                    <span class="answer-label">
                        Your Answer:
                    </span>

                    <span class="${
                        isCorrect
                            ? "correct-answer"
                            : "wrong-answer"
                    }">

                        ${
                            isCorrect
                                ? "✅ "
                                : "❌ "
                        }

                        ${selectedAnswer}

                    </span>

                </div>


                <div class="answer-row">

                    <span class="answer-label">
                        Correct Answer:
                    </span>

                    <span class="correct-answer">

                        ✅ ${correctAnswer}

                    </span>

                </div>


                <div class="explanation">

                    <strong>
                        Explanation:
                    </strong>

                    ${explanation}

                </div>

            `;


            reviewContainer.appendChild(
                reviewCard
            );

        });

    }

    else {

        reviewContainer.innerHTML = `

            <div class="review-question">

                <h3>
                    Detailed review is not available.
                </h3>

                <p>
                    Please complete a quiz using the
                    latest quiz system to view
                    question-by-question analysis.
                </p>

            </div>

        `;

    }


    // =====================================================
    // SYNC RESULT TO MYSQL
    // =====================================================

    await syncResultToDatabase(result);

});


// ============================================================
// SEND EXISTING RESULT TO BACKEND
// ============================================================

async function syncResultToDatabase(result) {

    try {

        // ----------------------------------------------------
        // Prevent duplicate submission during this result
        // ----------------------------------------------------

        const alreadySynced =
            sessionStorage.getItem(
                "quizResultBackendSynced"
            );


        if (alreadySynced === "true") {

            console.log(
                "Quiz result already synced."
            );

            return;
        }


        // ----------------------------------------------------
        // Authentication token
        // ----------------------------------------------------

        const token =
            localStorage.getItem(
                "adaptiveLearnToken"
            );


        if (!token) {

            console.warn(
                "No authentication token. Result remains available locally."
            );

            return;
        }


        // ----------------------------------------------------
        // Send result
        // ----------------------------------------------------

        const response =
            await fetch(
                "http://localhost:5000/api/quiz/sync-result",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        exam:
                            result.exam,

                        examName:
                            result.examName,

                        subject:
                            result.subject,

                        topic:
                            result.topic,

                        topicName:
                            result.topicName,

                        total:
                            result.total,

                        correct:
                            result.correct,

                        wrong:
                            result.wrong,

                        accuracy:
                            result.accuracy,

                        timeTaken:
                            result.timeTaken,

                        questions:
                            result.questions

                    })

                }
            );


        // ----------------------------------------------------
        // Read response
        // ----------------------------------------------------

        const data =
            await response.json();


        // ----------------------------------------------------
        // Success
        // ----------------------------------------------------

        if (
            response.ok &&
            data.success === true
        ) {

            console.log(
                "✅ Quiz result saved to MySQL:",
                data.result
            );


            sessionStorage.setItem(
                "quizResultBackendSynced",
                "true"
            );


            // Save backend attempt ID
            // without changing existing result structure

            sessionStorage.setItem(
                "quizAttemptId",
                String(
                    data.result.attempt_id
                )
            );


        } else {

            console.warn(
                "Quiz result was not saved:",
                data.message
            );

        }


    } catch (error) {

        console.error(
            "Quiz backend sync error:",
            error
        );

        /*
         * Existing result page continues to work.
         * Backend failure does not destroy the quiz result.
         */

    }

}