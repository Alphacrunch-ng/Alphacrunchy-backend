
const { getUserTransactions, setTransactionStatus, deleteTransaction, setTransactionInactive } = require('../controllers/transactionController');
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
    res.send('welcome to notifications sir');
});

// get all transactions for a user by passing the user id in params
router.get('/transactions/:id', getUserTransactions);

// Set user transaction status
router.patch('/:id', setTransactionStatus)

//Permanently delete a transaction by id 
router.delete('/delete/:id', authRoles(roles.admin), deleteTransaction )

//set transaction inactive aka deleted
router.patch('/set-inactive/:id', setTransactionInactive)


module.exports = router;