const { registration, loggingIn, confirmUserEmail, requstResetPassword, resetPassword, resetPin, changePassword } = require('../controllers/authController');
const { getUserByEmail } = require('../controllers/usersController');
const { createWallet } = require('../controllers/walletController');
const {auth } = require('../middlewares/auth');

const router = require('express').Router();
/**
 * @swagger
 * components:
 *  schemas: 
 */

// register a user
router.post('/signup', registration);

// login a user
router.post('/login', loggingIn);

// confirm user email
router.post('/confirm-email', confirmUserEmail)

// request reset password for user using email
router.post('/request-password-change', requstResetPassword)

// reset a user's password.
router.post('/reset-password', resetPassword)

// reset a user's wallet pin.
router.post('/reset-pin', resetPin)

// Get user By email in query
router.get('/email', getUserByEmail)

//change user password
router.post('/change-password', auth, changePassword)

// Create user wallet
router.post('/wallet/create', createWallet)

module.exports = router;