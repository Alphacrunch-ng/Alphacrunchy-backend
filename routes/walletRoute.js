
const { getWalletById, setUserWalletInactive, createWallet, getWallets } = require('../controllers/walletController');



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

// Get user By ID
router.get('/:id', getWalletById)

// Delete user By ID
router.put('/:id', setUserWalletInactive )


module.exports = router;