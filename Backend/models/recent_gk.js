const mongoose = require('mongoose');
const { Schema } = mongoose;

const recentGKSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        details: { type: String, required: true, trim: true },
    },
    { timestamps: true } // এটি ব্যবহার করে আমরা সহজেই sorting করতে পারব
);

module.exports = mongoose.model('RecentGK', recentGKSchema);