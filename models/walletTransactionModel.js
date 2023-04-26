// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');


const walletTransactionSchema = new mongoose.Schema({
    sender_wallet_number: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Wallet',
        required: ['true', 'sender_wallet_number is required.']
    },
    reciever_wallet_number: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Wallet',
        required: ['true', 'reciever_wallet_number is required.']
    },
    amount : {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    transaction_number: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    },
    state : {
        type: String,
        enum: {
            values: ['pending', 'successful', 'failed'],
            message: "status can either be 'pending' or 'successful' or 'failed'",
        },
    },
    active : {
        type: Boolean,
        default: true
    },
});

//setting modifiedAt to current time after every update
walletTransactionSchema.pre('save', modifiedAt);

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = WalletTransaction;