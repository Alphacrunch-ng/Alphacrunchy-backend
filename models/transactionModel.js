// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');


const transactionSchema = new mongoose.Schema({
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
transactionSchema.pre('save', modifiedAt);

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;