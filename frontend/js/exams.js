// ============================================================
// AdaptiveLearn
// EXAMS PAGE - BACKEND INTEGRATION
// Phase 9.5
// ============================================================

const API_BASE_URL = "http://localhost:5000";

const examGrid = document.querySelector(".exam-grid");


// ============================================================
// AUTH CHECK
// ============================================================

const token = localStorage.getItem("adaptiveLearnToken");

if (!token) {
    window.location.href = "login.html";
}


// ============================================================
// EXAM ICON
// ============================================================

function getExamIcon(examName) {

    if (examName.includes("ESIC")) {
        return "E";
    }

    if (examName.includes("OICL")) {
        return "O";
    }

    if (examName.includes("NIACL")) {
        return "N";
    }

    return "E";
}


// ============================================================
// EXAM SLUG
// Used to keep compatibility with existing frontend URLs
// ============================================================

function getExamSlug(examName) {

    const name = examName.toLowerCase();

    if (name.includes("esic")) {
        return "esic";
    }

    if (name.includes("oicl")) {
        return "oicl";
    }

    if (name.includes("niacl")) {
        return "niacl";
    }

    return name
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}


// ============================================================
// LOAD EXAMS
// ============================================================

async function loadExams() {

    if (!examGrid) {
        return;
    }

    examGrid.innerHTML = `
        <div class="loading-message">
            Loading exams...
        </div>
    `;

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/exams`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "Failed to load exams"
            );

        }

        const exams = data.exams || [];

        if (exams.length === 0) {

            examGrid.innerHTML = `
                <div class="loading-message">
                    No exams available.
                </div>
            `;

            return;
        }

        await displayExams(exams);

    } catch (error) {

        console.error("Exam loading error:", error);

        examGrid.innerHTML = `
            <div class="loading-message">
                Unable to load exams.
                <br>
                Please make sure the backend server is running.
            </div>
        `;
    }
}


// ============================================================
// DISPLAY EXAMS
// ============================================================

async function displayExams(exams) {

    examGrid.innerHTML = "";

    for (const exam of exams) {

        let subjectCount = 0;

        try {

            const response = await fetch(
                `${API_BASE_URL}/api/exams/${exam.exam_id}/subjects`
            );

            const data = await response.json();

            if (data.success) {
                subjectCount =
                    Array.isArray(data.subjects)
                        ? data.subjects.length
                        : 0;
            }

        } catch (error) {

            console.error(
                `Could not load subjects for exam ${exam.exam_id}`,
                error
            );

        }


        const slug =
            getExamSlug(exam.exam_name);

        const icon =
            getExamIcon(exam.exam_name);


        const card =
            document.createElement("div");

        card.className =
            "exam-card";


        card.innerHTML = `

            <div class="exam-icon">
                ${icon}
            </div>

            <div class="exam-content">

                <span class="exam-tag">
                    ${exam.exam_id === 1
                        ? "SELECTED EXAM"
                        : "AVAILABLE"}
                </span>

                <h3>
                    ${escapeHTML(exam.exam_name)}
                </h3>

                <p>
                    ${escapeHTML(
                        exam.description ||
                        "Competitive examination preparation."
                    )}
                </p>

                <div class="exam-details">

                    <div>
                        <span>Subjects</span>
                        <strong>
                            ${subjectCount}
                        </strong>
                    </div>

                    <div>
                        <span>Difficulty</span>
                        <strong>
                            Moderate
                        </strong>
                    </div>

                    <div>
                        <span>Progress</span>
                        <strong>
                            0%
                        </strong>
                    </div>

                </div>

                <a
                    href="subjects.html?exam=${encodeURIComponent(slug)}&examId=${exam.exam_id}"
                    class="exam-button ${exam.exam_id !== 1 ? "secondary" : ""}"
                >
                    ${exam.exam_id === 1
                        ? "Continue Preparation →"
                        : "Start Preparation →"}
                </a>

            </div>

        `;

        examGrid.appendChild(card);
    }
}


// ============================================================
// HTML SAFETY
// ============================================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// START
// ============================================================

loadExams();