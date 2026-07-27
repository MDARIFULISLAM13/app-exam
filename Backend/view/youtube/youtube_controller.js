const { jwtVerify_admin } = require("../../jwt/admin/jwt_admin");
const { YoutubeVideo } = require("../../models/youtube_video_model");



/* ================================
   ADD YOUTUBE VIDEO
================================ */

exports.youtube_add = async (req, res) => {

    try {

        const { video_link, token } = req.body;

        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const decoded = jwtVerify_admin(token);

        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }






        if (!video_link) {
            return res.json({
                success: false,
                message: "Video link required"
            });
        }

        if (!video_link.includes("youtu")) {
            return res.json({
                success: false,
                message: "Invalid youtube link"
            });
        }

        const video = new YoutubeVideo({
            video_link
        });

        await video.save();

        return res.json({
            success: true,
            message: "Video added successfully"
        });

    } catch (error) {

        return res.json({
            success: false,
            error: error.message
        });

    }

};




/* ================================
   DELETE VIDEO 
================================ */

exports.youtube_delete = async (req, res) => {

    try {

        const { id, token } = req.body;
        if (!token) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }

        const decoded = jwtVerify_admin(token);

        if (!decoded || decoded.username !== process.env.admin_user) {
            return res.status(401).json({
                token_issue: true,
                message: "Session Expired. Please log in again."
            });
        }
        if (!id) {
            return res.json({
                success: false,
                message: "Video id required"
            });
        }

        await YoutubeVideo.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: "Video deleted"
        });

    } catch (error) {

        return res.json({
            success: false,
            error: error.message
        });

    }

};




/* ================================
   VIDEO LIST
================================ */

exports.youtube_list = async (req, res) => {

    try {

        const videos = await YoutubeVideo
            .find({})
            .sort({ createdAt: -1 })
            .lean();

        return res.json({
            success: true,
            videos
        });

    } catch (error) {

        return res.json({
            success: false,
            error: error.message
        });

    }

};