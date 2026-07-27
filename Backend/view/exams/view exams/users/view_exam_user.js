const { jwtVerify_user } = require("../../../../jwt/users/jwt_users");
const { Course, Exam } = require("../../../../models/course_model");

const users_model = require("../../../../models/users_model");
const { UserKey } = require("../../../../models/users_model");
const { getPackageKey } = require("../../../../package_token/token"); 
//check done
function getCurrentUTCTime() {
    return new Date();
}

exports.user_view_question_to_exam = async (req, res) => {
    try {
        const { course_name, exam_name, token } = req.body;

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const decoded = jwtVerify_user(token);
        if (!decoded) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

       const user = await users_model
         .findOne({
           email: decoded.email,
         })
         .lean();

       if (!user) {
         return res.status(404).json({
           error: "User not found",
         });
       }

       const email = decoded.email.replace(/\./g, "_dot_").toLowerCase();

       const course = await Course.findOne(
         { course_name },
         "_id enrolledUsers included_in_package",
       ).lean();

       if (!course) {
         return res.status(404).json({
           error: "Course not found",
         });
       }

       let enrolled = course.enrolledUsers?.[email] === true;

       // Package access check
       if (!enrolled && course.included_in_package) {
         const userKeys = await UserKey.find(
           { user: user._id },
           { key: 1, _id: 0 },
         ).lean();

         for (const item of userKeys) {
           if (getPackageKey(item.key)) {
             enrolled = true;
             break;
           }
         }
       }

       if (!enrolled) {
         return res.status(403).json({
           error: "You are not enrolled in this course.",
         });
       }




        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        const exam = await Exam.findOne(
            { course: course._id, exam_name },
            "questions start exam_time"
        ).lean();

        if (!exam) {
            return res.status(404).json({
                error: "Exam not found for this course"
            });
        }

        const nowUTC = getCurrentUTCTime();

        if (nowUTC < exam.start) {
            return res.status(403).json({
                error: "Exam has not started yet"
            });
        }

        // const questionsCopy = exam.questions.map(q => ({
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

        const randomizedQuestions = shuffleArray(questionsCopy);


        return res.status(200).json({
            randomizedQuestions: randomizedQuestions,   // আগের array অপরিবর্তিত 
            exam_time: exam.exam_time                  // নতুন করে exam time যোগ
        });



    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};