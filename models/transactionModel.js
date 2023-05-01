const mongoose = require('mongoose');
const { Status } = require('../utils/constants');
const { modifiedAt, setTransactionNumber } = require('./hooks');

const transactionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transaction_number: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0,
  },
  status : {
    type: String,
    enum: {
        values: [ Status.approved, Status.pending , Status.successful , Status.failed ],
        message: "status can either be 'approved', 'pending', 'successful' or 'failed'",
    },
    default: Status.pending
    },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  modifiedAt: {
    type: Date,
    default: Date.now()
  },
  active: {
    type: Boolean,
    default: true
  }
});

//setting modifiedAt to current time after every update
transactionSchema.pre('save', setTransactionNumber);
transactionSchema.pre('save', modifiedAt);
transactionSchema.pre('findOneAndUpdate', function(next) {
  this._update.modifiedAt = new Date();
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
