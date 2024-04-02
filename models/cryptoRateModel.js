const mongoose = require('mongoose');

const { Schema } = mongoose;

const cryptoRateSchema = new Schema({
    currency: { type: String, required: true },
    rate: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

const cryptoRate = mongoose.model('cryptoRate', cryptoRateSchema);
module.exports = cryptoRate;