// general user model

// importing mongoose
const mongoose = require("mongoose");
const { roles } = require("../utils/constants");
const { isEmail } = require("validator");
const {
  modifiedAt,
  normalizeEmail,
  setRole,
  encryptPassword,
  set2FA,
} = require("./hooks");
// const { phoneFormater } = require('../utils/services');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  middleName: {
    type: String
  },
  email: {
    type: String,
    required: ["true", "email is required."],
    validate: [isEmail, "please enter a valid email"],
    index: true,
    unique: true,
  },
  sex: {
    type: String,
    enum: {
      values: ["male", "female", "others"],
      message: "sex can either be 'male' or 'female' or 'others'",
    },
  },
  dob: {
    type: Date
  },
  profilePicture_url: {
    type: String,
  },
  profilePic_cloudId: {
    type: String,
  },
  phoneNumber: {
    type: String,
    required: ["true", "phone number is required."],
  },
  country: {
    type: String,
    default: "Nigeria",
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  address: {
    type: String,
  },
  password: {
    type: String,
    required: ["true", "password is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    enum: Object.values(roles),
    default: roles.client,
  },
  otp: {
    type: String,
  },
  kycLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 2,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  confirmedEmail: {
    type: Boolean,
    default: false,
  },
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false,
    },
    secret: {
      type: String,
      default: "",
    },
    expiresAt: {
      type: Date,
      default: Date.now(),
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: new Date(),
  },
});

//encrypts the password and sets the role
userSchema.pre("save", encryptPassword);

//encrypts the password and sets the role
userSchema.pre("save", setRole);

userSchema.pre("save", set2FA);

//setting modifiedAt to current time after every update
userSchema.pre("save", modifiedAt);
userSchema.pre("findOneAndUpdate", function (next) {
  this._update.modifiedAt = new Date();
  next();
});

//normalizing user email to lowercase every update
userSchema.pre("save", normalizeEmail);

const User = mongoose.model("User", userSchema);

module.exports = User;

module.exports = userSchema;
