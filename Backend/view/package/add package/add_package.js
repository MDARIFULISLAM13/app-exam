const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Package } = require("../../../models/package_model");

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
MULTER
========================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),

    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {

    const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (!allowed.includes(file.mimetype)) {
        return cb(new Error("Only image allowed"), false);
    }

    cb(null, true);
};

const upload_package_image = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// check done
exports.add_new_package = async (req, res) => {

    try {

        const {
            token,
            package_name,
            package_key,
            package_price,
            package_max_price,
            package_details,
            password
        } = req.body;

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

        if (password != process.env.admin_pass) {
            return res.status(401).json({
                token_issue: false,
                message: "Password not match"
            });
        }

        let imageFilename = "";
        let imageUrl = "";

        if (req.file) {

            imageFilename = req.file.filename;

            imageUrl =
                req.protocol +
                "://" +
                req.get("host") +
                "/uploads/" +
                imageFilename;
        }

        const newPackage = await Package.create({
            package_name,
            package_price,
            package_key,
            package_max_price: package_max_price || null,
            package_image: imageUrl,
            package_details
        });

        return res.status(201).json({
            message: "Package created successfully",
            package: newPackage
        });

    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                error: "Package name already exists"
            });
        }

        return res.status(500).json({
            error: "Server error",
            details: error.message
        });
    }
};

exports.upload_package_image = upload_package_image;