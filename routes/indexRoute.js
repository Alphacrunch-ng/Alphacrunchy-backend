const router = require('express').Router();
const adminRoute = require('./adminRoute');
const userRoute = require('./userRoute');
const authRoute = require('./authRoute');
const {auth, authRoles } = require('../middlewares/auth');
const { roles } = require('../utils/constants');

/**
 * @swagger
 * components:
 *  schemas: 
 */

router.get('/', (req, res) => {
    res.send("<h1>Alphacrunch Finance</h1>");
});

//admin routes
router.use('/auth', authRoute);

//admin routes
router.use('/back-door', auth, authRoles(roles.admin), adminRoute);

//user routes
router.use('/user', auth, authRoles(roles.admin, roles.client, roles.staff) , userRoute)

module.exports = router;