const { getChatMessages, sendMessage, setChatInactive, deleteChat, getChats, getChat, getChatById, startChat, getChatByTransactionNumber } = require('../controllers/messagesController');
const { authRoles } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { roles } = require('../utils/constants');



const router = require('express').Router();


// Get chat messages By chat ID
router.get('/user-chat-messages/:id', getChatMessages)

// Get all chats
router.get('/chats', getChats);

// Get chat By user ID
router.get('/user-chat/:userId', getChatById)

// Get chat By ID
router.get('/chat/:id', getChat)

// Get chat By transaction number
router.get('/giftcard/chat/:transaction_number', getChatByTransactionNumber)

// send message
router.post('/send-message', sendMessage)

// send message
router.post('/start-chat', startChat)

// temporarily delete a chat By ID
router.put('/end-chat/:id', setChatInactive)

// permanently Delete chat By ID
router.delete('/:id', authRoles(roles.staff, roles.admin), deleteChat )

module.exports = router;