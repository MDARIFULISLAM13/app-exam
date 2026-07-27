const { adminCheck } = require("../../jwt/admin/jwt_admin");
const banner_notice = require("../../models/banner_notice");

exports.banner_notice_create = async (req, res) => {
    try {
        const {
            homepage_notice,
            my_exam_notice,
            job_notice,
            token
        } = req.body;


        if (!adminCheck(token)) return res.status(401).json({});
        // find existing notice
        let notice = await banner_notice.findOne();

        if (notice) {
            // update existing
            notice.homepage_notice = homepage_notice ?? notice.homepage_notice;
            notice.my_exam_notice = my_exam_notice ?? notice.my_exam_notice;
            notice.job_notice = job_notice ?? notice.job_notice;

            await notice.save();

            return res.status(200).json({
                success: true,
                message: 'Notice updated successfully',
                data: notice
            });
        }

        // create first time
        notice = await banner_notice.create({
            homepage_notice,
            my_exam_notice,
            job_notice
        });

        res.status(201).json({
            success: true,
            message: 'Notice created successfully',
            data: notice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};



// GET banner notice (single)
exports.banner_notice_view = async (req, res) => {
    try {
        const notice = await banner_notice.findOne().sort({ createdAt: -1 });

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: 'No notice found'
            });
        }

        res.status(200).json({
            success: true,
            data: notice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
