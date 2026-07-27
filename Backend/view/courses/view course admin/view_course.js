const { Course } = require("../../../models/course_model");

exports.view_all_courses = async (req, res) => {

    try {

    
        const courses = await Course
            .find({}, "course_name course_price course_max_price course_duration included_in_package total_exam course_details vedio_link course_image")
            .lean();

        return res.status(200).json({
            success: true,
            courses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};