const Chat = require('../models/chatModel.js');
const mongoose = require('mongoose');
const Message = require('../models/messageModel.js');
const Notification = require('../models/notificationModel');
const { getIo } = require('../utils/socket.js');
const { serverError } = require('../utils/services');
const { CustomEvents, roles } = require('../utils/constants.js');


const createChat = async (id) => {
  try {
    // Check if the chat already exists
        const chatExists = await Chat.findOne({
          client: id,
          active: true,
        });

        if (chatExists) {
          return chatExists;
        }
        else {
          const chat = await Chat.create({ client: id });
          return chat;
        }
      
  } catch (error) {
    throw error;
  }
}

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

// GET all chats for a specific user
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
      const messages = await Message.find({chatId : chatId, active: true})
                              .populate('sender',"id fullName email phoneNumber profilePicture_url")
                              .populate('attachments')
                              .sort({ timestamp: 1 });
      return res.status(200).json({
          data: messages,
          success: true,
          message: `Successfull`
      });
    } catch (error) {
      return serverError(res, error);
    }
  };

// CREATE a new chat controller
exports.sendMessage = async (req, res) => {
    try {
        const { client, message, sender, attachments } = req.body;

        let chat = await createChat(client);
        // let chat = { client, message, sender, recipient, attachments } 
    
        //Create new message with the chat ID
        const newMessage = await Message.create({
          chatId: chat._id,
          message,
          sender,
          recipient: req.body.recipient? req.body.recipient: client ,
          attachments,
        });

        await newMessage.save();
        return res.status(201).json({
          status: 'success',
          message: 'Message sent successfully!',
          data: {
            chat,
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
      const chatId = req.params.id;
      await Chat.findByIdAndUpdate({chatId},{active: false}, {new: true});
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
    return res.status(200).json({ message: 'Chat deleted' });
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