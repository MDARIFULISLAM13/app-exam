const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Course, Exam, LeaderboardEntry } = require("../../../models/course_model");
//check done
exports.delete_exam = async (req, res) => {
    try {
        const { course_name, exam_name, token } = req.body;

        if (!course_name || !exam_name) {
            return res.status(400).json({
                error: "Course name and exam name are required!"
            });
        }

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });

        }
        const decoded = jwtVerify_admin(token);
        if (!decoded) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const admin_username = decoded.username;
        if (admin_username != process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        // Find course
        const course = await Course.findOne({ course_name }, "_id exams").lean();
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Find exam
        const exam = await Exam.findOne(
            { course: course._id, exam_name },
            "_id"
        ).lean();

        if (!exam) {
            return res.status(404).json({ error: "Exam not found" });
        }

        // Delete the exam document
        await Exam.deleteOne({ _id: exam._id });

        // Delete all leaderboard entries for that exam
        await LeaderboardEntry.deleteMany({ exam: exam._id });

        // Remove exam from course.exams array
        await Course.updateOne(
            { _id: course._id },
            { $pull: { exams: exam._id } }
        );

        return res.status(200).json({
            message: "Exam deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
