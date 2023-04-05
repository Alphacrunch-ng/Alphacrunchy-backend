
const { getGiftCardById, setGiftCardInactive, getAllGiftCards, createGiftCard, updateGiftCard, uploadGiftCard, deleteGiftCard, deleteUploadedGiftCard, createGiftCardTransaction, setTransactionGiftCardState, getGiftCardTransaction } = require('../controllers/giftCardController');
const { auth, authRoles } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { roles } = require('../utils/constants');

const router = require('express').Router();
/**
 * @swagger
 * /signup:
 *  post
 * components:
 *  schemas: 
 */

// Get giftcards, takes optional params of active, pagesize and page
router.get('/giftcards', getAllGiftCards);

// create giftcard
router.post('/create', auth, authRoles(roles.admin), upload.single('card_pic') , createGiftCard);

// create giftcard transaction
router.post('/start-transaction', auth, createGiftCardTransaction);

// approve individual uploaded cards of a transaction
router.patch('/transaction/cards-verification/:id', auth, authRoles(roles.admin), setTransactionGiftCardState);

// upload giftcard
router.post('/upload', auth, authRoles(roles.client,roles.admin, roles.staff), upload.single('card_pic'), uploadGiftCard);

// upload giftcard
router.delete('/delete-uploaded-giftcard', auth, authRoles(roles.client,roles.admin, roles.staff), deleteUploadedGiftCard);

// create giftcard
router.put('/edit/:id', auth, authRoles(roles.admin), upload.single('card_pic') , updateGiftCard);

// Delete giftcard, not permanently
router.patch('/set-inactive/:id', auth, authRoles(roles.admin), setGiftCardInactive );

// Delete giftcard, permanently!!!
router.delete('/delete/:id', auth, authRoles(roles.admin), deleteGiftCard );

// Get giftcard 
router.get('/:id', getGiftCardById);

// Get giftcard transaction
router.get('/transaction/:id', getGiftCardTransaction);

module.exports = router;