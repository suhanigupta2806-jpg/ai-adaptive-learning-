/* ============================================================
   ADAPTIVELEARN
   GLOBAL STUDENT PROFILE SYNCHRONIZER
   ============================================================ */

"use strict";

const PROFILE_API_BASE = "http://localhost:5000";
const PROFILE_TOKEN_KEY = "adaptiveLearnToken";
const PROFILE_USER_KEY = "adaptiveLearnUser";

/* ============================================================
   EXAM NAMES
   ============================================================ */

const PROFILE_EXAMS = {
    esic: "ESIC UDC",
    oicl: "OICL Assistant",
    niacl: "NIACL Assistant"
};


/* ============================================================
   GET STORED USER
   ============================================================ */

function getStoredProfileUser() {
    try {
        return JSON.parse(
            localStorage.getItem(PROFILE_USER_KEY) || "null"
        ) || {};
    } catch (error) {
        return {};
    }
}


/* ============================================================
   GET TOKEN
   ============================================================ */

function getProfileToken() {
    return localStorage.getItem(PROFILE_TOKEN_KEY) || "";
}


/* ============================================================
   NORMALIZE EXAM
   ============================================================ */

function normalizeExamName(value) {

    const text = String(value || "")
        .trim()
        .toLowerCase();

    if (text.includes("oicl")) {
        return "OICL Assistant";
    }

    if (text.includes("niacl")) {
        return "NIACL Assistant";
    }

    if (text.includes("esic")) {
        return "ESIC UDC";
    }

    return "";
}


/* ============================================================
   GET CURRENT EXAM
   ============================================================ */

function getCurrentStudentExam(user) {

    /* --------------------------------------------------------
       1. URL exam
       -------------------------------------------------------- */

    try {

        const params =
            new URLSearchParams(
                window.location.search
            );

        const urlExam =
            params.get("exam");

        if (urlExam) {

            const normalized =
                normalizeExamName(urlExam);

            if (normalized) {
                return normalized;
            }
        }

    } catch (error) {
        console.warn(
            "Could not read URL exam."
        );
    }


    /* --------------------------------------------------------
       2. Mock-test selected exam
       -------------------------------------------------------- */

    try {

        const mockExam =
            sessionStorage.getItem(
                "mockTestExamName"
            );

        const normalized =
            normalizeExamName(mockExam);

        if (normalized) {
            return normalized;
        }

    } catch (error) {
        console.warn(
            "Could not read mock test exam."
        );
    }


    /* --------------------------------------------------------
       3. Stored user exam
       -------------------------------------------------------- */

    const storedExam =
        user.target_exam ||
        user.exam ||
        user.exam_name ||
        "";

    const normalizedStoredExam =
        normalizeExamName(storedExam);

    if (normalizedStoredExam) {
        return normalizedStoredExam;
    }


    /* --------------------------------------------------------
       4. Previously selected exam
       -------------------------------------------------------- */

    try {

        const savedExam =
            localStorage.getItem(
                "adaptiveLearnExam"
            );

        const normalized =
            normalizeExamName(savedExam);

        if (normalized) {
            return normalized;
        }

    } catch (error) {
        console.warn(
            "Could not read saved exam."
        );
    }


    /* --------------------------------------------------------
       5. Default only if nothing exists
       -------------------------------------------------------- */

    return "ESIC UDC";
}


/* ============================================================
   GET FIRST LETTER
   ============================================================ */

function getStudentInitial(name) {

    const cleanName =
        String(name || "")
            .trim();

    if (!cleanName) {
        return "S";
    }

    return cleanName
        .charAt(0)
        .toUpperCase();
}


/* ============================================================
   UPDATE LOCAL USER
   ============================================================ */

function saveUpdatedProfileUser(student) {

    if (!student) {
        return;
    }

    try {

        const oldUser =
            getStoredProfileUser();

        const updatedUser = {
            ...oldUser,
            ...student
        };

        localStorage.setItem(
            PROFILE_USER_KEY,
            JSON.stringify(updatedUser)
        );

    } catch (error) {

        console.warn(
            "Could not update saved student profile.",
            error
        );
    }
}


/* ============================================================
   UPDATE AVATARS
   ============================================================ */

function updateProfileAvatars(initial) {

    const selectors = [

        ".profile-avatar",

        ".profile-btn .avatar",

        ".profile-area .avatar",

        ".profile .avatar",

        "[data-student-avatar]"

    ];


    selectors.forEach(function(selector) {

        document
            .querySelectorAll(selector)
            .forEach(function(element) {

                element.textContent =
                    initial;

            });

    });
}


/* ============================================================
   UPDATE PROFILE NAMES
   ============================================================ */

