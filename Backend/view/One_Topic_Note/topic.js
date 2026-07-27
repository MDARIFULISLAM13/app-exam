const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { OneTopicNote } = require("../../models/one_topic_note");
const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../jwt/users/jwt_users");
const Users = require("../../models/users_model");

/* ===========================================
   UPLOAD DIRECTORY
=========================================== */

const uploadDir = path.join(__dirname, "..", "..", "uploads", "one_topic_note");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/* ===========================================
   MULTER CONFIG (IMAGE + PDF)
=========================================== */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const originalName = file.originalname;
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);

    let fileName = originalName;
    let counter = 1;

    while (fs.existsSync(path.join(uploadDir, fileName))) {
      fileName = `${nameWithoutExt}${counter}${ext}`;
      counter++;
    }

    cb(null, fileName);
  },
});

function fileFilter(req, file, cb) {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image or pdf files allowed"), false);
  }
  cb(null, true);
}

const upload_one_topic_note_image = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.upload_one_topic_note_image = upload_one_topic_note_image;

/* ===========================================
   HELPER
=========================================== */

function removeFile(filename) {
  if (!filename) return;
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

/* ===========================================
   CREATE ONE TOPIC NOTE
=========================================== */

exports.create_one_topic_note = async (req, res) => {
  try {
    const { text, token } = req.body;

    const decoded = jwtVerify_admin(token);
    if (!decoded || decoded.username !== process.env.admin_user) {
      if (req.files) {
        if (req.files.images)
          req.files.images.forEach((f) => removeFile(f.filename));
        if (req.files.pdf) removeFile(req.files.pdf[0].filename);
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    let imagesData = [];
    let pdfData = { filename: "", url: "", originalName: "" };

    if (req.files && req.files.images) {
      req.files.images.forEach((file) => {
        imagesData.push({
          filename: file.filename,
          url: `${req.protocol}://${req.get("host")}/uploads/one_topic_note/${file.filename}`,
        });
      });
    }

    if (req.files && req.files.pdf) {
      const file = req.files.pdf[0];
      pdfData.filename = file.filename;
      pdfData.url = `${req.protocol}://${req.get("host")}/uploads/one_topic_note/${file.filename}`;
      pdfData.originalName = file.originalname;
    }

    if (!text && imagesData.length === 0 && !pdfData.filename) {
      return res
        .status(400)
        .json({ error: "At least text, image or pdf is required" });
    }

    const one_topic_note = await OneTopicNote.create({
      text,
      images: imagesData,
      pdfFilename: pdfData.filename,
      pdfUrl: pdfData.url,
      pdfOriginalName: pdfData.originalName,
    });

    res.status(201).json({ message: "One Topic Note created", one_topic_note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ===========================================
   LIST ALL
=========================================== */

exports.list_one_topic_notes = async (req, res) => {
  try {
    const { page = 1, token, who } = req.body;

  if (who == "user") {
    if (!token) {
      return res.json({
        success: false,
        need_back: true,
      });
    }

    const decoded = jwtVerify_user(token);

    if (!decoded || !decoded.email) {
      return res.json({
        success: false,
        need_back: true,
      });
    }

    const email = decoded.email;

    const user = await Users.findOne({ email });

    if (!user || !user.enrolledCourse || user.enrolledCourse.size === 0) {
      return res.json({
        success: false,
        need_back: true,
      });
    }
  } else {
    const decoded = jwtVerify_admin(token);
    if (!decoded || decoded.username !== process.env.admin_user) {
      return res
        .status(401)
        .json({ token_issue: true, message: "Session Expired" });
    }
  }

    const LIMIT = 10;
    const skip = (page - 1) * LIMIT;

    const notes = await OneTopicNote.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .lean();

    const total = await OneTopicNote.countDocuments();

    res.status(200).json({
      notes,
      hasMore: skip + notes.length < total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================================
   GET SINGLE
=========================================== */

exports.get_one_topic_note = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "One Topic Note id is required" });
    }

    const note = await OneTopicNote.findById(id);
    if (!note) {
      return res.status(404).json({ error: "One Topic Note not found" });
    }

    res.status(200).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================================
   UPDATE ONE TOPIC NOTE
=========================================== */

exports.update_one_topic_note = async (req, res) => {
  try {
    const { id, text, token } = req.body;

    const decoded = jwtVerify_admin(token);
    if (!decoded || decoded.username !== process.env.admin_user) {
      return res
        .status(401)
        .json({ token_issue: true, message: "Session Expired" });
    }

    const note = await OneTopicNote.findById(id);
    if (!note) {
      return res.status(404).json({ error: "One Topic Note not found" });
    }

    note.text = text ? text.trim() : "";

    if (req.files && req.files.images) {
      if (note.images) note.images.forEach((img) => removeFile(img.filename));
      note.images = req.files.images.map((file) => ({
        filename: file.filename,
        url: `${req.protocol}://${req.get("host")}/uploads/one_topic_note/${file.filename}`,
      }));
    }

    if (req.files && req.files.pdf) {
      if (note.pdfFilename) removeFile(note.pdfFilename);
      const pdf = req.files.pdf[0];
      note.pdfFilename = pdf.filename;
      note.pdfUrl = `${req.protocol}://${req.get("host")}/uploads/one_topic_note/${pdf.filename}`;
      note.pdfOriginalName = pdf.originalname;
    }

    await note.save();
    res.status(200).json({ message: "One Topic Note updated", note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===========================================
   DELETE ONE TOPIC NOTE
=========================================== */

exports.delete_one_topic_note = async (req, res) => {
  try {
    const { id, token } = req.body;

    const decoded = jwtVerify_admin(token);
    if (!decoded || decoded.username !== process.env.admin_user) {
      return res
        .status(401)
        .json({ token_issue: true, message: "Session Expired" });
    }

    const note = await OneTopicNote.findById(id);
    if (!note) {
      return res.status(404).json({ error: "One Topic Note not found" });
    }

    if (note.images) note.images.forEach((img) => removeFile(img.filename));
    removeFile(note.pdfFilename);

    await OneTopicNote.findByIdAndDelete(id);
    res.status(200).json({ message: "One Topic Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
