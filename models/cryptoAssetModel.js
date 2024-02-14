const mongoose = require('mongoose');

const { Schema } = mongoose;

const cryptoAssetSchema = new Schema({
    uid: { type: String, required: true },
    guid: { type: String, required: true },
    icon: { type: String},
    account_uid: { type: String, required: true},
    label: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isContract: { type: Boolean, default: false },
    chain: { type: String, required: true, unique: true },
    network: { type: String, required: true },
    mode: { type: String, required: true },
    assetType: { type: String, required: true },
    autoForwardAddress: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    balance: {
        received: { type: String, default: '0.0' },
        sent: { type: String, default: '0.0' },
        balance: { type: String, default: '0.0' },
        pending: { type: String, default: '0.0' },
        blocked: { type: String, default: '0.0' }
    }
});

const CryptoAssetModel = mongoose.model('CryptoAsset', cryptoAssetSchema);

module.exports = CryptoAssetModel;
