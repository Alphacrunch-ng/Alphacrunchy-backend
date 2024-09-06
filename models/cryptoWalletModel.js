const mongoose = require("mongoose");

const cryptoWalletSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  externalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  accountId: { type: String, required: true }
},{
  timestamps: true
});

const cryptoWallet = mongoose.model("cryptoWallet", cryptoWalletSchema);
module.exports = cryptoWallet;
