const { Course, Exam, LeaderboardEntry } = require("../../../models/course_model");


//check done

exports.view_leaderboard = async (req, res) => {


    try {
        const { course_name, exam_name } = req.body;

        if (!course_name || !exam_name) {
            return res.status(400).json({
                error: "Course name and exam name are required"
            });
        }

        const course = await Course.findOne(
            { course_name },
            "_id course_name"
        ).lean();

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        const exam = await Exam.findOne(
            { course: course._id, exam_name },
            "exam_name leaderboard"
        ).lean();

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        const now = new Date();

        if (!exam.leaderboard || now < exam.leaderboard) {
            return res.status(403).json({
                error: "Leaderboard is not active for this exam yet"
            });
        }

        const entries = await LeaderboardEntry.find(
            { exam: exam._id },
            "email correctAnswers submittedAt"
        )
            .sort({ correctAnswers: -1, submittedAt: 1 })
            .lean();

        return res.status(200).json({
            leaderboard: entries
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};