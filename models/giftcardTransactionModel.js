// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');


const giftcardTransactionSchema = new mongoose.Schema({
    reciever_wallet_number: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Wallet',
        required: ['true', 'reciever_wallet_number is required.']
    },
    currency: {
        type: String,
    },
    amount : {
        type: Number,
        default: 0
    },
    rate : {
        type: Number,
        default: 0
    },
    total_cards : {
        type: Number,
        default: 0
    },
    card_type : {
        type: String,
        enum: {
            values: ['physical', 'e-code'],
            message: "status can either be 'physical' or 'e-code'",
        },
    },
    cards : {
        // if card type is e-code then this would be an array of e-codes in string else it would be an array of the picture cloud_url
        type: [String],
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
    state : {
        type: String,
        enum: {
            values: ['pending', 'successful', 'failed'],
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
giftcardTransactionSchema.pre('save', modifiedAt);

const GiftCardTransaction = mongoose.model('GiftCardTransaction', giftcardTransactionSchema);

module.exports = GiftCardTransaction;