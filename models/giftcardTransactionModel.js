
// importing mongoose
const mongoose = require('mongoose');
const { Status } = require('../utils/constants');
const { modifiedAt, sum, updateGiftcardTransactionStatus, checkAndUpdateGiftcardTransactionStatus } = require('./hooks');

const cardItemSchema = new mongoose.Schema({
    card_item : {
        type: String // if card type is e-code then this would be an array of e-codes in string else it would be an array of the picture cloud_url
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
    item_card_rate: {
        type: mongoose.Schema.Types.ObjectId, ref: 'GiftCardRate'
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
    },
    description: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    transaction_number: {
        type: String,
        index: true
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

// // check each card statuses and sets to approve if all are approved and fail if all are fail
// giftcardTransactionSchema.pre('save', updateGiftcardTransactionStatus);
// giftcardTransactionSchema.pre('findOneAndUpdate', checkAndUpdateGiftcardTransactionStatus);

//setting modifiedAt to current time after every update
giftcardTransactionSchema.pre('save', modifiedAt);
giftcardTransactionSchema.pre('findOneAndUpdate', function(next) {
    this._update.modifiedAt = new Date();
    next();
  });

const GiftCardTransaction = mongoose.model('GiftCardTransaction', giftcardTransactionSchema);

module.exports = GiftCardTransaction;