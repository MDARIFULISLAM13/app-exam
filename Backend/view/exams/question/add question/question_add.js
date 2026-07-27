const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course, Exam } = require("../../../../models/course_model");

//check done
exports.add_question_to_exam = async (req, res) => {
    try {
        const { course_name, exam_name, question_text, options, correct_answer, explanation, token } = req.body;


        if (!course_name || !exam_name || !question_text || !options || !correct_answer ) {
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


        const course = await Course.findOne({ course_name }, "_id").lean();
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        const exam = await Exam.findOne(
            { course: course._id, exam_name },
            "questions exam_name"
        );

        if (!exam) {
            return res.status(404).json({ error: "Exam not found for this course" });
        }

        exam.questions.push({
            question_text,
            options,
            correct_answer,
            explanation
        });

        await exam.save();

        return res.status(200).json({
            message: "Question added successfully",
            exam
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};