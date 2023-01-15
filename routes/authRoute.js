const { registration, loggingIn, confirmUserEmail, requstResetPassword, resetPassword } = require('../controllers/authController');
const { getUserByEmail } = require('../controllers/usersController');

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

// Get user By email in query
router.get('/email', getUserByEmail)

module.exports = router;