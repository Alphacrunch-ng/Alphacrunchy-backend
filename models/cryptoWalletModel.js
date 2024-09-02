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
  network: { 
    type: String
  },
  mode: { type: String},
  accountId: { type: String, required: true },
  addresses: { type: Array, defaultValue: [] },
},{
  timestamps: true
});

const cryptoWallet = mongoose.model("cryptoWallet", cryptoWalletSchema);
module.exports = cryptoWallet;
