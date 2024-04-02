// general user model

// importing mongoose
const mongoose = require('mongoose');
const { Status } = require('../utils/constants');


const cryptoTransactionSchema = new mongoose.Schema({
    transaction_number: {
        type: String,
        index: true
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
},{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const CryptoTransaction = mongoose.model('CryptoTransaction', cryptoTransactionSchema);

module.exports = CryptoTransaction;