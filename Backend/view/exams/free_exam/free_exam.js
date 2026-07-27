// controllers/free_exam/add_free_exam.js
const { jwtVerify_admin, adminCheck } = require("../../../jwt/admin/jwt_admin");
const { FreeExam, FreeExamLeaderboardEntry } = require("../../../models/free_exam");
const Question = require("../../../models/Question");

exports.add_new_free_exam = async (req, res) => {
    try {
        const { exam_name, start, leaderboard, Negative_num, exam_time, token } = req.body;

        if (!exam_name || !start || !leaderboard || !exam_time) {
            return res.status(400).json({
                error: "exam_name, start time,exam time and leaderboard time are required"
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

        const existingExam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "_id"
        ).lean();

        if (existingExam) {
            return res.status(400).json({
                error: "Exam with same name already exists for free_exam"
            });
        }

        let negative_mark = 0; // default = 0, মানে নেগেটিভ নেই

        if (Negative_num !== undefined && Negative_num !== null && Negative_num !== "") {
            negative_mark = Number(Negative_num);

        }
        const newExam = await FreeExam.create({
            course_name: "free_exam",
            exam_name,
            start: new Date(start),
            leaderboard: new Date(leaderboard),
            questions: [],
            negative_mark,
            exam_time,
        });

        return res.status(201).json({
            message: "Free exam created successfully",
            exam: newExam
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


// controllers/free_exam/all_free_exam_list.js


exports.all_free_exam_list = async (req, res) => {
    try {

        const exams = await FreeExam.find(
            { course_name: "free_exam" },
            "exam_name start leaderboard"
        )

            .lean();

        return res.status(200).json({
            exams
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};




//check done
exports.update_free_exam = async (req, res) => {

    try {
        const {
            course_name,           // optional, can be ignored / always "free_exam"
            original_exam_name,
            exam_name,
            start,
            leaderboard_end,
            token
        } = req.body;

        if (!original_exam_name || !exam_name || !start || !leaderboard_end) {
            return res.status(400).json({
                error: "All fields are required"
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

        const exam = await FreeExam.findOne(
            {
                course_name: "free_exam",
                exam_name: original_exam_name
            }
        );

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        exam.exam_name = exam_name;
        exam.start = new Date(start);
        exam.leaderboard = new Date(leaderboard_end);

        await exam.save();

        return res.status(200).json({
            message: "Exam updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};



//check done


exports.delete_free_exam = async (req, res) => {
    try {
        const { course_name, exam_name, token } = req.body;

        if (!exam_name) {
            return res.status(400).json({
                error: "Exam name is required!"
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


        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "_id"
        ).lean();

        if (!exam) {
            return res.status(404).json({ error: "Exam not found" });
        }

        await FreeExam.deleteOne({ _id: exam._id });

        await FreeExamLeaderboardEntry.deleteMany({ exam: exam._id });

        return res.status(200).json({
            message: "Exam deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};



//check done

// controllers/free_exam/admin_free_exam_view_questions.js


exports.admin_free_exam_view_question = async (req, res) => {
    try {
        const { exam_name, token } = req.body;


        if (!exam_name) {
            return res.status(400).json({
                error: "Exam name is required"
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

        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "questions"
        ).lean();

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        return res.status(200).json(exam.questions);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};



//check done
// controllers/free_exam/add_question_to_free_exam.js

exports.add_question_to_free_exam = async (req, res) => {
    try {
        const {
            course_name,          // optional, ignored (always "free_exam")
            exam_name,
            question_text,
            options,
            correct_answer,
            explanation,
            token
        } = req.body;

        if (!exam_name || !question_text || !options || !correct_answer) {
            return res.status(400).json({ error: "All fields are required" });
        }


        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({
                error: "At least 2 options are required"
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

        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "questions exam_name"
        );

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found for free_exam"
            });
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



//check done
// controllers/free_exam/delete_question_from_free_exam.js

exports.delete_question_from_FREE_exam = async (req, res) => {
    try {
        const { course_name, exam_name, question_id, token } = req.body;

        if (!exam_name || !question_id) {
            return res.status(400).json({
                error: "exam_name & question_id required"
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


        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "questions"
        );

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        const index = exam.questions.findIndex(
            q => q._id.toString() === question_id
        );

        if (index === -1) {
            return res.status(404).json({
                error: "Question not found"
            });
        }

        exam.questions.splice(index, 1);
        await exam.save();

        return res.status(200).json({
            message: "Question deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

// controllers/free_exam/update_question_free_exam.js

exports.update_free_exam_question = async (req, res) => {
    try {
        const {
            course_name,
            exam_name,
            question_id,
            question_text,
            options,
            correct_answer,
            token
        } = req.body;

        if (!exam_name || !question_id || !question_text || !options || !correct_answer) {
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

        const admin_username = decoded.username;
        if (admin_username != process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
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

// controllers/free_exam/user_all_free_exam_list.js

exports.free_all_exam_list = async (req, res) => {
    try {

        const exams = await FreeExam.find(
            { course_name: "free_exam" },
            "exam_name start leaderboard"
        )
            .lean();

        return res.status(200).json({
            exams
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


//check done
// controllers/free_exam/user_view_question_free_exam.js

function getCurrentUTCTime() {
    return new Date();
}




exports.user_view_question_to_free_exam = async (req, res) => {



    try {
        const { exam_name } = req.body;
        if (!exam_name) {
            return res.status(400).json({
                error: "exam_name is required"
            });
        }

        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "questions start exam_time"
        ).lean();

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found"
            });
        }

        const nowUTC = getCurrentUTCTime();

        if (exam.start && nowUTC < exam.start) {
            return res.status(403).json({
                error: "Exam has not started yet"
            });
        }

        // const questionsCopy = (exam.questions || []).map(q => ({
        //     question_id: q._id,
        //     question_text: q.question_text,
        //     options: q.options
        // }));

        const questionsCopy = (exam.questions || []).map(q => ({
            question_id: q._id,

            question_text: q.question_text,
            question_image: q.question_image || null,

            options: q.options,
            option_images: q.option_images || {},

            correct_answer_image: q.correct_answer_image || null,

            explanation: q.explanation,
            explanation_image: q.explanation_image || null
        }));


        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
        const exam_time = exam.exam_time;
        const randomizedQuestions = shuffleArray(questionsCopy);
        return res.status(200).json({
            randomizedQuestions: randomizedQuestions,   // আগের array অপরিবর্তিত 
            exam_time,                 // নতুন করে exam time যোগ
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};



//check done
// controllers/free_exam/submit_answer_free_exam.js

exports.submit_Free_exam_answer = async (req, res) => {


    try {

        const { exam_name, answers, mobile, name, institute } = req.body;
        if (!exam_name || !Array.isArray(answers) || !mobile || !name || !institute) {
            return res.status(400).json({ error: "exam_name, answers, mobile and name and institute are required" });
        }

        const exam = await FreeExam.findOne(
            { course_name: "free_exam", exam_name },
            "exam_name start leaderboard questions negative_mark"
        ).lean();

        if (!exam) {
            return res.status(404).json({ error: "Exam not found" });
        }

        const now = new Date();

        const normalizedMobile = String(mobile).trim().toLowerCase();

        const existingEntry = await FreeExamLeaderboardEntry.findOne(
            { exam: exam._id, Mobile: normalizedMobile },
            "_id"
        ).lean();

        if (existingEntry && now < exam.leaderboard) {
            return res.status(403).json({
                error: "You have already submitted the exam answers."
            });
        }

        const userAnswerMap = new Map(
            answers
                .filter(a => a.question_id && a.answer !== undefined)
                .map(a => [a.question_id.toString(), a.answer])
        );

        let right = 0;
        let wrong = 0;
        let notAnswered = 0;
        const answersResult = [];

        for (const question of exam.questions) {
            const qId = question._id.toString();
            const userAns = userAnswerMap.get(qId);

            let status;
            if (userAns === undefined) {
                notAnswered++;
                status = "notAnswered";
            } else if (userAns === question.correct_answer) {
                right++;
                status = "correct";
            } else {
                wrong++;
                status = "wrong";
            }

            answersResult.push({
                // question_id: qId,
                // correct_answer: question.correct_answer,
                // user_answer: userAns === undefined ? null : userAns,
                // explanation: question.explanation,
                // status
                question_id: qId,

                correct_answer: question.correct_answer,
                correct_answer_image: question.correct_answer_image || null,

                user_answer: userAns === undefined ? null : userAns,

                explanation: question.explanation,
                explanation_image: question.explanation_image || null,

                status
            });
        }

        let marks = right - (wrong * exam.negative_mark);

        if (marks < 0) {
            marks = 0;
        }



        if (!existingEntry && now < exam.leaderboard) {
            await FreeExamLeaderboardEntry.create({
                exam: exam._id,
                Mobile: normalizedMobile,
                name: String(name).trim().toLowerCase(),
                institute: String(institute).trim().toLowerCase(),
                correctAnswers: marks,
                submittedAt: now
            });
        }

        return res.status(200).json({
            right,
            wrong,
            notAnswered,
            marks,
            answersResult
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};



//check done
exports.view_leaderboard_free = async (req, res) => {
    try {
        const { exam_name } = req.body;

        if (!exam_name) {
            return res.status(400).json({
                error: "Exam name is required"
            });
        }

        const exam = await FreeExam.findOne(
            { exam_name },
            "leaderboard start exam_name"
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

        const entries = await FreeExamLeaderboardEntry.find(
            { exam: exam._id },
            "name correctAnswers submittedAt"
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



//check done
exports.admin_view_leaderboard_free = async (req, res) => {
    try {
        const { exam_name, token } = req.body;
        
        if (!adminCheck(token)) return res.status(401).json({});
        if (!exam_name) {
            return res.status(400).json({
                error: "Exam name is required"
            });
        }

        const exam = await FreeExam.findOne(
            { exam_name },
            "leaderboard start exam_name"
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

        const entries = await FreeExamLeaderboardEntry.find(
            { exam: exam._id },
            "Mobile name institute correctAnswers submittedAt"
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