const mongoose = require('mongoose');

// Define the schema for the logs
const logSchema = new mongoose.Schema({
    method: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    status: {
        type: Number,
        required: true,
    },
    responseTime: {
        type: Number,
        required: true,
    },
    ip: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
        immutable: true, // Prevents modification after creation
        index: { expires: '7d' } // Automatically deletes the document after 7 days
    },
    additionalInfo: {
        type: mongoose.Schema.Types.Mixed, // To store any other info, can be an object
    },
}, { versionKey: false });


// Make the entire document immutable after creation
logSchema.pre('save', function (next) {
    if (!this.isNew) {
        // This document is not new, hence it is being updated
        return next(new Error('Logs are immutable and cannot be updated.'));
    }
    next();
});

// Prevent updates using Mongoose middleware
logSchema.pre('findOneAndUpdate', function(next) {
    return next(new Error('Logs are immutable and cannot be updated.'));
});

logSchema.pre('updateOne', function(next) {
    return next(new Error('Logs are immutable and cannot be updated.'));
});

logSchema.pre('updateMany', function(next) {
    return next(new Error('Logs are immutable and cannot be updated.'));
});

// Alternatively, for any other type of updates
logSchema.pre('update', function(next) {
    return next(new Error('Logs are immutable and cannot be updated.'));
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;