/* =========================================
   MOCK TEST INSTRUCTIONS
   AdaptiveLearn
========================================= */


const exam =
    sessionStorage.getItem("mockTestExam");


const examName =
    sessionStorage.getItem("mockTestExamName");


const examNameElement =
    document.getElementById("examName");


const startButton =
    document.getElementById("startMockTest");



/* =========================================
   CHECK SELECTED EXAM
========================================= */


if (!exam || !examName) {

    examNameElement.textContent =
        "No Exam Selected";

    startButton.disabled = true;

    startButton.textContent =
        "Select an Exam First";

}


/* =========================================
   DISPLAY EXAM
========================================= */


else {

    examNameElement.textContent =
        examName;


    /* =====================================
       START MOCK TEST
    ===================================== */

    startButton.addEventListener(
        "click",
        function() {

            /*
                Save the start time.
                The actual timer will begin
                when the mock test page loads.
            */

            sessionStorage.setItem(
                "mockTestStarted",
                "true"
            );


            /*
                Open the actual mock test.
            */

            window.location.href =
                "mock-test-quiz.html";

        }
    );

}