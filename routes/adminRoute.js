const { deleteAllTransaction } = require('../controllers/transactionController');
const { deleteUser, updateUser, getUserById, setInActiveUser, setUserRole } = require('../controllers/usersController');

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
    res.send('welcome sir');
});


// Get user By ID
router.get('/user/:id', getUserById )

// Update adminRoute By ID
router.put('/update/:id', updateUser)

// Update adminRoute By ID
router.put('/setInactive/:id', setInActiveUser)

// Update adminRoute By ID
router.patch('/set-user-role/:id', setUserRole)

// Delete adminRoute By ID
router.delete('/user/delete/:id', deleteUser )

// delete-transactions
router.delete('/delete-transactions', deleteAllTransaction)

module.exports = router;