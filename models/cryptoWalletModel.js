const mongoose = require("mongoose");

const cryptoWalletSchema = new mongoose.Schema(
  {
    external_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const cryptoWallet = mongoose.model("cryptoWallet", cryptoWalletSchema);
module.exports = cryptoWallet;
