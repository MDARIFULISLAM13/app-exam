const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course } = require("../../../../models/course_model");
const enroll_model = require("../../../../models/enroll_model");
const users_model = require("../../../../models/users_model");
const { Package } = require("../../../../models/package_model");
const { createToken } = require("../../../../package_token/token");
function encodeEmail(email) {
  return email.replace(/\./g, "_dot_");
}

exports.add_user = async (req, res) => {
  const { course_name, email, id, token, package_id } = req.body;

  try {
    const decoded = jwtVerify_admin(token);
    if (!decoded) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const admin_username = decoded.username;

    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const user = await users_model.findOne({ email });
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (package_id) {
      const packageData = await Package.findById(package_id);

      if (!packageData) {
        return res.status(404).json({
          error: "Package not found",
        });
      }

      const package_token = createToken(packageData.package_key);

      const expireAt = new Date(
        Date.now() + packageData.package_key * 60 * 1000,
      );

      await users_model.UserKey.findOneAndUpdate(
        {
          user: user._id,
          key: package_token,
        },
        {
          $set: {
            expireAt,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      const encodedEmail = encodeEmail(email);
      packageData.enrolledUsers.set(encodedEmail, true);
      packageData.enrolledUsersTime.set(encodedEmail, new Date());

      await packageData.save();

      await enroll_model.findByIdAndDelete(id);

      return res.status(200).json({
        message: `User ${email} enrolled successfully `,
      });
    }

    if (!course_name || !email || !id) {
      return res.status(400).json({
        error: "Course name and email are required",
      });
    }

    const course = await Course.findOne({ course_name });
    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    user.enrolledCourse.set(course_name, true);

    await user.save();

    const encodedEmail = encodeEmail(email);
    course.enrolledUsers.set(encodedEmail, true);
    course.enrolledUsersTime.set(encodedEmail, new Date());

    await course.save();

    await enroll_model.findByIdAndDelete(id);

    return res.status(200).json({
      message: `User ${email} enrolled successfully in ${course_name}`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
    });
  }
};
