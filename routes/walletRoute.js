
const { getWalletById, setUserWalletInactive, createWallet, getWallets, creditWallet, debitWallet, wallet2WalletTransfer } = require('../controllers/walletController');



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

router.get('/wallets', getWallets);

// Get user wallet By ID
router.get('/:id', getWalletById)

//credit a user wallet
router.post('/credit', creditWallet)

//debit a user wallet 
router.post('/debit', debitWallet)

//wallet to wallet transfer 
router.post('/transfer', wallet2WalletTransfer)

// Delete user wallet temporarily By ID
router.put('/:id', setUserWalletInactive )


module.exports = router;