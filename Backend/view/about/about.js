// backend/controllers/member_controller.js
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { Member } = require("../../models/about");
const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");


//about teachers panel
/* ============================================================
   MULTER CONFIG (Stored inside same file)
============================================================ */

// নতুন version (root Backend/uploads)
const uploadDir = path.join(__dirname, "..", "..", "uploads");

// ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    },
});

function fileFilter(req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
}

const upload_member_image = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

/* ============================================================
   HELPER
============================================================ */

function removeFile(filename) {
    if (!filename) return;
    const filePath = path.join(uploadDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ============================================================
   CONTROLLERS
============================================================ */

// CREATE
exports.create_member = async (req, res) => {
    try {
        const { name, details, token } = req.body;
        


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




        if (!name || !details) {
            if (req.file) removeFile(req.file.filename);
            return res.status(400).json({ error: "Name & details required" });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Image required" });
        }

        const imageFilename = req.file.filename;
        const imageUrl =
            req.protocol + "://" + req.get("host") + "/uploads/" + imageFilename;

        const member = await Member.create({
            name: name.trim(),
            details: details.trim(),
            imageFilename,
            imageUrl,
        });

        res.status(201).json({
            message: "Profile created",
            member,
        });
    } catch (err) {
        if (req.file) removeFile(req.file.filename);
        res.status(500).json({ error: err.message });
    }
};

// LIST
exports.list_members = async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: 1 }).lean();
        res.status(200).json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// UPDATE
exports.update_member = async (req, res) => {
    try {
        const { name, details } = req.body;
        const id = req.params.id;

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




        if (!name || !details) {
            if (req.file) removeFile(req.file.filename);
            return res.status(400).json({ error: "Name & details required" });
        }

        const member = await Member.findById(id);
        if (!member) {
            if (req.file) removeFile(req.file.filename);
            return res.status(404).json({ error: "Profile not found" });
        }

        member.name = name.trim();
        member.details = details.trim();

        // If new image uploaded → delete old one
        if (req.file) {
            removeFile(member.imageFilename);
            member.imageFilename = req.file.filename;
            member.imageUrl =
                req.protocol + "://" + req.get("host") + "/uploads/" + req.file.filename;
        }

        await member.save();

        res.status(200).json({
            message: "Profile updated",
            member,
        });
    } catch (err) {
        if (req.file) removeFile(req.file.filename);
        res.status(500).json({ error: err.message });
    }
};

// DELETE
exports.delete_member = async (req, res) => {
    try {
        const id = req.params.id;

        const { token } = req.body;

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


        const member = await Member.findById(id);
        if (!member) {
            return res.status(404).json({ error: "Profile not found" });
        }

        removeFile(member.imageFilename);
        await Member.findByIdAndDelete(id);

        res.status(200).json({ message: "Profile deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* ============================================================
   EXPORT MULTER MIDDLEWARE
============================================================ */

exports.upload_member_image = upload_member_image;
