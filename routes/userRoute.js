const { signup, getUser } = require('../controllers/usersController');

const router = require('express').Router();

/**
 * @swagger
 * /signup:
 *  post
 * components:
 *  schemas: 
 */

// Create a new adminRoute
router.post('/signup', signup);

// Get all adminRoutes
router.get('/', (req, res)=>{
    res.send('welcome sir');
});


// Get adminRoute By Email
router.get('/getUserByEmail', getUser);

// // Get adminRoute By ID
// router.get('/:id', )

// // Update adminRoute By ID
// router.put('/:id', )

// // Delete adminRoute By ID
// router.delete('/:id', )

module.exports = router;