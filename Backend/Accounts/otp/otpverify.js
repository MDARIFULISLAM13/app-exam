const { jwtgen_user } = require("../../jwt/users/jwt_users");
const User = require("../../models/users_model");



//check done;
exports.verifyOtp = async (req, res) => {


    try {
        const { email, otp } = req.body;


        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;

        await user.save();

        const check = jwtgen_user(user.email);

        res.json({ message: 'Email verified successfully!', check });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};