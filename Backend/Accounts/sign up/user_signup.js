
const nodemailer = require( 'nodemailer' );
const express = require( 'express' );
const User = require( '../../models/users_model' );
const { sendOTP } = require( '../otp/otpsend' );

require( 'dotenv' ).config();


//check done
exports.sign_up = async (req, res) => {
  const { name, mobile, email, password } = req.body;

  try {
    const userExists = await User.findOne({
      $or: [{ mobile }, { email }],
    });

    if (userExists) {
      return res.status(400).json({
        message: "Mobile Number or Email already exists",
      });
    }

    // Generate OTP
    let base = Math.floor(100000 + Math.random() * 900000).toString();
    let seconds = new Date().getSeconds().toString();
    let otp = (base + seconds).slice(0, 6);

    const user = new User({
      name,
      mobile,
      email,
      password,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isVerified: false,
    });

    await user.save();
    await sendOTP(email, name, otp);

    res.status(200).json({
      email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};