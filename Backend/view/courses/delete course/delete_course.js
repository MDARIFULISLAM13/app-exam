const path = require("path");
const fs = require("fs");

const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Course, Exam, LeaderboardEntry, CourseNotice } = require("../../../models/course_model");

// upload folder for course images and other shared uploads
const uploadDir = path.join(__dirname, "..", "..", "..", "uploads");

// shared upload folder alias for notice/pdf files
const sharedUploadDir = uploadDir;

function removeFile(filename) {
    if (!filename) return;

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

function removeSharedUploadFile(filename) {
    if (!filename) return;

    const filePath = path.join(sharedUploadDir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

//check done
exports.delete_course = async (req, res) => {
    try {

        const { token, course_name, password } = req.body;

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const decoded = jwtVerify_admin(token);

        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        if (password !== process.env.admin_pass) {
            return res.status(401).json({
                message: "Password not match"
            });
        }

        if (!course_name) {
            return res.status(400).json({
                error: "Course name is required"
            });
        }

        // find course
        const course = await Course.findOne({ course_name }).lean();

        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        /* =========================
           DELETE COURSE IMAGE
        ========================= */

        if (course.course_image) {

            const filename = course.course_image.split("/").pop();

            removeFile(filename);
        }

        /* =========================
           DELETE EXAMS
        ========================= */

        if (course.exams && course.exams.length > 0) {

            await Exam.deleteMany({ _id: { $in: course.exams } });

            await LeaderboardEntry.deleteMany({
                exam: { $in: course.exams }
            });
        }

        /* =========================
           DELETE COURSE NOTICES
        ========================= */

        const notices = await CourseNotice.find({ course: course._id }).lean();
        if (notices && notices.length > 0) {
            for (const notice of notices) {
                if (Array.isArray(notice.images)) {
                    notice.images.forEach((img) => removeSharedUploadFile(img.filename));
                }
                removeSharedUploadFile(notice.pdfFilename);
            }
            await CourseNotice.deleteMany({ course: course._id });
        }

        /* =========================
           DELETE COURSE
        ========================= */

        await Course.deleteOne({ _id: course._id });

        return res.status(200).json({
            message: `Course '${course_name}' deleted successfully.`
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
};