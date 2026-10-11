const {
    createStudyPlan,
    getActiveStudyPlan,
    getStudyPlans,
    getPlanTopics,
    getExamTopicsWithPerformance,
    addPlanTopic,
    completePlanTopic
} = require('../models/studyPlanModel');


// ==========================================================
// DATE HELPERS
// ==========================================================

const formatDate = (date) => {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
        date.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
};


const addDays = (date, days) => {
    const result = new Date(date);

    result.setDate(
        result.getDate() + days
    );

    return result;
};


// ==========================================================
// CREATE PERSONALIZED STUDY PLAN
// ==========================================================

const createPersonalizedPlan = (
    studentId,
    examId
) => {

    return new Promise((resolve, reject) => {

        // Check if an active plan already exists
        getActiveStudyPlan(
            studentId,
            examId,
            (err, existingPlans) => {

                if (err) {
                    return reject(err);
                }

                // Reuse existing active plan
                if (
                    existingPlans &&
                    existingPlans.length > 0
                ) {
                    return resolve(
                        existingPlans[0]
                    );
                }


                // Get topics with student's performance
                getExamTopicsWithPerformance(
                    studentId,
                    examId,
                    (topicErr, topics) => {

                        if (topicErr) {
                            return reject(
                                topicErr
                            );
                        }


                        if (
                            !topics ||
                            topics.length === 0
                        ) {
                            return reject(
                                new Error(
                                    'No topics found for the selected exam.'
                                )
                            );
                        }


                        const today =
                            new Date();

                        const startDate =
                            formatDate(today);

                        const endDate =
                            formatDate(
                                addDays(
                                    today,
                                    6
                                )
                            );


                        const planName =
                            'AI Personalized Study Plan';


                        // Create the main study plan
                        createStudyPlan(
                            studentId,
                            examId,
                            planName,
                            startDate,
                            endDate,
                            (createErr, result) => {

                                if (createErr) {
                                    return reject(
                                        createErr
                                    );
                                }


                                const planId =
                                    result.insertId;


                                /*
                                 * Project foundation:
                                 *
                                 * 4 Subjects
                                 * ×
                                 * 4 Topics
                                 * =
                                 * 16 Topics
                                 *
                                 * Therefore the personalized
                                 * plan uses up to 16 topics.
                                 */
                                const selectedTopics =
                                    topics.slice(
                                        0,
                                        16
                                    );


                                if (
                                    selectedTopics.length === 0
                                ) {
                                    return resolve({
                                        plan_id:
                                            planId,

                                        student_id:
                                            studentId,

                                        exam_id:
                                            examId,

                                        plan_name:
                                            planName,

                                        start_date:
                                            startDate,

                                        end_date:
                                            endDate,

                                        status:
                                            'Active'
                                    });
                                }


                                let insertedCount = 0;


                                selectedTopics.forEach(
                                    (
                                        topic,
                                        index
                                    ) => {

                                        const accuracy =
                                            Number(
                                                topic.accuracy
                                            ) || 0;


                                        let priority =
                                            'Low';


                                        // Weak topic
                                        if (
                                            accuracy < 60
                                        ) {
                                            priority =
                                                'High';
                                        }

                                        // Needs improvement
                                        else if (
                                            accuracy < 70
                                        ) {
                                            priority =
                                                'Medium';
                                        }


                                        /*
                                         * Distribute the 16 topics
                                         * across the 7-day plan.
                                         */
                                        const plannedDate =
                                            formatDate(
                                                addDays(
                                                    today,
                                                    index % 7
                                                )
                                            );


                                        addPlanTopic(
                                            planId,
                                            topic.topic_id,
                                            plannedDate,
                                            priority,
                                            (insertErr) => {

                                                if (
                                                    insertErr
                                                ) {
                                                    return reject(
                                                        insertErr
                                                    );
                                                }


                                                insertedCount++;


                                                if (
                                                    insertedCount ===
                                                    selectedTopics.length
                                                ) {

                                                    resolve({
                                                        plan_id:
                                                            planId,

                                                        student_id:
                                                            studentId,

                                                        exam_id:
                                                            examId,

                                                        plan_name:
                                                            planName,

                                                        start_date:
                                                            startDate,

                                                        end_date:
                                                            endDate,

                                                        status:
                                                            'Active'
                                                    });

                                                }
                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );

            }
        );

    });
};


// ==========================================================
// GET CURRENT PERSONALIZED PLAN
// GET /api/study-plans/current
// ==========================================================

const getCurrentPlan = async (
    req,
    res
) => {

    try {

        // IMPORTANT:
        // authMiddleware stores decoded token in req.student
        const studentId =
            req.student.student_id;


        const examId =
            Number(
                req.query.exam_id || 1
            );


        if (
            !Number.isInteger(examId) ||
            examId <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'Invalid exam_id.'
            });
        }


        // Get existing plan or create a new one
        const plan =
            await createPersonalizedPlan(
                studentId,
                examId
            );


        // Load plan topics for this student
        getPlanTopics(
            plan.plan_id,
            studentId,
            (err, topics) => {

                if (err) {

                    console.error(
                        'Get study plan topics error:',
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message:
                            'Failed to load study plan topics.'
                    });
                }


                const totalTasks =
                    topics.length;


                const completedTasks =
                    topics.filter(
                        topic =>
                            Boolean(
                                topic.completed
                            )
                    ).length;


                const progress =
                    totalTasks > 0
                        ? Math.round(
                            (
                                completedTasks /
                                totalTasks
                            ) * 100
                        )
                        : 0;


                const weakTopics =
                    topics.filter(
                        topic =>
                            Number(
                                topic.accuracy
                            ) < 60
                    );


                res.json({
                    success: true,

                    plan: plan,

                    topics: topics,

                    summary: {

                        total_tasks:
                            totalTasks,

                        completed_tasks:
                            completedTasks,

                        progress:
                            progress,

                        weak_topics:
                            weakTopics.length
                    }
                });

            }
        );

    } catch (error) {

        console.error(
            'Get current study plan error:',
            error
        );

        res.status(500).json({
            success: false,

            message:
                'Failed to load current study plan.',

            error:
                error.message
        });
    }
};


// ==========================================================
// CREATE MANUAL STUDY PLAN
// POST /api/study-plans
// ==========================================================

const createPlan = (
    req,
    res
) => {

    const studentId =
        req.student.student_id;


    const {
        exam_id,
        plan_name,
        start_date,
        end_date
    } = req.body;


    if (
        !exam_id ||
        !plan_name ||
        !start_date ||
        !end_date
    ) {
        return res.status(400).json({
            success: false,
            message:
                'exam_id, plan_name, start_date and end_date are required.'
        });
    }


    createStudyPlan(
        studentId,
        exam_id,
        plan_name,
        start_date,
        end_date,
        (err, result) => {

            if (err) {

                console.error(
                    'Create study plan error:',
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Failed to create study plan.'
                });
            }


            res.status(201).json({
                success: true,

                message:
                    'Study plan created successfully.',

                plan_id:
                    result.insertId
            });

        }
    );
};


// ==========================================================
// GET ALL STUDY PLANS
// GET /api/study-plans
// ==========================================================

const getPlans = (
    req,
    res
) => {

    const studentId =
        req.student.student_id;


    getStudyPlans(
        studentId,
        (err, plans) => {

            if (err) {

                console.error(
                    'Get study plans error:',
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Failed to load study plans.'
                });
            }


            res.json({
                success: true,
                plans: plans
            });

        }
    );
};


// ==========================================================
// GET TOPICS FOR A STUDY PLAN
// GET /api/study-plans/:planId/topics
// ==========================================================

const getTopics = (
    req,
    res
) => {

    const studentId =
        req.student.student_id;


    const planId =
        Number(
            req.params.planId
        );


    if (
        !Number.isInteger(planId) ||
        planId <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                'Invalid plan ID.'
        });
    }


    getPlanTopics(
        planId,
        studentId,
        (err, topics) => {

            if (err) {

                console.error(
                    'Get plan topics error:',
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Failed to load plan topics.'
                });
            }


            res.json({
                success: true,
                topics: topics
            });

        }
    );
};


// ==========================================================
// COMPLETE STUDY PLAN TOPIC
// PUT /api/study-plans/topics/:planTopicId/complete
// ==========================================================

const completePlanTopicController = (
    req,
    res
) => {

    const studentId =
        req.student.student_id;


    const planTopicId =
        Number(
            req.params.planTopicId
        );


    if (
        !Number.isInteger(planTopicId) ||
        planTopicId <= 0
    ) {
        return res.status(400).json({
            success: false,
            message:
                'Invalid plan topic ID.'
        });
    }


    completePlanTopic(
        planTopicId,
        studentId,
        (err, result) => {

            if (err) {

                console.error(
                    'Complete plan topic error:',
                    err
                );

                return res.status(500).json({
                    success: false,
                    message:
                        'Failed to complete study task.'
                });
            }


            if (
                result.affectedRows === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Study task not found or does not belong to this student.'
                });
            }


            res.json({
                success: true,

                message:
                    'Study task marked as completed.'
            });

        }
    );
};


// ==========================================================
// EXPORT CONTROLLERS
// ==========================================================

module.exports = {
    createPlan,
    getCurrentPlan,
    getPlans,
    getTopics,
    completePlanTopic:
        completePlanTopicController
};