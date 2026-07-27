const mongoose = require("mongoose");

const youtubeVideoSchema = new mongoose.Schema({

    video_link: {
        type: String,
        required: true,
        trim: true
    }

}, {
    timestamps: true
});

const YoutubeVideo = mongoose.model("YoutubeVideo", youtubeVideoSchema);

module.exports = { YoutubeVideo };