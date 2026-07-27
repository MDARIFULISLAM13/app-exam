const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const { Course } = require("../../../models/course_model");
const users_model = require("../../../models/users_model");
const { getPackageKey } = require("../../../package_token/token");
const { UserKey } = require("../../../models/users_model");


//check done//

exports.view_user_all_courses = async (req, res) => {
  try {
    const { token, login_check } = req.body;

    // No token → return all courses with is_valid: false

    if (login_check == 1) {
      if (!token) {
        return res.status(200).json({
          success: true,
          is_valid: false,
          courses,
        });
      }
      // Decode token
      const decoded = jwtVerify_user(token);
      if (!decoded) {
        return res.status(200).json({
          success: true,
          is_valid: false,
          courses,
        });
      }

      // Get user
      const user = await users_model.findOne({ email: decoded.email }).lean();

      if (!user) {
        return res.status(404).json({
          success: false,
          is_valid: false,
          error: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        is_valid: true,
      });
      return;
    }

    if (!token) {
      const courses = await Course.find(
        {},
        "course_name course_price course_max_price course_duration total_exam course_details vedio_link course_image",
      ).lean();

      return res.status(200).json({
        success: true,
        is_valid: false,
        courses,
      });
    }

    // Decode token
    const decoded = jwtVerify_user(token);
    if (!decoded) {
      const courses = await Course.find(
        {},
        "course_name course_price course_max_price course_duration total_exam course_details vedio_link course_image",
      ).lean();

      return res.status(200).json({
        success: true,
        is_valid: false,
        courses,
      });
    }

    // Get user
    const user = await users_model.findOne({ email: decoded.email }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Fetch all courses
    const courses = await Course.find(
      {},
      "course_name course_price course_max_price course_duration total_exam course_details vedio_link course_image included_in_package",
    ).lean();

    const userKeys = await UserKey.find(
      { user: user._id },
      { key: 1, _id: 0 },
    ).lean();

    let hasPackage = false;

    for (const item of userKeys) {
      if (getPackageKey(item.key)) {
        hasPackage = true;
        break;
      }
    }
      

    // Add "enrolled" field to each course
    const updatedCourses = courses.map((course) => ({
      ...course,

      enrolled:
        user.enrolledCourse?.[course.course_name] ||
        (hasPackage && course.included_in_package),
    }));
      
    return res.status(200).json({
      success: true,
      is_valid: true,
      courses: updatedCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
