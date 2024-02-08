const { getAccounts, getAssets } = require("../controllers/cryptoController");

const router = require("express").Router();

router.get("/get-accounts", getAccounts);
router.get("/get-assets", getAssets);

module.exports = router;
