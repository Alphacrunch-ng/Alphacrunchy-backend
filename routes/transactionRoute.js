
const { getUserTransactions, setTransactionStatus, deleteTransaction, setTransactionInactive, getTransactions, getTransactionById, getTransactionsByDay } = require('../controllers/transactionController');
const { completePayment } = require('../controllers/walletController');
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
router.get('/transactions', auth, getTransactions);

// get all transactions for a user by passing the user id in params
router.get('/transactions-by-date', auth, getTransactionsByDay);

// get all transactions for a user by passing the user id in params
router.get('/transactions/:id', auth, getUserTransactions);

// get a transaction 
router.get('/:id', auth, getTransactionById);

// Set user transaction status
router.patch('/:id', auth, setTransactionStatus);

// complete paymenet
router.post('/deposit', completePayment);

//Permanently delete a transaction by id 
router.delete('/delete/:id', auth, authRoles(roles.admin), deleteTransaction );

//set transaction inactive aka deleted
router.patch('/set-inactive/:id', auth, setTransactionInactive);


module.exports = router;