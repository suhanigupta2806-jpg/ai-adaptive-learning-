const db = require('../config/database');

// Create a new study plan
const createStudyPlan = (
    studentId,
    examId,
    planName,
    startDate,
    endDate,
    callback
) => {
    const sql = `
        INSERT INTO study_plans
        (student_id, exam_id, plan_name, start_date, end_date, status)
        VALUES (?, ?, ?, ?, ?, 'Active')
    `;

    db.query(
        sql,
        [
            studentId,
            examId,
            planName,
            startDate,
            endDate
        ],
        callback
    );
};


// Get the currently active plan for a particular student and exam
const getActiveStudyPlan = (
    studentId,
    examId,
    callback
) => {
    const sql = `
        SELECT
            plan_id,
            student_id,
            exam_id,
            plan_name,
            start_date,
            end_date,
            status,
            created_at
        FROM study_plans
        WHERE student_id = ?
          AND exam_id = ?
          AND status = 'Active'
        ORDER BY plan_id DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [studentId, examId],
        callback
    );
};


// Get all study plans belonging to a student
const getStudyPlans = (
    studentId,
    callback
) => {
    const sql = `
        SELECT
            sp.plan_id,
            sp.student_id,
            sp.exam_id,
            sp.plan_name,
            sp.start_date,
            sp.end_date,
            sp.status,
            sp.created_at,
            e.exam_name
        FROM study_plans sp
        INNER JOIN exams e
            ON e.exam_id = sp.exam_id
        WHERE sp.student_id = ?
        ORDER BY sp.created_at DESC
    `;

    db.query(
        sql,
        [studentId],
        callback
    );
};


// Get topics belonging to a plan
// Performance is restricted to the student who owns the plan
const getPlanTopics = (
    planId,
    studentId,
    callback
) => {
    const sql = `
        SELECT
            spt.plan_topic_id,
            spt.plan_id,
            spt.topic_id,
            spt.planned_date,
            spt.priority,
            spt.completed,

            t.topic_name,
            t.description,

            s.subject_id,
            s.subject_name,

            e.exam_id,
            e.exam_name,

            COALESCE(sp.accuracy, 0) AS accuracy,
            COALESCE(sp.mastery_level, 0) AS mastery_level,
            COALESCE(sp.questions_attempted, 0) AS questions_attempted,
            COALESCE(sp.questions_correct, 0) AS questions_correct

        FROM study_plan_topics spt

        INNER JOIN study_plans study_plan
            ON study_plan.plan_id = spt.plan_id

        INNER JOIN topics t
            ON t.topic_id = spt.topic_id

        INNER JOIN subjects s
            ON s.subject_id = t.subject_id

        INNER JOIN exams e
            ON e.exam_id = study_plan.exam_id

        LEFT JOIN student_progress sp
            ON sp.topic_id = t.topic_id
            AND sp.student_id = study_plan.student_id

        WHERE spt.plan_id = ?
          AND study_plan.student_id = ?

        ORDER BY
            spt.planned_date ASC,
            FIELD(
                spt.priority,
                'High',
                'Medium',
                'Low'
            ),
            s.subject_name ASC,
            t.topic_name ASC
    `;

    db.query(
        sql,
        [planId, studentId],
        callback
    );
};


// Get all topics for an exam with the logged-in student's performance
const getExamTopicsWithPerformance = (
    studentId,
    examId,
    callback
) => {
    const sql = `
        SELECT
            t.topic_id,
            t.topic_name,
            t.description,

            s.subject_id,
            s.subject_name,

            e.exam_id,
            e.exam_name,

            COALESCE(sp.accuracy, 0) AS accuracy,
            COALESCE(sp.mastery_level, 0) AS mastery_level,
            COALESCE(sp.questions_attempted, 0) AS questions_attempted,
            COALESCE(sp.questions_correct, 0) AS questions_correct

        FROM topics t

        INNER JOIN subjects s
            ON s.subject_id = t.subject_id

        INNER JOIN exams e
            ON e.exam_id = s.exam_id

        LEFT JOIN student_progress sp
            ON sp.topic_id = t.topic_id
            AND sp.student_id = ?

        WHERE e.exam_id = ?

        ORDER BY
            COALESCE(sp.accuracy, 0) ASC,
            s.subject_name ASC,
            t.topic_name ASC
    `;

    db.query(
        sql,
        [studentId, examId],
        callback
    );
};


// Add a topic to a study plan
const addPlanTopic = (
    planId,
    topicId,
    plannedDate,
    priority,
    callback
) => {
    const sql = `
        INSERT INTO study_plan_topics
        (
            plan_id,
            topic_id,
            planned_date,
            priority,
            completed
        )
        VALUES (?, ?, ?, ?, FALSE)
    `;

    db.query(
        sql,
        [
            planId,
            topicId,
            plannedDate,
            priority
        ],
        callback
    );
};


// Mark a study-plan topic as completed
// Ownership is checked through study_plans
const completePlanTopic = (
    planTopicId,
    studentId,
    callback
) => {
    const sql = `
        UPDATE study_plan_topics spt
        INNER JOIN study_plans sp
            ON sp.plan_id = spt.plan_id
        SET spt.completed = TRUE
        WHERE spt.plan_topic_id = ?
          AND sp.student_id = ?
    `;

    db.query(
        sql,
        [
            planTopicId,
            studentId
        ],
        callback
    );
};


module.exports = {
    createStudyPlan,
    getActiveStudyPlan,
    getStudyPlans,
    getPlanTopics,
    getExamTopicsWithPerformance,
    addPlanTopic,
    completePlanTopic
};