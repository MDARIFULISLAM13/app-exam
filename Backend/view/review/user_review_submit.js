const path = require("path");
const fs = require("fs");
const multer = require("multer");

const { jwtVerify_admin, adminCheck } = require("../../jwt/admin/jwt_admin");
const { Advice, AdminGallery } = require("../../models/review");
const { jwtVerify_user } = require("../../jwt/users/jwt_users");
const Users = require("../../models/users_model");

/* =====================================================
   ================= ADVICE PART ========================
===================================================== */

/* ---------- helper ---------- */
function getToday() {
  return new Date().toISOString().split("T")[0];
}

/* ---------- create advice ---------- */
exports.create_advice = async (req, res) => {
  try {
    const { advice, token } = req.body;

    const userDecoded = jwtVerify_user(token);

    if (!userDecoded) {
      return res.json({
        success: false,
        need_back: true,
      });
    }

    if (!advice || !advice.trim()) {
      return res.status(400).json({ message: "Advice required" });
    }

    // Get user data from database
    const user = await Users.findOne({ email: userDecoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userIp = req.ip;
    const today = getToday();

    const count = await Advice.countDocuments({ userIp, day: today });
    if (count >= 10) {
      return res.status(429).json({
        message: "Daily limit reached (10)",
      });
    }

    const created = await Advice.create({
      advice: advice.trim(),
      userIp,
      day: today,
      name: user.name,
      email: user.email,
      phone: user.mobile,
    });

    res.status(201).json({ success: true, data: created });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- admin: list advice ---------- */
exports.admin_get_advices = async (req, res) => {
  try {
    const { token } = req.body;
    if (!adminCheck(token)) return res.status(401).json({});

    const advices = await Advice.find().sort({ createdAt: -1 }).lean();

    res.json({ advices });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------- admin: delete advice ---------- */
exports.admin_delete_advice = async (req, res) => {
  try {
    const { adviceId, token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    if (!adviceId) return res.status(400).json({});

    await Advice.findByIdAndDelete(adviceId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   ================= GALLERY PART =======================
===================================================== */

const uploadDir = path.join(__dirname, "..", "..", "uploads", "admin_gallery");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ---------- multer ---------- */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);

    let filename = file.originalname;
    let counter = 1;

    while (fs.existsSync(path.join(uploadDir, filename))) {
      filename = `${base}_${counter}${ext}`;
      counter++;
    }
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files allowed"), false);
  }
  cb(null, true);
}

exports.upload_admin_gallery_image = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ---------- helper ---------- */
function removeFile(filename) {
  if (!filename) return;
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ---------- admin: upload image ---------- */
exports.upload_image = async (req, res) => {
  try {
    const { token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const image = await AdminGallery.create({
      filename: req.file.filename,
      url: `${req.protocol}://${req.get("host")}/uploads/admin_gallery/${req.file.filename}`,
    });

    res.status(201).json({ message: "Image uploaded", image });
  } catch (err) {
    if (req.file) removeFile(req.file.filename);
    res.status(500).json({ error: err.message });
  }
};

/* ---------- admin: list images ---------- */
exports.admin_list_images = async (req, res) => {
  try {
    const images = await AdminGallery.find().sort({ createdAt: -1 }).lean();

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------- admin: delete image ---------- */
exports.delete_image = async (req, res) => {
  try {
    const { id, token } = req.body;

    if (!adminCheck(token)) return res.status(401).json({});

    const image = await AdminGallery.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    removeFile(image.filename);
    await AdminGallery.findByIdAndDelete(id);

    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------- user: view images ---------- */
exports.user_list_images = async (req, res) => {
  try {
    const images = await AdminGallery.find().sort({ createdAt: -1 }).lean();

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
