// general user model

// importing mongoose
const mongoose = require('mongoose');
const { Status, CardTypes } = require('../utils/constants');
const { modifiedAt, sum } = require('./hooks');

const cardItemSchema = new mongoose.Schema({
    card_item : {
        type: String // if card type is e-code then this would be an array of e-codes in string else it would be an array of the picture cloud_url
    },
    card_type : {
        type: String,
        enum: {
            values: [CardTypes.physical, CardTypes.eCode],
            message: "status can either be 'Physical Card' or 'E-Code'"
        }
    },
    amount : {
        type: Number,
        default: 0
    },
    state : {
        type: String,
        enum: {
            values: ['approved','pending', 'failed'],
            message: "status can either be 'approved' 'pending', or 'failed'",
        },
        default: Status.pending
    },
});

const giftcardTransactionSchema = new mongoose.Schema({
    reciever_wallet_number: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Wallet',
        required: true
    },
    currency_name: {
        type: String,
    },
    currency_symbol: {
        type: String,
    },
    currency_code: {
        type: String,
    },
    total_amount_expected: {
        type: Number,
        default: 0
    },
    total_amount_paid: {
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
    cards : {
        type: [cardItemSchema],
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
    status : {
        type: String,
        enum: {
            values: [ Status.approved, Status.pending , Status.successful , Status.failed ],
            message: "status can either be 'approved' 'pending', 'successful' or 'failed'",
        },
        default: Status.pending
    },
    active : {
        type: Boolean,
        default: true
    },
});

//setting totals to current cards after every update
giftcardTransactionSchema.pre('save', sum);

//setting modifiedAt to current time after every update
giftcardTransactionSchema.pre('save', modifiedAt);

const GiftCardTransaction = mongoose.model('GiftCardTransaction', giftcardTransactionSchema);

module.exports = GiftCardTransaction;