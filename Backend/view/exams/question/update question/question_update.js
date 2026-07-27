const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course, Exam } = require("../../../../models/course_model");
//check done
exports.update_question = async (req, res) => {
    try {
        const { course_name, exam_name, question_id, question_text, options, correct_answer, token } = req.body;

        if (!course_name || !exam_name || !question_id || !question_text || !options || !correct_answer) {
            return res.status(400).json({ error: "All fields are required" });
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
        );

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        const question = exam.questions.id(question_id);
        if (!question) {
            return res.status(404).json({
                error: "Question not found"
            });
        }

        question.question_text = question_text;
        question.options = options;
        question.correct_answer = correct_answer;

        await exam.save();

        return res.status(200).json({
            message: "Question updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
