const { getChatMessages, sendMessage, setChatInactive, deleteChat, getChats, getChat, getChatById } = require('../controllers/messagesController');
const upload = require('../middlewares/multer');



const router = require('express').Router();

/**
 * @swagger
 * /signup:
 *  post
 * components:
 *  schemas: 
 */


// Get user By ID
router.get('/user-chat-messages/:id', getChatMessages)

// Get user By ID
router.get('/chats', getChats);

// Get user By ID
router.get('/user-chat/:userId', getChatById)

// Get user By ID
router.get('/chat/:id', getChat)

// Get user By ID
router.post('/send-message', sendMessage)

// Update user By ID
router.put('/set-chat-inactived/:id', setChatInactive)

// Delete user By ID
router.delete('/:id', deleteChat )

module.exports = router;