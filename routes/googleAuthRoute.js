const { googleAuth, googleLoginCallback, googleSignupCallback } = require('../controllers/googleAuthController');
const router = require('express').Router();

/**
 * @swagger
 * components:
 *  schemas: 
 */

/**
* @url = "/auth/google/callback" - Google callback URL
*/
router.get('/signup/callback', googleSignupCallback);  // For signup

router.get('/login/callback', googleLoginCallback); // For login

module.exports = router;