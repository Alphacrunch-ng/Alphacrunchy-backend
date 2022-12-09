const router = require('express').Router();

/**
 * @swagger
 * components:
 *  schemas: 
 */

router.get('/', (req, res) => {
    res.send("<h1>Alphacrunch Finance</h1>");
});

module.exports = router;