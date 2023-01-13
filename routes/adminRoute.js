const { signup, getUser, deleteUser, updateUser, getUserById, setInActiveUser } = require('../controllers/usersController');

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

// Delete adminRoute By ID
router.delete('/user/delete/:id', deleteUser )

module.exports = router;