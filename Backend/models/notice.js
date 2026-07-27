const mongoose = require("mongoose");

// models/notice.js
const noticeSchema = new mongoose.Schema({
    text: String,
    images: [{ filename: String, url: String }],
    pdfFilename: String, // সার্ভারে সেভ হওয়া ইউনিক নাম
    pdfUrl: String,
    pdfOriginalName: String // ইউজারের দেওয়া আসল নাম এখানে থাকবে
}, { timestamps: true });

module.exports.Notice = mongoose.model("Notice", noticeSchema);