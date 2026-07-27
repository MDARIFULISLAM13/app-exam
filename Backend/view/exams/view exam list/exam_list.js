const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const { Course, Exam } = require("../../../models/course_model");
const { UserKey } = require("../../../models/users_model");
const { getPackageKey } = require("../../../package_token/token");
const users_model = require("../../../models/users_model");

//check done
exports.all_exam_list = async (req, res) => {
  try {
    const { course_name, token, who } = req.body;

    //admin
    if (!who) {
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

      if (!course_name) {
        return res.status(400).json({
          error: "Course name is required",
        });
      }

      const course = await Course.findOne({ course_name }, "_id").lean();

      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      const exams = await Exam.find(
        { course: course._id },
        "exam_name start leaderboard",
      ).lean();

      return res.status(200).json({
        exams,
      });
    }

    //user
    else if (who === "user") {
      const decoded = jwtVerify_user(token);

      if (!decoded || !token) {
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

      const user = await users_model.findOne({ email: decoded.email }).lean();

      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }

      const course = await Course.findOne(
        { course_name },
        "_id enrolledUsers included_in_package",
      ).lean();

      if (!course) {
        return res.status(404).json({
          error: "Course not found",
        });
      }

      const encodedEmail = decoded.email.replace(/\./g, "_dot_").toLowerCase();

      let enrolled = course.enrolledUsers?.[encodedEmail] === true;

      // যদি enrolled না থাকে, package check করো
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

      const exams = await Exam.find(
        { course: course._id },
        "exam_name start leaderboard",
      ).lean();

      return res.status(200).json({
        exams,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
