// general user model

// importing mongoose
const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');
const {currencies} = require('../utils/currencies.json');
const { CardTypes } = require('../utils/constants');

const currencySchema = new mongoose.Schema({
    code: {
      type: String,
      enum: {
        values: currencies.map((currency)=> currency.code ),
        message: 'Currency code must be amongst the list of supported currencies',
      },
      required: true,
    },
    name: {
      type: String,
      enum: {
        values: currencies.map((currency) => currency.name),
        message: 'Currency name must be amongst the list of supported currencies',
      },
      required: true,
    },
    symbol: {
      type: String,
      enum: {
        values: currencies.map((currency) => currency.symbol),
        message: 'Currency symbol must be amongst the list of supported currencies',
      },
      required: true,
    },
  });

const giftCardRateSchema = new mongoose.Schema({
    giftCardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GiftCard',
        required: true,
    },
    rate : {
        type: Number,
        default: 0
    },
    currency: {
        type: currencySchema,
        required: true,
    },
    cardType: {
        type: String,
        enum: {
            values: Object.values(CardTypes),
            message: "currency must be amongst the list of supported card types",
        },
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
giftCardRateSchema.pre('save', modifiedAt);
giftCardRateSchema.pre('findOneAndUpdate', function(next) {
    this._update.modifiedAt = new Date();
    next();
  });

const GiftCardRate = mongoose.model('GiftCardRate', giftCardRateSchema);

module.exports = GiftCardRate;