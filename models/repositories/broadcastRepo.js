// Importing mongoose and the Broadcast model
const mongoose = require('mongoose');
const Broadcast = require('../broadcastModel'); // Adjust the path as necessary
const { broadcastAudiences } = require('../../utils/constants');
const ObjectId = mongoose.Types.ObjectId;

// Create a new broadcast
exports.createBroadcast = async ({ title, message, type, active, scheduledTime, authorId, priority, expiration, audience, targetUser, status }) => {
    try {
        const broadcast = await Broadcast.create({ title, message, type, active, scheduledTime, author: ObjectId(authorId), priority, expiration, audience, targetUser, status });
        return broadcast;
    } catch (error) {
        throw error;
    }
};

// Get all broadcasts
exports.getAllBroadcasts = async () => {
    try {
        const broadcasts = await Broadcast.find({
            audience: broadcastAudiences.all
        });
        return broadcasts;
    } catch (error) {
        throw error;
    }
};

// Get a broadcast by ID
exports.getBroadcastById = async ({ id }) => {
    try {
        const broadcast = await Broadcast.findById(id);
        if (!broadcast) {
            throw new Error('Broadcast not found');
        }
        return broadcast;
    } catch (error) {
        throw error;
    }
};

// Update a broadcast by ID
exports.updateBroadcastById = async ({id, title, message, type, active, scheduledTime, authorId, priority, expiration, audience, targetUser, status }) => {
    try {
        const broadcast = await Broadcast.updateOne(
            { _id: id },
            {
              $set: {
                title,
                message,
                type,
                active,
                scheduledTime,
                author: authorId ? ObjectId(authorId) : undefined,
                priority,
                expiration,
                audience,
                targetUser,
                status
              },
            },
            {
              new: true,
              omitUndefined: true,
            }
          );
        if (!broadcast) {
            throw new Error('Broadcast not found');
        }
        return broadcast;
    } catch (error) {
        throw error;
    }
};

// Delete a broadcast by ID
exports.deleteBroadcastById = async ({ id }) => {
    try {
        const broadcast = await Broadcast.findByIdAndDelete(id);
        if (!broadcast) {
            throw new Error('Broadcast not found');
        }
        return broadcast;
    } catch (error) {
        throw error;
    }
};

// Get active broadcasts
exports.getActiveBroadcasts = async () => {
    try {
        const broadcasts = await Broadcast.find({ active: true, audience: broadcastAudiences.all });
        return broadcasts;
    } catch (error) {
        throw error;
    }
};

// Get broadcasts by author
exports.getBroadcastsByAuthor = async ({ authorId }) => {
    try {
        const broadcasts = await Broadcast.find({ author: authorId });
        return broadcasts;
    } catch (error) {
        throw error;
    }
};

// Get broadcasts for a specific user
exports.getBroadcastsForUser = async ({ userId }) => {
    try {
        const broadcasts = await Broadcast.find({
            $or: [
                { audience: 'all' },
                { audience: 'specific', targetUser: userId }
            ]
        });
        return broadcasts;
    } catch (error) {
        throw error;
    }
};
