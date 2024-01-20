const mongoose = require("mongoose");
const { isEmail } = require("validator");

const faqSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: ["true", "fullName is required."],
    },
    email: {
      type: String,
      required: ["true", "email is required."],
      validate: [isEmail, "please enter a valid email"],
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: true,
      enum: {
        values: ["giftcards", "crypto", "wallet", "others"],
        message:
          "category can either be 'giftcards', 'crypto', 'wallet' or 'others'",
      },
    },
    answered: {
      type: Boolean,
      default: false,
    },
    archived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FAQ", faqSchema);
