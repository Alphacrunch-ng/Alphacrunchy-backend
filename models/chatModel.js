
// importing mongoose
const mongoose = require('mongoose');
const { populateUserId, modifiedAt } = require('./hooks');



const chatSchema = new mongoose.Schema({
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transaction_number: {
        type: String,
        index: true
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
chatSchema.pre('findOneAndUpdate', function(next) {
  this._update.modifiedAt = new Date();
  next();
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;