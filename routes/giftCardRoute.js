
const { getGiftCardById, setGiftCardInactive, getAllGiftCards, createGiftCard, updateGiftCard } = require('../controllers/giftCardController');
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

// create giftcard
router.put('/edit/:id', auth, authRoles(roles.admin), upload.single('card_pic') , updateGiftCard)

// Delete giftcard, not permanently
router.put('/set-inactive/:id', auth, authRoles(roles.admin), setGiftCardInactive );

// Delete giftcard, not permanently
router.put('/delete/:id', auth, authRoles(roles.admin), setGiftCardInactive );

// Get giftcard 
router.get('/:id', getGiftCardById);

module.exports = router;