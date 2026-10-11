/* =========================================================
   AI ADAPTIVE LEARNING SYSTEM
   LIVE PERSONALIZED STUDY PLAN
========================================================= */

"use strict";


const API_BASE_URL =
    "http://localhost:5000";

const TOKEN_KEY =
    "adaptiveLearnToken";


let currentPlan =
    null;

let planTopics =
    [];


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const token =
            localStorage.getItem(
                TOKEN_KEY
            );


        if (!token) {

            window.location.href =
                "login.html";

            return;
        }


        await loadStudyPlan();

    }
);


/* =========================================================
   GET SELECTED EXAM
========================================================= */

function getExamId() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const queryExam =
        params.get(
            "exam_id"
        );


    if (
        queryExam &&
        Number(queryExam)
    ) {

        return Number(
            queryExam
        );
    }


    const exam =
        (
            params.get("exam") ||
            ""
        ).toLowerCase();


    const examMap = {

        esic: 1,

        oicl: 2,

        niacl: 3

    };


    if (
        examMap[exam]
    ) {

        return examMap[exam];
    }


    return 1;
}


/* =========================================================
   LOAD PLAN FROM BACKEND
========================================================= */

async function loadStudyPlan() {

    try {

        showLoading();


        const examId =
            getExamId();


        const response =
            await fetch(
                `${API_BASE_URL}/api/study-plans/current?exam_id=${examId}`,
                {

                    method:
                        "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${localStorage.getItem(TOKEN_KEY)}`,

                        "Accept":
                            "application/json"
                    }

                }
            );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                TOKEN_KEY
            );


            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load study plan."
            );
        }


        currentPlan =
            data.plan;


        planTopics =
            Array.isArray(
                data.topics
            )

                ? data.topics

                : [];


        renderPlan();


        console.log(
            "Live study plan loaded:",
            data
        );


    } catch (error) {

        console.error(
            "Study plan error:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderPlan() {

    updateHeader();

    renderOverview();

    renderRecommendation();

    renderTodayTasks();

    renderWeeklyPlan();

    renderWeakTopics();

}


/* =========================================================
   HEADER
========================================================= */

function updateHeader() {

    const profileName =
        document.querySelector(
            ".profile-name"
        );


    if (profileName) {

        profileName.textContent =
            "Student";
    }


    const avatar =
        document.querySelector(
            ".avatar"
        );


    if (avatar) {

        avatar.textContent =
            "S";
    }

}


/* =========================================================
   OVERVIEW
========================================================= */

function renderOverview() {

    const total =
        planTopics.length;


    const completed =
        planTopics.filter(
            topic =>
                Number(
                    topic.completed
                ) === 1
        ).length;


    const progress =
        total > 0

            ? Math.round(
                (
                    completed /
                    total
                ) * 100
            )

            : 0;


    /*
       Each planned topic gets
       approximately 20 minutes.
       This is presentation/UI guidance;
       actual topic duration is not stored
       in the current database schema.
    */

    const studyMinutes =
        completed * 20;


    setText(
        "totalTasks",
        total
    );


    setText(
        "completedTasks",
        completed
    );


    setText(
        "studyTime",
        `${studyMinutes} min`
    );


    setText(
        "planProgress",
        `${progress}%`
    );


    setText(
        "progressPercentage",
        `${progress}%`
    );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            `${progress}%`;
    }


    const message =
        document.getElementById(
            "progressMessage"
        );


    if (!message) {
        return;
    }


    if (progress === 0) {

        message.textContent =
            "Start your first task to begin improving your study progress.";

    } else if (progress < 50) {

        message.textContent =
            "Good start! Keep completing your planned tasks.";

    } else if (progress < 100) {

        message.textContent =
            "You're making good progress. Keep going!";

    } else {

        message.textContent =
            "Excellent! You completed your study plan.";

    }

}


/* =========================================================
   TODAY
========================================================= */

