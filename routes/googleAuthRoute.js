const { googleLoginCallback, googleSignupCallback } = require('../controllers/googleAuthController');
const router = require('express').Router();

/**
 * @swagger
 * components:
 *  schemas: 
 */

/**
* @url = "/auth/google/callback" - Google callback URL
*/
router.post('/signup/callback', googleSignupCallback);  // For signup

router.post('/login/callback', googleLoginCallback); // For login

module.exports = router;