const {
    getDashboardData,
    getWeakTopics,
    getPerformanceAnalysis
} = require('../models/dashboardModel');


// ============================================================
// DASHBOARD
// ============================================================

const getDashboard = async (req, res) => {

    try {

        const data =
            await getDashboardData(
                req.student.student_id
            );

        res.json({

            success: true,

            dashboard:
                data

        });

    } catch (error) {

        console.error(
            'Dashboard error:',
            error
        );

        res.status(500).json({

            success: false,

            message:
                'Failed to load dashboard',

            error:
                error.message
        });
    }
};


// ============================================================
// WEAK TOPICS
// ============================================================

const getWeakTopicsController = async (
    req,
    res
) => {

    try {

        const weakTopics =
            await getWeakTopics(
                req.student.student_id
            );

        res.json({

            success: true,

            weak_topics:
                weakTopics

        });

    } catch (error) {

        console.error(
            'Weak topics error:',
            error
        );

        res.status(500).json({

            success: false,

            message:
                'Failed to calculate weak topics',

            error:
                error.message
        });
    }
};


// ============================================================
// PERFORMANCE ANALYSIS
// ============================================================

const getPerformanceAnalysisController =
    async (req, res) => {

        try {

            const analysis =
                await getPerformanceAnalysis(
                    req.student.student_id
                );

            res.json({

                success: true,

                performance:
                    analysis

            });

        } catch (error) {

            console.error(
                'Performance analysis error:',
                error
            );

            res.status(500).json({

                success: false,

                message:
                    'Failed to generate performance analysis',

                error:
                    error.message
            });
        }
    };


module.exports = {

    getDashboard,

    getWeakTopicsController,

    getPerformanceAnalysisController
};