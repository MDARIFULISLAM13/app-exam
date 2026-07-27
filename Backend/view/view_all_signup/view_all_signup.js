const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");
const User = require("../../models/users_model");

exports.get_all_users = async (req, res) => {
  try {
    const { token } = req.body;

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

    const users = await User.find(
      {},
      {
        name: 1,
        Last_Institute_Name: 1,
        email: 1,
        mobile: 1,
        registration_date: 1,
      },
    ).sort({ registration_date: -1 });

    const data = users.map((user) => ({
      name: user.name || "",
      institute: user.Last_Institute_Name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      registration_date: user.registration_date || "",
    }));

    res.status(200).json({
      success: true,
      total: data.length,
      users: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
