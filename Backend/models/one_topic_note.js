const mongoose = require("mongoose");

// models/one_topic_note.js
const oneTopicNoteSchema = new mongoose.Schema({
    text: String,
    images: [{ filename: String, url: String }],
    pdfFilename: String, // সার্ভারে সেভ হওয়া ইউনিক নাম
    pdfUrl: String,
    pdfOriginalName: String // ইউজারের দেওয়া আসল নাম এখানে থাকবে
}, { timestamps: true });

module.exports.OneTopicNote = mongoose.model("OneTopicNote", oneTopicNoteSchema);
