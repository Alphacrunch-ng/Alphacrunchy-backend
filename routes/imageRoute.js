
const { uploadImage, deleteUploadedImage } = require('../controllers/imageController');
const { auth, authRoles } = require('../middlewares/auth');
const upload = require('../middlewares/multer');
const { roles } = require('../utils/constants');

const router = require('express').Router();
/**
 * @swagger
 * /signup:
 *  post
 * components:
 *  schemas: 
 */



// upload image to cloud
router.post('/upload', auth, authRoles(roles.client,roles.admin, roles.staff), upload.single('image'), uploadImage);

// Delete image from cloud, permanently!!!
router.delete('/delete', auth, deleteUploadedImage );


module.exports = router;