function renderTodayTasks() {

    const container =
        document.getElementById(
            "todayTasks"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const today =
        getLocalDateString(
            new Date()
        );


    let todayTasks =
        planTopics.filter(
            topic =>
                String(
                    topic.planned_date
                ).slice(0, 10) === today
        );


    /*
       If the browser date doesn't match
       because of timezone formatting,
       show the first incomplete topics.
    */

    if (!todayTasks.length) {

        todayTasks =
            planTopics
                .filter(
                    topic =>
                        Number(
                            topic.completed
                        ) !== 1
                )
                .slice(
                    0,
                    4
                );
    }


    setText(
        "todayCount",
        `${todayTasks.length} Tasks`
    );


    if (!todayTasks.length) {

        container.innerHTML = `

            <div class="task-card">

                <div class="task-content">

                    <h3>
                        🎉 Today's plan is complete
                    </h3>

                    <p>
                        Excellent work! Continue tomorrow with your next adaptive tasks.
                    </p>

                </div>

            </div>

        `;

        return;
    }


    todayTasks.forEach(
        function (task) {

            container.appendChild(
                createTaskCard(
                    task
                )
            );

        }
    );

}


/* =========================================================
   TASK CARD
========================================================= */

function createTaskCard(
    task
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "task-card";


    const completed =
        Number(
            task.completed
        ) === 1;


    const priority =
        task.priority ||
        "Medium";


    const icon =
        getSubjectIcon(
            task.subject_name
        );


    const description =
        completed

            ? "This adaptive study task has been completed."

            : getTaskDescription(
                task.topic_name,
                task.subject_name,
                priority
            );


    card.innerHTML = `

        <div class="task-icon">
            ${icon}
        </div>

        <div class="task-content">

            <h3>
                ${escapeHTML(
                    task.topic_name
                )}
            </h3>

            <p>
                ${escapeHTML(
                    description
                )}
            </p>

            <div class="task-meta">

                <span class="subject-tag">
                    ${escapeHTML(
                        task.subject_name
                    )}
                </span>

                <span class="time-tag">
                    ⏱ 20 min
                </span>

                <span class="priority ${priority.toLowerCase()}">
                    ${escapeHTML(
                        priority
                    )}
                </span>

            </div>

        </div>

        <button
            class="task-btn ${completed ? "completed" : ""}"
            ${completed ? "disabled" : ""}
            onclick="completeTask(${task.plan_topic_id})"
        >

            ${
                completed
                    ? "✓ Completed"
                    : "Start Practice"
            }

        </button>

    `;


    return card;
}


/* =========================================================
   COMPLETE TASK
========================================================= */

async function completeTask(
    planTopicId
) {

    if (!planTopicId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/study-plans/topics/${planTopicId}/complete`,
                {

                    method:
                        "PUT",

                    headers: {

                        "Authorization":
                            `Bearer ${localStorage.getItem(TOKEN_KEY)}`,

                        "Content-Type":
                            "application/json"

                    }

                }
            );


        if (
            response.status === 401
        ) {

            localStorage.removeItem(
                TOKEN_KEY
            );


            window.location.href =
                "login.html";

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to complete task."
            );
        }


        showToast(
            "Study task completed! 🎉"
        );


        /*
           Reload from MySQL so the UI
           reflects the actual database state.
        */

        await loadStudyPlan();


    } catch (error) {

        console.error(
            error
        );


        showToast(
            error.message
        );

    }

}


/* =========================================================
   WEEKLY PLAN
========================================================= */

function renderWeeklyPlan() {

    const container =
        document.getElementById(
            "weeklyTasks"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const grouped =
        {};


    planTopics.forEach(
        function (topic) {

            const date =
                String(
                    topic.planned_date ||
                    ""
                ).slice(
                    0,
                    10
                );


            if (!grouped[date]) {

                grouped[date] =
                    [];
            }


            grouped[date].push(
                topic
            );

        }
    );


    Object.keys(grouped)
        .sort()
        .forEach(
            function (date) {

                const topics =
                    grouped[date];


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "week-card";


                const day =
                    date
                        ? formatDay(
                            date
                        )

                        : "Planned";


                const topicNames =
                    topics
                        .map(
                            topic =>
                                topic.topic_name
                        )
                        .join(
                            " + "
                        );


                const high =
                    topics.filter(
                        topic =>
                            topic.priority ===
                            "High"
                    ).length;


                const description =
                    high > 0

                        ? "Focus on your weaker areas and build stronger exam readiness."

                        : "Continue practicing these topics to maintain your progress.";


                card.innerHTML = `

                    <div class="week-day">
                        ${escapeHTML(day)}
                    </div>

                    <h3>
                        ${escapeHTML(topicNames)}
                    </h3>

                    <p>
                        ${escapeHTML(description)}
                    </p>

                    <span class="week-time">
                        ⏱ ${topics.length * 20} min
                    </span>

                `;


                container.appendChild(
                    card
                );

            }
        );

}


/* =========================================================
   WEAK TOPICS
========================================================= */

function renderWeakTopics() {

    const container =
        document.getElementById(
            "weakTopics"
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    const weakTopics =
        [...planTopics]

            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.mastery
                    ) -
                    Number(
                        b.mastery
                    )
            )

            .slice(
                0,
                6
            );


    if (!weakTopics.length) {

        return;
    }


    weakTopics.forEach(
        function (topic) {

            const mastery =
                Math.round(
                    Number(
                        topic.mastery
                    ) || 0
                );


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "weak-card";


            card.innerHTML = `

                <div class="weak-card-header">

                    <h3>
                        ${escapeHTML(
                            topic.topic_name
                        )}
                    </h3>

                    <span class="mastery-value">
                        ${mastery}%
                    </span>

                </div>

                <div class="mastery-bar">

                    <div
                        class="mastery-fill"
                        style="width: ${mastery}%"
                    ></div>

                </div>

                <p>
                    ${escapeHTML(
                        topic.subject_name
                    )} needs more practice.
                </p>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   AI RECOMMENDATION
========================================================= */

function renderRecommendation() {

    const title =
        document.getElementById(
            "recommendationTitle"
        );


    const text =
        document.getElementById(
            "recommendationText"
        );


    if (
        !title ||
        !text
    ) {

        return;
    }


    if (!planTopics.length) {

        title.textContent =
            "Start your adaptive learning journey";


        text.textContent =
            "Complete quizzes to give the AI system enough performance data to personalize your study plan.";

        return;
    }


    const weakest =
        [...planTopics]
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        a.mastery
                    ) -
                    Number(
                        b.mastery
                    )
            )[0];


    const mastery =
        Math.round(
            Number(
                weakest.mastery
            ) || 0
        );


    title.textContent =
        `Focus on ${weakest.topic_name}`;


    text.textContent =
        `${weakest.topic_name} currently has ${mastery}% mastery. ` +
        `The AI study plan has prioritized this topic because improving weaker areas can strengthen your overall exam performance.`;

}


/* =========================================================
   SUBJECT ICON
========================================================= */

function getSubjectIcon(
    subject
) {

    const value =
        String(
            subject || ""
        ).toLowerCase();


    if (
        value.includes(
            "quant"
        )
    ) {

        return "📊";
    }


    if (
        value.includes(
            "reason"
        )
    ) {

        return "🧩";
    }


    if (
        value.includes(
            "english"
        )
    ) {

        return "✍️";
    }


    if (
        value.includes(
            "general"
        )
    ) {

        return "🌐";
    }


    return "📚";
}


/* =========================================================
   TASK DESCRIPTION
========================================================= */

function getTaskDescription(
    topic,
    subject,
    priority
) {

    if (
        priority ===
        "High"
    ) {

        return `${topic} is a priority area. Practice this topic to improve your ${subject} performance.`;
    }


    if (
        priority ===
        "Medium"
    ) {

        return `Strengthen your ${topic} skills with focused practice and revision.`;
    }


    return `Revise ${topic} to maintain your current performance level.`;
}


/* =========================================================
   DATE HELPERS
========================================================= */

function getLocalDateString(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;
}


function formatDay(
    dateString
) {

    const date =
        new Date(
            `${dateString}T00:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;
    }


    return date.toLocaleDateString(
        [],
        {
            weekday:
                "long"
        }
    );
}


/* =========================================================
   UI HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }

}


function showLoading() {

    setText(
        "recommendationTitle",
        "Creating your personalized study plan..."
    );


    setText(
        "recommendationText",
        "The system is analyzing your learning performance and preparing your adaptive topics."
    );

}


function showError(
    message
) {

    setText(
        "recommendationTitle",
        "Unable to load study plan"
    );


    setText(
        "recommendationText",
        message
    );


    const container =
        document.getElementById(
            "todayTasks"
        );


    if (container) {

        container.innerHTML = `

            <div class="task-card">

                <div class="task-content">

                    <h3>
                        ⚠️ Study plan unavailable
                    </h3>

                    <p>
                        Make sure the backend server and MySQL database are running, then refresh the page.
                    </p>

                </div>

            </div>

        `;
    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function goToDashboard() {

    window.location.href =
        "dashboard.html";

}


function goToSubjects() {

    const examId =
        getExamId();


    const examName =
        examId === 2
            ? "oicl"

            : examId === 3
                ? "niacl"

                : "esic";


    window.location.href =
        `subjects.html?exam=${examName}`;

}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification() {

    showToast(
        "Your personalized study plan is active 🔔"
    );

}


/* =========================================================
   TOAST
========================================================= */

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
        2500
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

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


/* =========================================================
   GLOBAL FUNCTIONS
========================================================= */

window.completeTask =
    completeTask;

window.goToDashboard =
    goToDashboard;

window.goToSubjects =
    goToSubjects;

window.showNotification =
    showNotification;