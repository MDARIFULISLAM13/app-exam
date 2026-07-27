const mongo = require("mongoose");

const { Schema } = mongo;
/* ============================================================
   User Key Schema
   ============================================================ */

const keySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
    },

    expireAt: {
      type: Date,
      required: true,
      expires: 0, // TTL
    },
  },
  {
    timestamps: true,
  },
);

keySchema.index({ user: 1, key: 1 }, { unique: true });

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
  Last_Institute_Name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  enrolledCourse: {
    type: Map,
    of: Boolean,
    default: {},
  },
  registration_date: {
    type: Date,
    default: Date.now,
  },
  otp: String,
  otpExpires: Date,
});

const Users = mongo.model("Users", Users_Schema);
const UserKey = mongo.model("UserKey", keySchema);

// আগের সব code যেন কাজ করে
module.exports = Users;

// নতুন Model-টাও একই require থেকে ব্যবহার করা যাবে
module.exports.UserKey = UserKey;
