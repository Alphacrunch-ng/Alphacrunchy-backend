const {
  // getAssets,
  addAdminAsset,
  createUserCryptoAccount,
  getSubAccountsFromSource,
  getUserAssets,
  addUserAsset,
  getAssetBalance,
  buyCrypto,
  getCryptoWallet,
  getSwapRate,
  getSupportedAssets,
  getSupportedAssetsFromSource,
} = require("../controllers/cryptoController");
const { authRoles, auth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const { roles } = require("../utils/constants");

const router = require("express").Router();

// router.get("/get-assets", getAssets);
router.get("/supported-assets", getSupportedAssets);
router.get("/source/supported-assets", auth, getSupportedAssetsFromSource);
router.get("/get-accounts/source", auth, getSubAccountsFromSource);
router.get("/user/get-account", auth, getCryptoWallet);
router.get("/user/get-assets/", auth, getUserAssets);
router.get("/get-asset-balance/:id", auth, getAssetBalance);
router.get("/swap/rate", auth, getSwapRate);



router.post("/add-supported-asset", auth, authRoles(roles.admin), upload.single("icon"), addAdminAsset);
router.post("/add-asset", auth, addUserAsset);
router.post("/add-sub-account/:id", auth, createUserCryptoAccount);

router.post("/buy-crypto", auth, buyCrypto);

module.exports = router;
