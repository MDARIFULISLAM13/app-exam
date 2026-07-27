const { jwtVerify_admin } = require("../../../../jwt/admin/jwt_admin");
const { jwtVerify_user } = require("../../../../jwt/users/jwt_users");
const EnrollRequest = require("../../../../models/enroll_model");
const users_model = require("../../../../models/users_model");

//check done
// ADD
exports.add_enroll = async (req, res) => {
    try {
        const { course_name,package_id, payment_method, payment_number, txid, sending_number, calling_number, referral_code, token } = req.body;



        if (!course_name || !payment_method || !payment_number || !txid || !sending_number || !calling_number || !token) {
            return res.status(400).json({ status: false, message: "All fields are required" });
        }

        const decoded = jwtVerify_user(token);

        if (!decoded) {
            return res.status(400).json({ status: false, token_issue: true, message: "Session Expire!" });
        }

        const email = decoded.email;
        const user = await users_model.findOne({ email });
        if (!user) return res.status(401).json({ message: 'User Not Found' });


        const newEnroll = new EnrollRequest({
            course_name,
            package_id,
            payment_method,
            payment_number,
            txid,
            sending_number,
            calling_number,
            email: decoded.email,
            referral_code
        });

        await newEnroll.save();
        res.json({ status: true, message: "Enroll request added", data: newEnroll });

    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};





//check done
// VIEW all
exports.get_all_enrolls = async (req, res) => {

    const { token } = req.body;


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
        const data = await EnrollRequest.find();

    
        res.json({ status: true, data });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};




// DELETE by ID
exports.delete_enroll = async (req, res) => {
    try {
        const { id, token } = req.body;

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



        const deleted = await EnrollRequest.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ status: false, message: "Data not found" });
        }

        res.json({ status: true, message: "Deleted successfully", data: deleted });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};
