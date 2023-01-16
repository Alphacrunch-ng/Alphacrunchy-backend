
const { getWalletById, setUserWalletInactive, createWallet } = require('../controllers/walletController');



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


// Get user By ID
router.post('/create', createWallet)

// Get user By ID
router.get('/:id', getWalletById)

// Delete user By ID
router.put('/:id', setUserWalletInactive )

module.exports = router;