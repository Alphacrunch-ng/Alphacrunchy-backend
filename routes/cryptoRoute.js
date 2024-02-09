const { getAccounts, getAssets } = require("../controllers/cryptoController");

const router = require("express").Router();

router.get("/get-assets", getAssets);

module.exports = router;
