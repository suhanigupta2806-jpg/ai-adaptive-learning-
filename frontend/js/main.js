/* =========================================================
   AdaptiveLearn - Main Frontend JavaScript
   File: frontend/js/main.js
   ========================================================= */

console.log("AdaptiveLearn frontend loaded successfully!");

/* =========================================================
   EXPLORE EXAMS BUTTON
   ========================================================= */

const exploreExamsButton = document.querySelector(
    ".hero-buttons .btn-secondary"
);

if (exploreExamsButton) {
    exploreExamsButton.addEventListener("click", function () {

        const examsSection = document.querySelector("#exams");

        if (examsSection) {
            examsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

    });
}


/* =========================================================
   START LEARNING BUTTON
   ========================================================= */

const startLearningButton = document.querySelector(
    ".hero-buttons .btn-primary"
);

if (startLearningButton) {
    startLearningButton.addEventListener("click", function () {

        /*
         * If the student is already logged in,
         * continue to the dashboard.
         *
         * Otherwise open the registration page.
         */

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");

        if (token) {
            window.location.href = "dashboard.html";
        } else {
            window.location.href = "register.html";
        }

    });
}


/* =========================================================
   EXAM DETAILS NAVIGATION
   ========================================================= */

const examCards = document.querySelectorAll(
    "#exams .exam-card"
);


/*
 * Exam information used by the details page.
 *
 * These IDs match the current database/API structure:
 *
 * ESIC  = 1
 * OICL  = 2
 * NIACL = 3
 */

const homepageExams = [
    {
        id: 1,
        slug: "esic",
        name: "ESIC UDC"
    },
    {
        id: 2,
        slug: "oicl",
        name: "OICL Assistant"
    },
    {
        id: 3,
        slug: "niacl",
        name: "NIACL Assistant"
    }
];


/* =========================================================
   ATTACH VIEW EXAM BUTTONS
   ========================================================= */

examCards.forEach(function (card, index) {

    const button = card.querySelector("button");

    if (!button) {
        return;
    }

    const exam = homepageExams[index];

    if (!exam) {
        return;
    }


    /*
     * Make the button behave like a real navigation button.
     */

    button.type = "button";

    button.addEventListener("click", function () {

        const detailsUrl =
            "exam-details.html" +
            "?exam=" +
            encodeURIComponent(exam.slug) +
            "&examId=" +
            encodeURIComponent(exam.id);

        window.location.href = detailsUrl;

    });

});


/* =========================================================
   LOG INFORMATION
   ========================================================= */

console.log(
    "Exam details navigation initialized:",
    homepageExams
);