// general user model

// importing mongoose
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { modifiedAt, setWalletNumber } = require('./hooks');


const walletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    wallet_number: {
        type: String
    },
    wallet_pin : {
        type: String,
        required: ['true', 'pin is required.']
    },
    balance : {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    },
    active : {
        type: Boolean,
        default: true
    },
});

//setting modifiedAt to current time after every update
walletSchema.pre('save', modifiedAt);
walletSchema.pre('save', setWalletNumber);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;