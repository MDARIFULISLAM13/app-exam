const mongoose = require("mongoose");

const { Schema } = mongoose;

const packageSchema = new Schema(
  {
    package_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    package_price: {
      type: Number,
      required: true,
      min: 0,
    },
    package_key: {
      type: Number,
      required: true,
      min: 0,
    },

    package_max_price: {
      type: Number,
      default: null,
    },

    package_image: {
      type: String,
      default: null,
    },

    package_details: {
      type: String,
      default: "",
      trim: true,
    },
    enrolledUsers: {
      type: Map,
      of: Boolean,
      default: {},
    },
    enrolledUsersTime: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true },
);

//packageSchema.index({ package_name: 1 }, { unique: true });

const Package = mongoose.model("Package", packageSchema);

module.exports = {
  Package,
};
