const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Chat = require('../models/chatModel.js');
const Message = require('../models/messageModel.js');
const { serverError } = require('../utils/services');
const { getCacheData, setCacheData } = require('../utils/cache.js');
const { createChat, checkChat } = require('../models/repositories/messageChatRepo.js');
const { checkTransactionHelper } = require('../models/repositories/transactionRepo.js');
const { transactionTypes, roles } = require('../utils/constants.js');

// GET all chats for a specific user
exports.getChatById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const chat = await Chat.findOne({client : userId})
                            .populate('client',"id fullName email phoneNumber profilePicture_url");
    if(!chat){
      return res.status(404).json({
        success: false,
        message: `not found`
    });
    }
    return res.status(200).json({
        data: chat,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// GET chat for a specific user
exports.getChat = async (req, res) => {
  try {
    const chatId = req.params.id;
        // convert chatId to a valid ObjectId
    const ObjectId = mongoose.Types.ObjectId;
    const objChatId = ObjectId(chatId);
    const chat = await Chat.findOne({_id : chatId})
                            .populate('client',"id fullName email phoneNumber profilePicture_url");
    if(!chat){
      return res.status(404).json({
        success: false,
        message: `not found`
    });
    }
    return res.status(200).json({
        data: chat,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.getChatByTransactionNumber = async (req, res) => {
  const { transaction_number } = req.params;
  const cacheKey = "chat" + transaction_number;
  try {
    // Check if the result is already cached
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
     
    const chat = await Chat.findOne({ transaction_number })
                            // .populate('client',"id fullName email phoneNumber profilePicture_url");
    if(!chat){
      return res.status(404).json({
        success: false,
        message: `not found`
    });
    }
    setCacheData(cacheKey, chat, 60 * 5 * 1000);
    return res.status(200).json({
        data: chat,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// GET all chats for a specific user
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({})
                            .populate('client',"id fullName email phoneNumber profilePicture_url")
                            .sort({ createdAt: -1 });
    return res.status(200).json({
        data: chats,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.getChatMessages = async (req, res) => {
    try {
      const chatId = req.params.id;
      // convert chatId to a valid ObjectId
      const ObjectId = mongoose.Types.ObjectId;
      const objChatId = ObjectId(chatId);
      const messages = await Message.find({chatId : chatId, active: true})
                              .populate('sender',"id fullName email phoneNumber profilePicture_url")
                              .populate('attachments')
                              .sort({ timestamp: 1 });
      return res.status(200).json({
          data: messages,
          total: messages.length,
          success: true,
          message: `Successfull`
      });
    } catch (error) {
      return serverError(res, error);
    }
  };

// CREATE a new chat controller
exports.startChat = async (req, res) => {
  const { client, transaction_number } = req.body;
  try {
      const checkTransaction = await checkTransactionHelper(transaction_number);
      if (!checkTransaction){
        return res.status(404).json({
          success: false,
          message: 'transaction not found'
        });
      }
      if (checkTransaction.transaction_type !== transactionTypes.giftcard){
        return res.status(404).json({
          success: false,
          message: 'invalid transaction type'
        });
      }
      if (!checkTransaction.user_id.equals(req.user.id)) {
        return res.status(401).json({
          success: false,
          message: 'invalid action'
        });
      }

      let chat = await createChat(client, transaction_number);
  
      return res.status(201).json({
        success: true,
        message: 'chat started',
        data: chat
      });
  }
  catch (error) {
  return serverError(res, error);
}
};

exports.sendMessage = async (req, res) => {
    try {
        const { client, message, sender, attachments, chat_id } = req.body;
        const checkChatId = await checkChat({chat_id});
        if (!checkChatId) {
          return res.status(404).json({
            success: false,
            message: 'Chat not found'
          });
        }

        if(!checkChatId.active){
          return res.status(404).json({
            success: false,
            message: 'Chat not found'
          });
        }
    
        //Create new message with the chat ID
        const newMessage = await Message.create({
          chatId: chat_id,
          message,
          sender,
          recipient: req.body.recipient? req.body.recipient: client ,
          attachments,
        });

        await newMessage.save();
        return res.status(201).json({
          success: true,
          message: 'Message sent successfully!',
          data: {
            chat : checkChatId,
            message: newMessage,
          },
        });
    }
    catch (error) {
    return serverError(res, error);
  }
};

// DELETE a chat
exports.setChatInactive = async (req, res) => {
    try {
      const id = req.params.id;
      const chatId = ObjectId(id)
      await Chat.findByIdAndUpdate(chatId,{active: false}, {new: true});
      return res.status(200).json({ message: 'Chat deleted' });
    } 
    catch (error) {
      return serverError(res, error);
    }
  };

// Permanently DELETE a chat
exports.deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    await Chat.findByIdAndDelete(chatId);
    const messages = await Message.deleteMany({chat: chatId});
    return res.status(200).json({ 
      success: true, 
      message: 'Chat deleted',
      messages
    });
  } 
  catch (error) {
    return serverError(res, error);
  }
};

// exports.changeAllUserId = async (req, res) => {
//   const old_id = req.params.id;
//   const {new_user_id} = req.body;
//   try {
//       // const wallets = await Chat.updateMany({ user_id: old_id }, {user_id: new_user_id}, {new: true});
//       const messages2 = await Message.updateMany({ recipient: mongoose.Types.ObjectId(old_id) }, {recipient: new_user_id}, {new: true});
//       return res.status(200).json({
//           data: messages2,
//           success: true
//       });
//   } catch (error) {
//       return serverError(res, error);
//   }
// }