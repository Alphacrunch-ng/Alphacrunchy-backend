
const { getUserTransactions, setTransactionStatus, deleteTransaction, setTransactionInactive, completePayment } = require('../controllers/transactionController');
const { authRoles, auth } = require('../middlewares/auth');
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
    res.send('welcome to notifications sir');
});

// get all transactions for a user by passing the user id in params
router.get('/transactions/:id', auth, getUserTransactions);

// Set user transaction status
router.patch('/:id', auth, setTransactionStatus)

// complete paymenet
router.post('/complete-payment', completePayment)

//Permanently delete a transaction by id 
router.delete('/delete/:id', auth, authRoles(roles.admin), deleteTransaction )

//set transaction inactive aka deleted
router.patch('/set-inactive/:id', auth, setTransactionInactive)


module.exports = router;