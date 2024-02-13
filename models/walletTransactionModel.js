// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');
const { Status } = require('../utils/constants');


const walletTransactionSchema = new mongoose.Schema({
    sender_wallet_number: {
        type: String,
        required: ['true', 'sender_wallet_number is required.']
    },
    reciever_wallet_number: {
        type: String,
        required: ['true', 'reciever_wallet_number is required.']
    },
    amount : {
        type: Number,
        default: 0
    },
    description: {
        type: String,
    },
    reciever_acn: { // recievers account number last four digit for payout from wallet eg. 6789. LEAVE EMPTY FOR INTERNAL TRANSFERS
        type: String,
        default: ""
    },
    transaction_number: {
        type: String,
        index: true
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
            values: [Status.pending, Status.successful, Status.failed],
            message: "status can either be 'pending' or 'successful' or 'failed'",
        },
        default: 'pending'
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