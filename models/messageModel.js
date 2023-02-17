
// importing mongoose
const mongoose = require('mongoose');



const messageSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    message: {
        type: String,
        required: ['true','message is required.']
    },
    timestamp: {
        type: Date, 
        default: Date.now 
    },
    active : {
        type: Boolean,
        default: true
    },
  });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;