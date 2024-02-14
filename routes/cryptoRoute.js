const { getAccounts, getAssets, addAdminAsset } = require("../controllers/cryptoController");
const { authRoles, auth } = require("../middlewares/auth");
const upload = require('../middlewares/multer');
const { roles } = require("../utils/constants");

const router = require("express").Router();

router.get("/get-assets", getAssets);

router.post('/add-supported-asset', auth, authRoles(roles.admin), upload.single('icon'), addAdminAsset);

module.exports = router;
