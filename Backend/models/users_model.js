const mongo = require("mongoose");

const { Schema } = mongo;
/* ============================================================
   User Key Schema
   ============================================================ */
 
const Users_Schema = mongo.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpires: Date,
});

const Users = mongo.model("Users", Users_Schema);
 
// আগের সব code যেন কাজ করে
module.exports = Users;

// নতুন Model-টাও একই require থেকে ব্যবহার করা যাবে
 