const router = require('express').Router();
const adminRoute = require('./adminRoute');

/**
 * @swagger
 * components:
 *  schemas: 
 */

router.get('/', (req, res) => {
    res.send("<h1>Alphacrunch Finance</h1>");
});

//admin routes
router.use('/back-door', adminRoute);

module.exports = router;