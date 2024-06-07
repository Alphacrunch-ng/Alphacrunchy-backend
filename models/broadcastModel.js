// Importing mongoose
const mongoose = require('mongoose');
const { broadcastAudiences, broadcastTypes, broadcastPriorities, broadcastStatus } = require('../utils/constants');

// Define the broadcast schema
const broadcastSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters long']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [10, 'Message must be at least 10 characters long']
    },
    type: {
        type: String,
        enum: Object.values(broadcastTypes),
        default: broadcastTypes.info,
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    scheduledTime: {
        type: Date,
        default: new Date(),
        validate: {
            validator: function(value) {
                return value >= new Date();
            },
            message: 'Scheduled time cannot be in the past'
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    priority: {
        type: String,
        enum: Object.values(broadcastPriorities),
        default: broadcastPriorities.medium
    },
    expiration: {
        type: Date,
        validate: {
            validator: function(value) {
                // Only validate if expiration date is provided
                if (value) {
                    return value > this.scheduledTime;
                }
                return true;
            },
            message: 'Expiration date must be after the scheduled time'
        }
    },
    audience: {
        type: String,
        enum: Object.values(broadcastAudiences),
        default: broadcastAudiences.all
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        validate: {
            validator: function(value) {
                // targetUser must be provided if audience is 'specific'
                if (this.audience === broadcastAudiences.specific) {
                    return value !== null;
                }
                return true;
            },
            message: 'Target user must be specified if audience is specific'
        }
    },
    status: {
        type: String,
        enum: Object.values(broadcastStatus),
        default: broadcastStatus.drafted
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt fields
});

// Create a model from the schema
const Broadcast = mongoose.model('Broadcast', broadcastSchema);

// Export the model
module.exports = Broadcast;
