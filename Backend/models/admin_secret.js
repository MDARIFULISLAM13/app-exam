// backend/models/member_model.js
const mongoose = require("mongoose");

const admin_secret_Schema = new mongoose.Schema(
    {
        secret: {
            type: String,
            required: true,
            default: "admin"
        }


    },

);

// future এ চাইলে আরও model এখানে add করে একই ফাইলে export করতে পারো
const admin_secret = mongoose.model("admin_secrets", admin_secret_Schema);

module.exports = { admin_secret };
