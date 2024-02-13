const mongoose = require("mongoose");

const cryptoWalletSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    external_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String , default: "" },
  },
  {
    timestamps: true,
  }
);

const cryptoWallet = mongoose.model("cryptoWallet", cryptoWalletSchema);
module.exports = cryptoWallet;
