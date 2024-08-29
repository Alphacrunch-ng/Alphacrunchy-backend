const { auth, authRoles } = require('../middlewares/auth');
const { roles } = require('../utils/constants');
const { getLogs, deleteAllLogs } = require('../controllers/logController');

const router = require('express').Router();

router.get('/', auth, authRoles(roles.admin), getLogs);

// Delete image from cloud, permanently!!!
router.delete('/delete', auth, authRoles(roles.admin), deleteAllLogs );


module.exports = router;