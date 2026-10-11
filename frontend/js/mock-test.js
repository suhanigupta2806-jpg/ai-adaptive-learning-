/* =========================================
   MOCK TEST PAGE
   AdaptiveLearn
========================================= */


const examButtons =
    document.querySelectorAll(".select-exam-button");


examButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        const exam =
            button.dataset.exam;

        const examName =
            button.dataset.examName;


        /*
            Save selected exam temporarily.
        */

        sessionStorage.setItem(
            "mockTestExam",
            exam
        );


        sessionStorage.setItem(
            "mockTestExamName",
            examName
        );


        /*
            Go to Mock Test Instructions page.
            This page will be created in the next step.
        */

        window.location.href =
            "mock-test-instructions.html";

    });

});