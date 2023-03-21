// importing mongoose
const mongoose = require('mongoose');
const { populateUserId } = require('./hooks');

const attachmentSchema = new mongoose.Schema({
  file_name : {
    type: String 
  },
  file_type : {
    type: String,
  },
  url : {
    type: String // picture cloud_url
  },
});

const messageSchema = new mongoose.Schema({
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    recipient: {
        type: String,
        required: true
      },
    message: {
        type: String,
        required: ['true','message is required.']
    },
    attachments: {
        type: [attachmentSchema]
    },
    timestamp: {
        type: Date, 
        default: Date.now()
    },
    active : {
        type: Boolean,
        default: true
    },
  });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;