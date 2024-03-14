const {
  getAssets,
  addAdminAsset,
  createUserCryptoAccount,
  getSubAccountsFromSource,
  getUserAssets,
  addUserAsset,
  getAssetBalance,
} = require("../controllers/cryptoController");
const { authRoles, auth } = require("../middlewares/auth");
const upload = require("../middlewares/multer");
const { roles } = require("../utils/constants");

const router = require("express").Router();

router.get("/get-assets", getAssets);
router.get("/get-accounts/source", getSubAccountsFromSource);
router.get("/user/get-assets/:user_id", auth, getUserAssets)
router.get("/get-asset-balance/:id", auth, getAssetBalance)


router.post(
  "/add-supported-asset",
  auth,
  authRoles(roles.admin),
  upload.single("icon"),
  addAdminAsset
);

router.post(
  "/add-asset",
  auth,
  addUserAsset
);

router.post(
  "/add-sub-account/:id",
  auth,
  createUserCryptoAccount
);

module.exports = router;
