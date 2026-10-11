// ============================================================
// AdaptiveLearn
// SUBJECTS PAGE - COMPLETE FIX
// Resolves exam by examId OR exam slug
// ============================================================

"use strict";

const API_BASE_URL = "http://localhost:5000";


// ============================================================
// URL PARAMETERS
// ============================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


// Exam slug such as:
// esic
// oicl
// niacl

const examSlug =
    (
        urlParams.get("exam") ||
        ""
    )
        .trim()
        .toLowerCase();


// Exam ID is optional.
// If it is missing, the system resolves it
// from the exam slug.

let examId =
    Number(
        urlParams.get("examId")
    ) || null;


// ============================================================
// EXAM NAME MAP
// ============================================================

const examNames = {

    esic:
        "ESIC UDC",

    oicl:
        "OICL Assistant",

    niacl:
        "NIACL Assistant"

};


// ============================================================
// AUTH
// ============================================================

const token =
    localStorage.getItem(
        "adaptiveLearnToken"
    );


if (!token) {

    window.location.href =
        "login.html";

}


// ============================================================
// DOM ELEMENTS
// ============================================================

const examPageLabel =
    document.getElementById(
        "examPageLabel"
    );


const profileExam =
    document.getElementById(
        "profileExam"
    );


const examTitle =
    document.getElementById(
        "examTitle"
    );


const recommendationTitle =
    document.getElementById(
        "recommendationTitle"
    );


const recommendationText =
    document.getElementById(
        "recommendationText"
    );


const recommendationButton =
    document.getElementById(
        "recommendationButton"
    );


const subjectsGrid =
    document.querySelector(
        ".subjects-grid"
    );


const overallProgress =
    document.getElementById(
        "overallProgress"
    );


const overallProgressFill =
    document.getElementById(
        "overallProgressFill"
    );


// ============================================================
// HELPERS
// ============================================================

function normalize(value) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase()
        .replace(
            /[-_]+/g,
            " "
        )
        .replace(
            /\s+/g,
            " "
        );

}


function createSlug(value) {

    return String(
        value ?? ""
    )
        .toLowerCase()
        .trim()
        .replace(
            /&/g,
            "and"
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );

}


