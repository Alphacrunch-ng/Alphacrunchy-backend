
// importing mongoose
const mongoose = require('mongoose');
const { Status } = require('../utils/constants');
const { modifiedAt, sum } = require('./hooks');

const cardItemSchema = new mongoose.Schema({
    card_item : {
        type: String, // if card type is e-code then this would be an array of e-codes in string else it would be an array of the picture cloud_url 
        default: ""
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
    }
});

const giftcardTransactionSchema = new mongoose.Schema({
    reciever_wallet_number: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    giftcard_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'GiftCard'
    },
    total_amount_expected: {
        type: Number,
        default: 0
    },
    total_amount_paid: {
        type: Number,
        default: 0
    },
    total_cards : {
        type: Number,
        default: 0
    },
    cards : {
        type: [cardItemSchema],
        sparse: true
    },
    description: {
        type: String,
    },
    transaction_number: {
        type: String,
        index: true
    },
    status : {
        type: String,
        enum: {
            values: [ Status.approved, Status.pending , Status.successful , Status.failed ],
            message: "status can either be 'approved' 'pending', 'successful' or 'failed'",
        },
        default: Status.pending
    },
    card_rate_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'GiftCardRate'
    },
    active : {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true
});

//setting totals to current cards after every update
giftcardTransactionSchema.pre('save', sum);

// // check each card statuses and sets to approve if all are approved and fail if all are fail
// giftcardTransactionSchema.pre('save', updateGiftcardTransactionStatus);
// giftcardTransactionSchema.pre('findOneAndUpdate', checkAndUpdateGiftcardTransactionStatus);


const GiftCardTransaction = mongoose.model('GiftCardTransaction', giftcardTransactionSchema);

module.exports = GiftCardTransaction;