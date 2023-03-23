
// importing mongoose
const mongoose = require('mongoose');
const { populateUserId, modifiedAt } = require('./hooks');



const chatSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    active : {
        type: Boolean,
        default: true
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    },
  });


//setting modifiedAt to current time after every update
chatSchema.pre('save', modifiedAt);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;