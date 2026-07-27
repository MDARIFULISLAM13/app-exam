const path = require("path");
const fs = require("fs");

const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Package } = require("../../../models/package_model");
const users_model = require("../../../models/users_model");
const { createToken } = require("../../../package_token/token");

// upload folder
const uploadDir = path.join(__dirname, "..", "..", "..", "uploads");

function removeFile(filename) {
    if (!filename) return;

    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

// check done
exports.delete_package = async (req, res) => {
    try {

        const { token, package_name, password } = req.body;

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

        if (!package_name) {
            return res.status(400).json({
                error: "Package name is required"
            });
        }

        // Find Package
        const packageData = await Package.findOne({ package_name }).lean();

        if (!packageData) {
            return res.status(404).json({
                error: "Package not found"
            });
        }

        /* =========================
           DELETE PACKAGE IMAGE
        ========================= */

        if (packageData.package_image) {
            const filename = packageData.package_image.split("/").pop();
            removeFile(filename);
        }

        /* =========================
           DELETE ALL USER TOKENS
        ========================= */

        const package_token = createToken(packageData.package_key);

        await users_model.UserKey.deleteMany({
            key: package_token
        });

        /* =========================
           DELETE PACKAGE
        ========================= */

        await Package.deleteOne({
            _id: packageData._id
        });

        return res.status(200).json({
            message: `Package '${package_name}' deleted successfully.`
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};