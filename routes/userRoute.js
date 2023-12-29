const { setInActiveUser, getUserById, updateUser, getUsers, getUserByEmail, deleteUserProfilePicture, kycCallBack } = require('../controllers/usersController');
const upload = require('../middlewares/multer');



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
router.get('/users', getUsers)

// Get user By ID
router.get('/email', getUserByEmail)

// Get user By ID
router.get('/:id', getUserById)

// KYC callback
router.post('/kyc/callback', kycCallBack);

// Update user By ID
router.put('/:id', upload.single('profile_pic') , updateUser)

// Update user By ID Delete Profile Picture
router.delete('/picture/:id', deleteUserProfilePicture)

// Delete user By ID
router.put('/:id', setInActiveUser )

module.exports = router;