const mongoose = require("mongoose");

const subAccountSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    externalId: { type: String },
  },
  {
    timestamps: true,
  }
);

const subAccount = mongoose.model("subAccount", subAccountSchema);
module.exports = subAccount;
