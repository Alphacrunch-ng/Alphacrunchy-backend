const mongoose = require('mongoose');
const Chat = require('../chatModel.js');
const Message = require('../messageModel.js');

exports.createChat = async (id, transaction_number) => {
    try {
        const chat = await Chat.create({ client: id, transaction_number });
        return chat;
        
    } catch (error) {
      throw error;
    }
}

// check for a chat using id or transaction number
exports.checkChat = async ({chat_id, transaction_number}) => {
  try {
    const ObjectId = mongoose.Types.ObjectId;
    const objChatId = ObjectId(chat_id);

    const query = chat_id ? { _id: objChatId } : { transaction_number };
    const chat = await Chat.findOne(query);
    return chat;
  } catch (error) {
    throw error;
  }
}