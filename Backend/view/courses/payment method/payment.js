const { jwtVerify_admin } = require("../../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../../jwt/users/jwt_users");
const payment_model = require("../../../models/payment_model");

//check done
// Add Payment
exports.add_method = async (req, res) => {
    const { token, method_name, Number, admin_pass } = req.body;

    if (!method_name || !Number) {
        return res.send({
            status: false,
            message: " payment method name and Number are required"
        });
    }

    try {

        const decoded = jwtVerify_admin(token);

        if (!decoded) {
            return res.status(401).json({ token_issue: true, message: "Session Expired. Please log in again." });
        }

        const admin_username = decoded.username;


        if (admin_username != process.env.admin_user) {

            return res.status(401).json({

                token_issue: true,
                message: "Session Expired. Please log in again."
            });

        }
        if (admin_pass !== process.env.admin_pass) {
            return res.send({
                status: false,
                message: "Password does not match"
            });
        }

        const payment = new payment_model({ method_name, Number });
        await payment.save();
        res.send({
            status: true,
            message: "Payment method added successfully",
            data: payment
        });
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        });
    }
};

//check done
// View All Payments
exports.view_methods = async (req, res) => {
    try {


        const { token, who } = req.body;


        if (who == "user") {
            const decoded_user = jwtVerify_user(token);

            if (!decoded_user) {
                return res.status(401).json({ token_issue: true, message: "Session Expired. Please log in again." });
            }


        }

        else if (!who) {
            const decoded = jwtVerify_admin(token);


            if (!decoded) {
                return res.status(401).json({ token_issue: true, message: "Session Expired. Please log in again." });
            }


            const admin_username = decoded.username;


            if (admin_username != process.env.admin_user) {

                return res.status(401).json({

                    token_issue: true,
                    message: "Session Expired. Please log in again."
                });

            }

        }




        const payments = await payment_model.find();
        res.send({
            status: true,
            data: payments
        });
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        });
    }
};

//check done
// Update Payment
exports.update_method = async (req, res) => {
    const { method_name, Number, admin_pass, id, token } = req.body;

    try {

        const decoded = jwtVerify_admin(token);

        if (!decoded) {
            return res.status(401).json({ token_issue: true, message: "Session Expired. Please log in again." });
        }

        const admin_username = decoded.username;


        if (admin_username != process.env.admin_user) {

            return res.status(401).json({

                token_issue: true,
                message: "Session Expired. Please log in again."
            });

        }

        if (admin_pass !== process.env.admin_pass) {
            return res.send({
                status: false,
                message: "Password does not match"
            });
        }
        const updated = await payment_model.findByIdAndUpdate(
            id,
            { method_name, Number },
            { new: true }
        );

        if (!updated) {
            return res.send({
                status: false,
                message: "Payment method not found"
            });
        }

        res.send({
            status: true,
            message: "Payment method updated successfully",
            data: updated
        });
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        });
    }
};

//check done
/// Delete Payment
exports.delete_method = async (req, res) => {

    const { id, admin_pass, token } = req.body;

    try {
        const decoded = jwtVerify_admin(token);

        if (!decoded) {
            return res.status(401).json({ token_issue: true, message: "Session Expired. Please log in again." });
        }

        const admin_username = decoded.username;


        if (admin_username != process.env.admin_user) {

            return res.status(401).json({

                token_issue: true,
                message: "Session Expired. Please log in again."
            });

        }

        if (admin_pass !== process.env.admin_pass) {
            return res.send({
                status: false,
                message: "Password does not match"
            });
        }

        // Delete payment method
        const deleted = await payment_model.findByIdAndDelete(id);

        if (!deleted) {
            return res.send({
                status: false,
                message: "Payment method not found"
            });
        }

        res.send({
            status: true,
            message: "Payment method deleted successfully"
        });
    } catch (err) {
        res.send({
            status: false,
            message: err.message
        });
    }
};


