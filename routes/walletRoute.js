
const { changeWalletPin } = require('../controllers/authController');
const { getWalletById, setUserWalletInactive, createWallet, getWallets, creditWallet, debitWallet, wallet2WalletTransfer, checkWalletPin, getSupportedBanks, checkBankAccount, paymentToBank } = require('../controllers/walletController');
const { authRoles } = require('../middlewares/auth');
const { roles } = require('../utils/constants');



const router = require('express').Router();

/**
 * @swagger
 * /signup:
 *  post
 * components:
 *  schemas: 
 */


// Get all adminRoutes
router.get('/', (req, res)=>{
    res.send('welcome to wallet sir');
});

// Get supported banks
router.get('/banks', getSupportedBanks);

// check user bank to resolve name
router.post('/check-bank', checkBankAccount);

// get user wallets by user id
router.get('/wallets/:id', getWallets);

// Get user wallet By wallet ID
router.get('/:id', getWalletById);


//credit a user wallet
router.post('/credit', authRoles(roles.admin, roles.staff), creditWallet)

//debit a user wallet 
router.post('/debit', authRoles(roles.admin, roles.staff), debitWallet)

router.post('/pay-to-bank', paymentToBank)

//debit a user wallet 
router.post('/check-pin', checkWalletPin)

//wallet to wallet transfer 
router.post('/transfer', wallet2WalletTransfer)

// change user wallet pin
router.put('/change-pin', changeWalletPin )

// Delete user wallet temporarily By ID
router.put('/:id', setUserWalletInactive )



module.exports = router;