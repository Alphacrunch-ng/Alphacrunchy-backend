const mongoose = require('mongoose');
const { modifiedAt } = require('./hooks');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  }
},{
  timestamps: true
});

//setting modifiedAt to current time after every update
notificationSchema.pre('save', modifiedAt);
notificationSchema.pre('findOneAndUpdate', function(next) {
  this._update.modifiedAt = new Date();
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
