const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { Course } = require("../../../../models/course_model");
const Users = require("../../../../models/users_model");

function decodeEmail(encodedEmail) {
  return encodedEmail.replace(/_dot_/g, ".");
}

exports.view_user = async (req, res) => {
  try {
    const { course_name, token } = req.body;
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

    const admin_username = decoded.username;
    if (admin_username != process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    if (!course_name) {
      return res.status(400).json({
        error: "Course name is required",
      });
    }

    const course = await Course.findOne({ course_name });
    if (!course) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const emails = Array.from(course.enrolledUsers.keys()).map(decodeEmail);

    const users = await Users.find(
      { email: { $in: emails } },
      { name: 1, email: 1, mobile: 1, _id: 0 },
    ).lean();

    const enrolledUsers = users.map((user) => {
      const encodedEmail = user.email.replace(/\./g, "_dot_");

      return {
        ...user,
        enrolledAt: course.enrolledUsersTime.get(encodedEmail) || null,
      };
    });

    return res.status(200).json({
      enrolledUsers: enrolledUsers,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
