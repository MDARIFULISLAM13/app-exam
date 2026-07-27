const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { Course, CourseNotice } = require("../../../models/course_model");
const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");

const users_model = require("../../../models/users_model");
const { UserKey } = require("../../../models/users_model");
const { getPackageKey } = require("../../../package_token/token");



/* ===========================================
   UPLOAD DIRECTORY
=========================================== */

const uploadDir = path.join(__dirname, "..", "..", "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===========================================
   MULTER CONFIG (IMAGE + PDF)
=========================================== */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const ext = path.extname(originalName);
        const nameWithoutExt = path.basename(originalName, ext);

        let fileName = originalName;
        let counter = 1;

        while (fs.existsSync(path.join(uploadDir, fileName))) {
            fileName = `${nameWithoutExt}${counter}${ext}`;
            counter++;
        }

        cb(null, fileName);
    },
});

function fileFilter(req, file, cb) {
    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "application/pdf",
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image or pdf files allowed"), false);
    }
    cb(null, true);
}

const upload_course_notice = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
});

exports.upload_course_notice = upload_course_notice;

/* ===========================================
   HELPER
=========================================== */

function removeFile(filename) {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ===========================================
   CREATE COURSE NOTICE
=========================================== */
// body: { token, course_name, text }

exports.create_course_notice = async (req, res) => {
    try {
        const { token, course_name, text } = req.body;

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            if (req.files) {
                if (req.files.images)
                    req.files.images.forEach(f => removeFile(f.filename));
                if (req.files.pdf)
                    removeFile(req.files.pdf[0].filename);
            }
            return res.status(401).json({ message: "Unauthorized" });
        }

        const course = await Course.findOne({ course_name });
        if (!course) {
            return res.status(404).json({ error: "Course not found" });
        }

        let imagesData = [];
        let pdfData = {};

        if (req.files?.images) {
            req.files.images.forEach(file => {
                imagesData.push({
                    filename: file.filename,
                    url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
                });
            });
        }

        if (req.files?.pdf) {
            const file = req.files.pdf[0];
            pdfData = {
                pdfFilename: file.filename,
                pdfUrl: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
                pdfOriginalName: file.originalname,
            };
        }

        if (!text && imagesData.length === 0 && !pdfData.pdfFilename) {
            return res.status(400).json({
                error: "At least text, image or pdf is required",
            });
        }

        const notice = await CourseNotice.create({
            course: course._id,
            text: text || "",
            images: imagesData,
            ...pdfData,
        });

        res.status(201).json({
            message: "Course notice created",
            notice,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   LIST COURSE NOTICES (ADMIN / USER)
=========================================== */
// body: { course_name }
// POST /api/user/course/notice/list
// body: { course_name, page }

exports.list_course_notices = async (req, res) => {

    try {
        const { course_name, page = 1, who, token } = req.body;



       if (who == "user") {
         const decoded = jwtVerify_user(token);

         if (!decoded || !decoded.email) {
           return res.status(401).json({
             success: false,
             message: "Session expired or invalid token. Please log in again.",
           });
         }

         const LIMIT = 10;
         const skip = (page - 1) * LIMIT;

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

         const notices = await CourseNotice.find({
           course: course._id,
         })
           .sort({ createdAt: -1 })
           .skip(skip)
           .limit(LIMIT)
           .lean();

         const total = await CourseNotice.countDocuments({
           course: course._id,
         });

         res.status(200).json({
           notices,
           hasMore: skip + notices.length < total,
         });
       } else {
         if (!token) {
           return res.status(401).json({
             token_issue: true,
             message: "Session Expired. Please log in again.",
           });
         }
         const decoded = jwtVerify_admin(token);
         if (!decoded) {
           return res.status(401).json({
             token_issue: true,
             message: "Session Expired. Please log in again.",
           });
         }

         if (decoded.username != process.env.admin_user) {
           return res.status(401).json({
             token_issue: true,
             message: "Session Expired. Please log in again.",
           });
         }

         const LIMIT = 10;
         const skip = (page - 1) * LIMIT;

         const course = await Course.findOne({ course_name }).lean();
         if (!course) {
           return res.status(404).json({ error: "Course not found" });
         }

         const notices = await CourseNotice.find({
           course: course._id,
         })
           .sort({ createdAt: -1 })
           .skip(skip)
           .limit(LIMIT)
           .lean();

         const total = await CourseNotice.countDocuments({
           course: course._id,
         });

         res.status(200).json({
           notices,
           hasMore: skip + notices.length < total,
         });
       }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   UPDATE COURSE NOTICE
=========================================== */
// body: { token, notice_id, text }

exports.update_course_notice = async (req, res) => {
    try {
        const { token, notice_id, text } = req.body;

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notice = await CourseNotice.findById(notice_id);
        if (!notice) {
            return res.status(404).json({ error: "Notice not found" });
        }

        notice.text = text ? text.trim() : notice.text;

        if (req.files?.images) {
            notice.images.forEach(img => removeFile(img.filename));
            notice.images = req.files.images.map(file => ({
                filename: file.filename,
                url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
            }));
        }

        if (req.files?.pdf) {
            if (notice.pdfFilename) removeFile(notice.pdfFilename);

            const pdf = req.files.pdf[0];
            notice.pdfFilename = pdf.filename;
            notice.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${pdf.filename}`;
            notice.pdfOriginalName = pdf.originalname;
        }

        if (
            !notice.text &&
            (!notice.images || notice.images.length === 0) &&
            !notice.pdfFilename
        ) {
            return res.status(400).json({
                error: "At least text, image or pdf is required",
            });
        }

        await notice.save();

        res.status(200).json({
            message: "Course notice updated",
            notice,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ===========================================
   DELETE COURSE NOTICE
=========================================== */
// body: { token, notice_id }

exports.delete_course_notice = async (req, res) => {
    try {
        const { token, notice_id } = req.body;

        const decoded = jwtVerify_admin(token);
        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notice = await CourseNotice.findById(notice_id);
        if (!notice) {
            return res.status(404).json({ error: "Notice not found" });
        }

        notice.images.forEach(img => removeFile(img.filename));
        removeFile(notice.pdfFilename);

        await notice.deleteOne();

        res.status(200).json({ message: "Course notice deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
