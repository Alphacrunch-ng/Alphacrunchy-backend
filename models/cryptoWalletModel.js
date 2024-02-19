const mongoose = require("mongoose");

const cryptoWalletSchema = new mongoose.Schema({
  uid: { type: String, required: true },
  name: { type: String, required: true },
  externalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isDeleted: { type: Boolean, default: false, required: true },
  isArchived: { type: Boolean, default: false, required: true },
  organizationId: { type: String, required: true },
  network: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  mode: { type: String, required: true },
  accountId: { type: String, required: true },
  addresses: { type: Array, required: true, defaultValue: [] },
});

const cryptoWallet = mongoose.model("cryptoWallet", cryptoWalletSchema);
module.exports = cryptoWallet;
