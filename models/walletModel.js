// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt, setWalletNumber } = require('./hooks');
const {currencies} = require('../utils/currencies.json');

const Naira = currencies.find(e => e.symbol ==='₦')


const walletSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    wallet_number: {
        type: String
    },
    accountNumber: {
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
    currency: {
        type: {
            code: String,
            name: String,
            symbol: String
        },
        default: {...Naira}
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    },
    default : {
        type: Boolean,
        default: false
    },
    active : {
        type: Boolean,
        default: true
    },
});

//setting modifiedAt to current time after every update
walletSchema.pre('save', modifiedAt);
walletSchema.pre('findOneAndUpdate', function(next) {
    this._update.modifiedAt = new Date();
    next();
  });
walletSchema.pre('save', setWalletNumber);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;