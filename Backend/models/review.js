const mongoose = require("mongoose");

/* ================= ADVICE ================= */

const AdviceSchema = new mongoose.Schema(
  {
    advice: {
      type: String,
      required: true,
      trim: true,
    },
    userIp: {
      type: String,
      required: true,
    },
    day: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

AdviceSchema.index({ userIp: 1, day: 1 });

const Advice = mongoose.model("Advice", AdviceSchema);

/* ================= ADMIN GALLERY ================= */

const AdminGallerySchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const AdminGallery = mongoose.model("AdminGallery", AdminGallerySchema);

/* ================= EXPORT ================= */

module.exports = {
  Advice,
  AdminGallery,
};
