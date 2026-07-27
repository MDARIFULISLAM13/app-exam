const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course, Exam } = require("../../../../models/course_model");

//check done
exports.admin_view_question_to_exam = async (req, res) => {
    try {
        const { course_name, exam_name, token } = req.body;
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

        if (decoded.username != process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const course = await Course.findOne(
            { course_name },
            "_id"
        ).lean();

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        const exam = await Exam.findOne(
            { course: course._id, exam_name },
            "questions"
        ).lean();

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found for this course"
            });
        }

        return res.status(200).json(exam.questions);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
