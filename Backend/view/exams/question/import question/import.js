// backend/controllers/exam/import_questions_from_bank.js
const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course, Exam } = require("../../../../models/course_model");
const Folder = require("../../../../models/Folder");
const { FreeExam } = require("../../../../models/free_exam");
const Question = require("../../../../models/Question");

// OPTIONAL: if you want to protect folder/question bank APIs by admin token,
// add checks inside these or wrap with middleware. For now they are open.

/**
 * POST /api/qb/folders/root
 * Body: {}
 */
exports.qb_root = async (req, res) => {
    try {
        let root = await Folder.findOne({ name: "question_bank", parent: null }).lean();
        if (!root) {
            const created = await Folder.create({
                name: "question_bank",
                parent: null,
                path: []
            });
            root = created.toObject();
        }

        const subfolders = await Folder.find({ parent: root._id })
            .sort("name")
            .lean();

        const questions = await Question.find({ folder: root._id })
            .sort("createdAt")
            .lean();

        return res.json({
            folder: root,
            subfolders,
            questions
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /api/qb/folders/get
 * Body: { folderId }
 */
exports.qb_get_folder = async (req, res) => {
    try {
        const { folderId } = req.body;

        if (!folderId) {
            return res.status(400).json({ message: "folderId is required" });
        }

        const folder = await Folder.findById(folderId).lean();
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }

        const subfolders = await Folder.find({ parent: folderId })
            .sort("name")
            .lean();

        const questions = await Question.find({ folder: folderId })
            .sort("createdAt")
            .lean();

        return res.json({
            folder,
            subfolders,
            questions
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};




//check done
// controllers/exam/import_questions_from_bank.js


/**
 * POST /api/exams/import-questions
 * Body: { token, course_name, exam_name, questionIds: [ObjectId string] }
 */
exports.import_questions_from_bank = async (req, res) => {
    try {
        const { token, course_name, exam_name, questionIds } = req.body;



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

        if (!exam_name || !Array.isArray(questionIds) || questionIds.length === 0) {
            return res.status(400).json({
                error: "exam_name and non-empty questionIds are required"
            });
        }

        let exam = null;

        // 1) free_exam case (no Course collection)
        if (course_name === "free_exam") {
            exam = await FreeExam.findOne(
                { course_name: "free_exam", exam_name },
                "questions"
            );

            if (!exam) {
                return res.status(404).json({ error: "Free exam not found" });
            }
        }
        else
        {
            // 2) normal course exam case
            if (!course_name) {
                return res.status(400).json({
                    error: "course_name is required for non free_exam"
                });
            }

            const course = await Course.findOne({ course_name }, "_id").lean();
            if (!course) {
                return res.status(404).json({ error: "Course not found" });
            }

            exam = await Exam.findOne(
                { course: course._id, exam_name },
                "questions"
            );

            if (!exam) {
                return res.status(404).json({ error: "Exam not found" });
            }
        }

        const qbQuestions = await Question.find(
            { _id: { $in: questionIds } },
            "questionText questionImage options optionImages correctAnswer correctAnswerImage explanation explanationImage"
        ).lean();

        if (!qbQuestions || qbQuestions.length === 0) {
            return res.status(404).json({ error: "No questions found to import" });
        }

        const mappedQuestions = qbQuestions.map(q => ({
            question_text: q.questionText,
            question_image: q.questionImage || null,

            options: q.options,
            option_images: q.optionImages || {},

            correct_answer: q.correctAnswer,
            correct_answer_image: q.correctAnswerImage || null,

            explanation: q.explanation,
            explanation_image: q.explanationImage || null
        }));

        exam.questions.push(...mappedQuestions);
        await exam.save();

        return res.status(200).json({
            message: "Questions imported successfully",
            importedCount: mappedQuestions.length
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error.message
        });
    }
};