function escapeHTML(value) {

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


// ============================================================
// API REQUEST
// ============================================================

async function apiRequest(
    endpoint
) {

    const headers = {
        "Content-Type":
            "application/json"
    };


    if (token) {

        headers.Authorization =
            `Bearer ${token}`;

    }


    const response =
        await fetch(
            `${API_BASE_URL}${endpoint}`,
            {
                method: "GET",
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
            "Invalid response received from server."
        );

    }


    if (
        response.status === 401
    ) {

        localStorage.removeItem(
            "adaptiveLearnToken"
        );

        localStorage.removeItem(
            "adaptiveLearnUser"
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
            "Unable to load data."
        );

    }


    return data;

}


// ============================================================
// RESOLVE EXAM
//
// Priority:
//
// 1. examId from URL
// 2. exam slug from URL
// 3. stored selected exam
//
// This fixes:
//
// subjects.html?exam=esic
//
// as well as:
//
// subjects.html?exam=esic&examId=1
// ============================================================

async function resolveExam() {

    // --------------------------------------------------------
    // CASE 1:
    // Valid exam ID already supplied
    // --------------------------------------------------------

    if (
        examId &&
        Number.isInteger(
            Number(examId)
        )
    ) {

        try {

            const data =
                await apiRequest(
                    `/api/exams/${Number(examId)}`
                );


            if (
                data.exam
            ) {

                return data.exam;

            }

        }

        catch (error) {

            console.warn(
                "Exam ID lookup failed. Trying slug lookup.",
                error
            );

        }

    }


    // --------------------------------------------------------
    // CASE 2:
    // Resolve using slug
    // --------------------------------------------------------

    let slug =
        examSlug;


    // If URL has no exam slug,
    // use stored selected exam.

    if (!slug) {

        slug =
            (
                localStorage.getItem(
                    "adaptiveLearnExam"
                ) ||
                localStorage.getItem(
                    "selectedExam"
                ) ||
                ""
            )
                .trim()
                .toLowerCase();

    }


    const wantedName =
        examNames[slug] ||
        slug;


    if (!wantedName) {

        throw new Error(
            "No exam was selected. Please return to My Exams."
        );

    }


    const data =
        await apiRequest(
            "/api/exams"
        );


    const exams =
        Array.isArray(
            data.exams
        )
            ? data.exams
            : [];


    const exam =
        exams.find(
            item => {

                return (
                    normalize(
                        item.exam_name
                    ) ===
                    normalize(
                        wantedName
                    )
                );

            }
        );


    if (!exam) {

        throw new Error(
            "Selected exam was not found."
        );

    }


    // Store resolved ID
    // for the rest of this page.

    examId =
        Number(
            exam.exam_id
        );


    return exam;

}


// ============================================================
// LOAD EXAM + SUBJECTS
// ============================================================

async function loadExamAndSubjects() {

    try {

        showLoading();


        // ----------------------------------------------------
        // Resolve selected exam
        // ----------------------------------------------------

        const exam =
            await resolveExam();


        if (
            !exam ||
            !exam.exam_id
        ) {

            throw new Error(
                "Unable to identify the selected exam."
            );

        }


        examId =
            Number(
                exam.exam_id
            );


        // ----------------------------------------------------
        // Load subjects for the resolved exam
        // ----------------------------------------------------

        const subjectsData =
            await apiRequest(
                `/api/exams/${examId}/subjects`
            );


        const subjects =
            Array.isArray(
                subjectsData.subjects
            )
                ? subjectsData.subjects
                : [];


        // ----------------------------------------------------
        // Display
        // ----------------------------------------------------

        displayExam(
            exam
        );


        displaySubjects(
            subjects,
            exam
        );


        // ----------------------------------------------------
        // Make sure browser URL contains examId
        //
        // This prevents the same problem when the user
        // refreshes or returns to this page.
        // ----------------------------------------------------

        updateBrowserURL(
            exam
        );

    }

    catch (error) {

        console.error(
            "Exam/subject loading error:",
            error
        );


        showError(
            error.message ||
            "Unable to load exam subjects."
        );

    }

}


// ============================================================
// UPDATE URL
// ============================================================

function updateBrowserURL(
    exam
) {

    try {

        const currentSlug =
            examSlug ||
            createSlug(
                exam.exam_name
            );


        const newURL =
            `subjects.html?exam=${encodeURIComponent(
                currentSlug
            )}&examId=${Number(
                exam.exam_id
            )}`;


        const currentPath =
            window.location.pathname
                .split("/")
                .pop();


        if (
            currentPath ===
            "subjects.html"
        ) {

            window.history.replaceState(
                {},
                "",
                newURL
            );

        }

    }

    catch (error) {

        console.warn(
            "Unable to update browser URL:",
            error
        );

    }

}


// ============================================================
// DISPLAY EXAM
// ============================================================

function displayExam(
    exam
) {

    if (!exam) {
        return;
    }


    const examName =
        exam.exam_name ||
        "Exam";


    if (examPageLabel) {

        examPageLabel.textContent =
            `${examName} Preparation`;

    }


    if (profileExam) {

        profileExam.textContent =
            examName;

    }


    if (examTitle) {

        examTitle.textContent =
            examName;

    }


    // Do not use the old hardcoded
    // 72% value.

    if (overallProgress) {

        overallProgress.textContent =
            "0%";

    }


    if (overallProgressFill) {

        overallProgressFill.style.width =
            "0%";

    }


    if (recommendationTitle) {

        recommendationTitle.textContent =
            "Start your preparation";

    }


    if (recommendationText) {

        recommendationText.textContent =
            "Choose a subject below to begin practicing.";

    }

}


// ============================================================
// DISPLAY SUBJECTS
// ============================================================

function displaySubjects(
    subjects,
    exam
) {

    if (!subjectsGrid) {

        return;

    }


    subjectsGrid.innerHTML =
        "";


    if (
        !Array.isArray(subjects) ||
        subjects.length === 0
    ) {

        subjectsGrid.innerHTML = `

            <div class="loading-message">

                No subjects are available
                for this exam.

            </div>

        `;

        return;

    }


    subjects.forEach(
        (
            subject,
            index
        ) => {

            const name =
                subject.subject_name ||
                `Subject ${index + 1}`;


            const subjectId =
                Number(
                    subject.subject_id
                );


            // ------------------------------------------------
            // ICON
            // ------------------------------------------------

            let icon =
                "📘";


            const normalizedName =
                normalize(
                    name
                );


            if (
                normalizedName.includes(
                    "reasoning"
                )
            ) {

                icon =
                    "🧩";

            }

            else if (
                normalizedName.includes(
                    "quantitative"
                )
            ) {

                icon =
                    "%";

            }

            else if (
                normalizedName.includes(
                    "english"
                )
            ) {

                icon =
                    "A";

            }

            else if (
                normalizedName.includes(
                    "general"
                )
            ) {

                icon =
                    "🌐";

            }


            // ------------------------------------------------
            // SUBJECT SLUG
            // ------------------------------------------------

            const subjectSlug =
                createSlug(
                    name
                );


            // ------------------------------------------------
            // CARD
            // ------------------------------------------------

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "subject-card";


            card.innerHTML = `

                <div class="subject-top">

                    <div class="subject-icon">
                        ${icon}
                    </div>

                    <span class="mastery new">
                        0% New
                    </span>

                </div>


                <h3>
                    ${escapeHTML(name)}
                </h3>


                <p>
                    ${escapeHTML(
                        subject.description ||
                        "Practice questions and topic-wise preparation."
                    )}
                </p>


                <div class="subject-progress">

                    <div class="progress-info">

                        <span>
                            Progress
                        </span>

                        <strong>
                            0%
                        </strong>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill new"
                            style="width:0%"
                        ></div>

                    </div>

                </div>


                <div class="subject-footer">

                    <span>
                        Topics available
                    </span>


                    <a
                        href="topics.html?exam=${encodeURIComponent(
                            examSlug ||
                            createSlug(
                                exam.exam_name
                            )
                        )}&examId=${Number(
                            exam.exam_id
                        )}&subjectId=${subjectId}&subject=${encodeURIComponent(
                            subjectSlug
                        )}"
                    >
                        Practice →
                    </a>

                </div>

            `;


            subjectsGrid.appendChild(
                card
            );

        }
    );


    // --------------------------------------------------------
    // Recommendation
    // --------------------------------------------------------

    setupRecommendation(
        subjects,
        exam
    );

}


// ============================================================
// RECOMMENDATION
// ============================================================

function setupRecommendation(
    subjects,
    exam
) {

    if (
        !subjects ||
        subjects.length === 0
    ) {

        return;

    }


    // First subject is the default
    // starting recommendation.

    const recommendedSubject =
        subjects[0];


    const name =
        recommendedSubject.subject_name ||
        "your first subject";


    if (recommendationTitle) {

        recommendationTitle.textContent =
            `Start with ${name}`;

    }


    if (recommendationText) {

        recommendationText.textContent =
            `Begin practicing ${name} to build your preparation for ${exam.exam_name}.`;

    }


    if (recommendationButton) {

        const subjectSlug =
            createSlug(
                name
            );


        recommendationButton.href =
            `topics.html?exam=${encodeURIComponent(
                examSlug ||
                createSlug(
                    exam.exam_name
                )
            )}&examId=${Number(
                exam.exam_id
            )}&subjectId=${Number(
                recommendedSubject.subject_id
            )}&subject=${encodeURIComponent(
                subjectSlug
            )}`;

    }

}


// ============================================================
// LOADING
// ============================================================

function showLoading() {

    if (!subjectsGrid) {

        return;

    }


    subjectsGrid.innerHTML = `

        <div class="loading-message">

            Loading subjects...

        </div>

    `;

}


// ============================================================
// ERROR
// ============================================================

function showError(
    message
) {

    if (!subjectsGrid) {

        return;

    }


    subjectsGrid.innerHTML = `

        <div class="loading-message">

            ${escapeHTML(
                message
            )}

        </div>

    `;

}


// ============================================================
// PROFILE
// ============================================================

async function loadProfile() {

    const profileName =
        document.getElementById(
            "profileName"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    if (
        !profileName &&
        !profileAvatar
    ) {

        return;

    }


    try {

        const data =
            await apiRequest(
                "/api/auth/profile"
            );


        const student =
            data.student ||
            data.user ||
            data.profile ||
            null;


        if (
            !student
        ) {

            return;

        }


        const name =
            student.name ||
            student.full_name ||
            "Student";


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileAvatar) {

            profileAvatar.textContent =
                name
                    .trim()
                    .charAt(0)
                    .toUpperCase() ||
                "S";

        }

    }

    catch (error) {

        console.warn(
            "Profile loading failed:",
            error
        );

        // Use stored user as fallback.

        try {

            const storedUser =
                JSON.parse(
                    localStorage.getItem(
                        "adaptiveLearnUser"
                    ) ||
                    "null"
                );


            if (
                storedUser
            ) {

                const name =
                    storedUser.name ||
                    storedUser.full_name ||
                    "Student";


                if (profileName) {

                    profileName.textContent =
                        name;

                }


                if (profileAvatar) {

                    profileAvatar.textContent =
                        name
                            .trim()
                            .charAt(0)
                            .toUpperCase() ||
                        "S";

                }

            }

        }

        catch {

            // Nothing else to do.

        }

    }

}


// ============================================================
// PROFILE BUTTON
// ============================================================

function setupProfileButton() {

    const profileButton =
        document.getElementById(
            "profileButton"
        );


    if (!profileButton) {

        return;

    }


    profileButton.addEventListener(
        "click",
        function() {

            window.location.href =
                "profile.html";

        }
    );

}


// ============================================================
// LOGOUT
// ============================================================

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            '[data-action="logout"], .logout, #logout'
        );


    logoutButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    localStorage.removeItem(
                        "adaptiveLearnToken"
                    );

                    localStorage.removeItem(
                        "adaptiveLearnUser"
                    );

                    localStorage.removeItem(
                        "adaptiveLearnStatistics"
                    );

                    localStorage.removeItem(
                        "adaptiveLearnLoggedIn"
                    );


                    window.location.href =
                        "login.html";

                }
            );

        }
    );

}


// ============================================================
// BACK TO EXAMS
// ============================================================

function setupBackButton() {

    const backButtons =
        document.querySelectorAll(
            'a[href*="exams.html"]'
        );


    backButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    // Keep the normal link behavior.

                }
            );

        }
    );

}


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        setupProfileButton();

        setupLogout();

        setupBackButton();

        await Promise.allSettled([
            loadProfile(),
            loadExamAndSubjects()
        ]);

    }
);