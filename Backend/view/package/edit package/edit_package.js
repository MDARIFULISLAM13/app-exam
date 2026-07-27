const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Package } = require("../../../models/package_model");

const path = require("path");
const fs = require("fs");

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

exports.edit_package = async (req, res) => {

    try {

        const {
            token,
            old_package_name,
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

        if (password !== process.env.admin_pass) {
            return res.status(403).json({
                success: false,
                message: "Invalid admin password"
            });
        }

        const packageData = await Package.findOne({
            package_name: old_package_name
        });

        if (!packageData) {

            if (req.file) removeFile(req.file.filename);

            return res.status(404).json({
                message: "Package not found"
            });
        }

        packageData.package_name = package_name;
        packageData.package_price = package_price;
        packageData.package_key = package_key;

        packageData.package_max_price = package_max_price || null;
        packageData.package_details = package_details;

        if (req.file) {

            const oldImage = packageData.package_image
                ? packageData.package_image.split("/").pop()
                : null;

            removeFile(oldImage);

            const imageFilename = req.file.filename;

            packageData.package_image =
                req.protocol +
                "://" +
                req.get("host") +
                "/uploads/" +
                imageFilename;
        }

        await packageData.save();

        return res.status(200).json({
            success: true,
            message: "Package updated successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};