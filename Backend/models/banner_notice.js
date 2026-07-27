const mongoose = require('mongoose');

const banner_noticeSchema = new mongoose.Schema(
    {
        homepage_notice: {
            type: String,
            required: false,
            trim: true
        },

        my_exam_notice: {
            type: String,
            required: false,
            trim: true
        },

        job_notice: {
            type: String,
            required: false,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('banner_notice', banner_noticeSchema);
