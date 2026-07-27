// backend/models/member_model.js
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        details: {
            type: String,
            required: true,
            trim: true,
        },
        imageFilename: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// future এ চাইলে আরও model এখানে add করে একই ফাইলে export করতে পারো
const Member = mongoose.model("Member", memberSchema);

module.exports = { Member };
