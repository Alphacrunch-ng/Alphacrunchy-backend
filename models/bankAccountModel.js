// general user model

// importing mongoose
const mongoose = require('mongoose');
const { isEmail } = require('validator');
const { modifiedAt } = require('./hooks');


const bankSchema = new mongoose.Schema({
    account_name : {
        type: String,
        required: ['true', 'account_name is required.']
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    email : {
        type: String,
        required: ['true', 'email is required.'],
        validate: [isEmail, 'please input a valid email']
    },
    account_number: {
        type: String,
        required: ['true', 'account_number is required.']
    },
    card_bin_short: {
        type: String,
        required: true
    },
    card_bin_full: {
        type: String,
        required: true
    },
    bank_id : {
        type: Number
    },
    bank_code: {
        type: String,
    },
    bank_name: {
        type: String,
    },
    phoneNumber : {
        type: String,
        required: ['true', 'phone number is required.']
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
bankSchema.pre('save', modifiedAt);
bankSchema.pre('findOneAndUpdate', function(next) {
    this._update.modifiedAt = new Date();
    next();
  });

const Bank = mongoose.model('Account', bankSchema);

module.exports = Account;