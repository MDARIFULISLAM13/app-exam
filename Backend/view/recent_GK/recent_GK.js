// --- ADMIN APIs ---

const { adminCheck, jwtVerify_admin } = require("../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../jwt/users/jwt_users");
const RecentGK = require("../../models/recent_gk");

// Create
exports.create_gk = async (req, res) => {
  try {
    const { title, details, token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    const newGK = await RecentGK.create({ title, details });
    res.status(201).json(newGK);
  } catch (err) {
    res.status(500).json({ message: "Error creating GK" });
  }
};

// Update
exports.update_gk = async (req, res) => {
  try {
    const { id, title, details, token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    const updated = await RecentGK.findByIdAndUpdate(
      id,
      { title, details },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

// Delete
exports.delete_gk = async (req, res) => {
  try {
    const { id, token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    await RecentGK.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// --- USER & ADMIN VIEW API ---

// Get All (Latest first)
exports.get_all_gk = async (req, res) => {
  try {
    const { page = 1, token } = req.body; // frontend থেকে page আসবে

    const userDecoded = jwtVerify_user(token);
    const adminDecoded = jwtVerify_admin(token);

    if (!userDecoded && !adminDecoded) {
      return res.json({
        success: false,
        need_back: true,
      });
    }

      
    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    const data = await RecentGK.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .lean();

    const total = await RecentGK.countDocuments();

    res.json({
      data,
      hasMore: skip + data.length < total,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
