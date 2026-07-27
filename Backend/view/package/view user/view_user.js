const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { Package } = require("../../../models/package_model");
const Users = require("../../../models/users_model");
const { createToken } = require("../../../package_token/token");

function decodeEmail(encodedEmail) {
  return encodedEmail.replace(/_dot_/g, ".");
}

function encodeEmail(email) {
  return email.replace(/\./g, "_dot_");
}

exports.view_package_user = async (req, res) => {
  try {
    const { package_name, token } = req.body;

    if (!token) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    const decoded = jwtVerify_admin(token);

    if (!decoded || decoded.username !== process.env.admin_user) {
      return res.status(401).json({
        token_issue: true,
        message: "Session Expired. Please log in again.",
      });
    }

    if (!package_name) {
      return res.status(400).json({
        error: "Package name is required",
      });
    }

    const packageData = await Package.findOne({ package_name });

    if (!packageData) {
      return res.status(404).json({
        error: "Package not found",
      });
    }

    const package_token = createToken(packageData.package_key);

    const emails = Array.from(packageData.enrolledUsers.keys()).map(
      decodeEmail,
    );

    const users = [];
    let updated = false;

    for (const email of emails) {
      const user = await Users.findOne(
        { email },
        { name: 1, email: 1, mobile: 1 },
      ).lean();

      if (!user) {
        continue;
      }

      const hasKey = await Users.UserKey.exists({
        user: user._id,
        key: package_token,
      });

      if (hasKey) {
        users.push({
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          enrolledAt:
            packageData.enrolledUsersTime.get(encodeEmail(email)) || null,
        });
      } else {
          packageData.enrolledUsers.set(encodeEmail(email), false);
          packageData.enrolledUsersTime.delete(encodeEmail(email));
        updated = true;
      }
    }

    if (updated) {
      await packageData.save();
    }

    return res.status(200).json({
      enrolledUsers: users,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
