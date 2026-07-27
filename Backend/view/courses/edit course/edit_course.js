const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Course } = require("../../../models/course_model");


const path = require("path");
const fs = require("fs");
const multer = require("multer");


/* =========================
UPLOAD DIRECTORY
========================= */

const uploadDir = path.join(__dirname, "..", "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* =========================
HELPER
========================= */

function removeFile(filename) {

    if (!filename) return;

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}


exports.edit_course = async (req, res) => {
    try {
        const { token, old_course_name, course_name, course_duration,included_in_package, total_exam, course_price,course_max_price, course_details, vedio_link, password } = req.body;
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

        if (password !== process.env.admin_pass) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin password"
            });
        }

        const course = await Course.findOne({ course_name: old_course_name });
         if (!course) {
            if (req.file) removeFile(req.file.filename);

            return res.status(404).json({
                message: "Course not found"
            });
        }

        course.course_name = course_name;
        course.course_duration = course_duration;
        course.total_exam = total_exam;
        course.included_in_package =included_in_package
        course.course_price = course_price;
        course.course_max_price = course_max_price || null;
        course.course_details = course_details;
        course.vedio_link = vedio_link;

 if (req.file) {

            const oldImage = course.course_image
                ? course.course_image.split("/").pop()
                : null;

            removeFile(oldImage);

            const imageFilename = req.file.filename;

            course.course_image =
                req.protocol +
                "://" +
                req.get("host") +
                "/uploads/" +
                imageFilename;
        }

        await course.save();

         if (old_course_name !== course_name) {

            await Users.updateMany(
                { [`enrolledCourse.${old_course_name}`]: true },
                {
                    $set: {
                        [`enrolledCourse.${course_name}`]: true
                    },
                    $unset: {
                        [`enrolledCourse.${old_course_name}`]: ""
                    }
                }
            );

        } 

        return res.status(200).json({
            success: true,
            message: "Course updated successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};