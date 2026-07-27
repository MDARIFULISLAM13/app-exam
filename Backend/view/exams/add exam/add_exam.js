const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Course, Exam } = require("../../../models/course_model");

//check done
exports.add_new_exam = async (req, res) => {
    try {
        const { course_name, exam_name, start, leaderboard, token, Negative_num, exam_time } = req.body;


        if (!course_name || !exam_name || !start || !leaderboard || !exam_time) {
            return res.status(400).json({
                error: "Course name, exam name, start time, leaderboard time and exam_time are required!!!"
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

        // Fetch course
        const course = await Course.findOne({ course_name }).lean();
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        // Check if same exam name already exists (in Exam collection)
        const existingExam = await Exam.findOne({
            course: course._id,
            exam_name
        }).lean();

        if (existingExam) {
            return res.status(400).json({
                error: "Exam with same name already exists for this course"
            });
        }


        //negative mark :


        let negative_mark = 0; // default = 0

        if (Negative_num !== undefined && Negative_num !== null && Negative_num !== "") {
            negative_mark = Number(Negative_num);
        }
        // Create exam in separate collection
        const newExam = await Exam.create({
            course: course._id,
            exam_name,
            start: new Date(start),
            leaderboard: new Date(leaderboard),
            questions: [],
            negative_mark,
            exam_time,
        });

        // Push new exam id into course.exams array
        await Course.updateOne(
            { _id: course._id },
            { $push: { exams: { $each: [newExam._id], $position: 0 } } }
        );

        // Get updated exam list (same as old structure)
        const updatedCourse = await Course.findById(course._id, "exams").populate({
            path: "exams",
            select: "exam_name start leaderboard questions negative_mark exam_time"
        });

        return res.status(201).json({
            message: "Exam created successfully",
            exams: updatedCourse.exams
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
