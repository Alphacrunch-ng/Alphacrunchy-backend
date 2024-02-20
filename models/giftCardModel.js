// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');

const giftCardSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    picture_url : {
        type: String
    },
    picture_cloudId: {
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
giftCardSchema.pre('save', modifiedAt);
giftCardSchema.pre('findOneAndUpdate', function(next) {
    this._update.modifiedAt = new Date();
    next();
  });

const GiftCard = mongoose.model('GiftCard', giftCardSchema);

module.exports = GiftCard;