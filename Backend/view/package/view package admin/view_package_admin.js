const { Package } = require("../../../models/package_model");

exports.view_all_packages = async (req, res) => {

    try {

        const packages = await Package
            .find(
                {},
                "package_name package_price package_key package_max_price package_details package_image"
            )
            .lean();

        return res.status(200).json({
            success: true,
            packages
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
};