const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const { Package } = require("../../../models/package_model");
const users_model = require("../../../models/users_model");
const { createToken } = require("../../../package_token/token");

exports.view_user_all_packages = async (req, res) => {
    try {

        const { token } = req.body;

        // Token না থাকলে
        if (!token) {


            const packages = await Package
                .find(
                    {},
                    "_id package_name package_price package_max_price package_image package_details"
                )
                .lean();

            return res.status(200).json({
                success: true,
                is_valid: false,
                packages: packages.map(pkg => ({
                    ...pkg,
                    enrolled: false
                }))
            });
        }

        // Token verify
        const decoded = jwtVerify_user(token);

        if (!decoded) {

            const packages = await Package
                .find(
                    {},
                    "_id package_name package_price package_max_price package_image package_details"
                )
                .lean();

            return res.status(200).json({
                success: true,
                is_valid: false,
                packages: packages.map(pkg => ({
                    ...pkg,
                    enrolled: false
                }))
            });
        }

        // User
        const user = await users_model.findOne({
            email: decoded.email
        }).lean();

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // সব package আনো (package_key-ও লাগবে token বানানোর জন্য)
        const packages = await Package
            .find(
                {},
                "_id package_name package_price package_max_price package_image package_details package_key"
            )
            .lean();

        const updatedPackages = [];

        for (const pkg of packages) {

            const package_token = createToken(pkg.package_key);

            

            const hasToken = await users_model.UserKey.exists({
                user: user._id,
                key: package_token
            });

            updatedPackages.push({
                _id: pkg._id,
                package_name: pkg.package_name,
                package_price: pkg.package_price,
                package_max_price: pkg.package_max_price,
                package_image: pkg.package_image,
                package_details: pkg.package_details,
                enrolled: !!hasToken
            });
        }

        return res.status(200).json({
            success: true,
            is_valid: true,
            packages: updatedPackages
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

};