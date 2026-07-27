const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course } = require("../../../../models/course_model");
const { Package } = require("../../../../models/package_model");
const users_model = require("../../../../models/users_model");
const { createToken } = require("../../../../package_token/token");

function encodeEmail(email) {
    return email.replace(/\./g, "_dot_");
}

//check done
exports.remove_user = async (req, res) => {
    try {
        const { course_name, email, token, admin_pass ,package_name} = req.body;


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


        if (!(course_name ||package_name)  || !email || !admin_pass) {
            return res.status(400).json({
                error: "Course name , email and admin password are required"
            });
        }

        if (admin_pass != process.env.admin_pass) {
            return res.status(404).json({
                error: "Password not match"
            });
        }




 if (package_name) {

    const packageData = await Package.findOne({ package_name });

    if (!packageData) {
        return res.status(404).json({
            error: "Package not found"
        });
    }

    const user = await users_model.findOne({ email });

    if (!user) {
        return res.status(404).json({
            error: "User not found"
        });
    }

    const package_token = createToken(packageData.package_key);

    await users_model.UserKey.findOneAndDelete({
        user: user._id,
        key: package_token
    });

    const encodedEmail = encodeEmail(email);

    packageData.enrolledUsers.set(encodedEmail, false);
    await packageData.save();

    return res.status(200).json({
        message: `User ${email} removed successfully from ${package_name}`
    });
}






        const course = await Course.findOne({ course_name });
        if (!course) {
            return res.status(404).json({
                error: "Course not found"
            });
        }

        const encodedEmail = encodeEmail(email);

        if (!course.enrolledUsers.has(encodedEmail)) {
            return res.status(404).json({
                error: `User ${email} is not enrolled in ${course_name}`
            });
        }

        course.enrolledUsers.delete(encodedEmail);
        await course.save();

        const user = await users_model.findOne({ email });

        if (user) {
            user.enrolledCourse.set(course_name, false);
            await user.save();
        }

        return res.status(200).json({
            message: `User ${email} removed successfully from ${course_name}`
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};
