const mongoose = require('mongoose');

const { Schema } = mongoose;

const supportedCryptoAssetSchema = new Schema({
    asset_id: {
        type:String, 
        required: true,
        index: true
    },
    name: {
        type: String,
    },
    contractAddress: {
        type: String
    },
    nativeAsset: {
        type: String
    },
    icon_url: {
        type: String
    },
    decimals: {
        type: Number
    }
}, 
{ 
    timestamps: true 
});

const SupportedCryptoAsset = mongoose.model('SupportedCryptoAsset', supportedCryptoAssetSchema);

module.exports = SupportedCryptoAsset;