function updateProfileNames(name) {

    const selectors = [

        ".profile-name",

        ".profile-info strong",

        ".profile-btn .profile-name",

        "[data-student-name]"

    ];


    selectors.forEach(function(selector) {

        document
            .querySelectorAll(selector)
            .forEach(function(element) {

                element.textContent =
                    name;

            });

    });


    /* --------------------------------------------------------
       Daily Challenge / simple profile button

       Example:
       <button class="profile-btn">
           <span class="avatar">S</span>
           <span>Student</span>
       </button>
       -------------------------------------------------------- */

    document
        .querySelectorAll(".profile-btn")
        .forEach(function(button) {

            const avatar =
                button.querySelector(
                    ".avatar"
                );

            const spans =
                button.querySelectorAll(
                    "span"
                );

            spans.forEach(function(span) {

                if (
                    span === avatar ||
                    span.classList.contains("avatar") ||
                    span.classList.contains("profile-name")
                ) {
                    return;
                }

                /*
                   Only change a plain profile-name span.
                */

                if (
                    span.children.length === 0 &&
                    span.textContent.trim()
                ) {

                    const text =
                        span.textContent
                            .trim()
                            .toLowerCase();

                    if (
                        text === "student" ||
                        text === "user" ||
                        text === "s"
                    ) {

                        span.textContent =
                            name;

                    }

                }

            });

        });

}


/* ============================================================
   UPDATE PROFILE EXAM
   ============================================================ */

function updateProfileExam(examName) {

    const selectors = [

        "#profileExam",

        ".profile-info small",

        "[data-student-exam]"

    ];


    selectors.forEach(function(selector) {

        document
            .querySelectorAll(selector)
            .forEach(function(element) {

                element.textContent =
                    examName;

            });

    });

}


/* ============================================================
   UPDATE ALL PROFILE INFORMATION
   ============================================================ */

function renderStudentProfile(student) {

    if (!student) {
        return;
    }

    const name =
        String(
            student.name ||
            student.full_name ||
            "Student"
        ).trim() || "Student";


    const initial =
        getStudentInitial(name);


    const examName =
        getCurrentStudentExam(student);


    updateProfileAvatars(
        initial
    );

    updateProfileNames(
        name
    );

    updateProfileExam(
        examName
    );


    /* --------------------------------------------------------
       Optional data attributes
       -------------------------------------------------------- */

    document
        .querySelectorAll(
            "[data-student-email]"
        )
        .forEach(function(element) {

            element.textContent =
                student.email || "";

        });


    document
        .querySelectorAll(
            "[data-student-id]"
        )
        .forEach(function(element) {

            element.textContent =
                student.student_id || "";

        });


    console.log(
        "AdaptiveLearn profile synchronized:",
        name,
        "|",
        examName
    );
}


/* ============================================================
   FETCH REAL PROFILE
   ============================================================ */

async function fetchRealStudentProfile() {

    const token =
        getProfileToken();


    /*
       If there is no login token, don't redirect here.
       Other page scripts can handle authentication.
    */

    if (!token) {

        const storedUser =
            getStoredProfileUser();

        if (
            storedUser &&
            (
                storedUser.name ||
                storedUser.full_name
            )
        ) {

            renderStudentProfile(
                storedUser
            );
        }

        return;

    }


    try {

        const response =
            await fetch(
                `${PROFILE_API_BASE}/api/auth/profile`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Accept":
                            "application/json"
                    }
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            console.warn(
                "Student profile session expired."
            );

            return;
        }


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success ||
            !data.student
        ) {

            throw new Error(
                data.message ||
                "Unable to load student profile."
            );

        }


        /*
           Save the real profile so other pages
           can use the latest name immediately.
        */

        saveUpdatedProfileUser(
            data.student
        );


        /*
           Render the REAL student.
        */

        renderStudentProfile(
            data.student
        );


    } catch (error) {

        console.warn(
            "Profile synchronization failed:",
            error
        );


        /*
           Fallback to saved login information.
        */

        const storedUser =
            getStoredProfileUser();


        if (
            storedUser &&
            (
                storedUser.name ||
                storedUser.full_name
            )
        ) {

            renderStudentProfile(
                storedUser
            );

        }

    }

}


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializeStudentProfileSync() {

    /*
       Render stored information immediately.
       This prevents the page from remaining as
       "Student" while waiting for the API.
    */

    const storedUser =
        getStoredProfileUser();


    if (
        storedUser &&
        (
            storedUser.name ||
            storedUser.full_name
        )
    ) {

        renderStudentProfile(
            storedUser
        );

    }


    /*
       Then fetch the latest profile from backend.
    */

    fetchRealStudentProfile();

}


/* ============================================================
   PAGE LOAD
   ============================================================ */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeStudentProfileSync
    );

} else {

    initializeStudentProfileSync();

}