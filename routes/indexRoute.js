const router = require("express").Router();
const adminRoute = require("./adminRoute");
const imageRoute = require("./imageRoute");
const userRoute = require("./userRoute");
const authRoute = require("./authRoute");
const notificationRoute = require("./notificationRoute");
const transactionRoute = require("./transactionRoute");
const messageRoute = require("./messageRoute");
const giftCardRoute = require("./giftCardRoute");
const walletRoute = require("./walletRoute");
const cryptoRoute = require("./cryptoRoute");
const faqRoute = require("./faqRoute");
const broadcastRoute = require("./broadcastRoute")
const logRoute = require("./logRoute")
const { auth, authRoles } = require("../middlewares/auth");
const { roles } = require("../utils/constants");
const { changeAllUserId } = require("../controllers/messagesController");

/**
 * @swagger
 * components:
 *  schemas:
 */

router.get("/", (req, res) => {
  console.log(req.ip)
  res.send("<h1>Alphacrunch Finance</h1>");
});

// router.post("/work/:id", changeAllUserId);

//admin routes
router.use("/auth", authRoute);

//giftcard routes
router.use("/giftcard", giftCardRoute);

//transaction routes
router.use("/transaction", transactionRoute);

//admin routes
router.use("/back-door", auth, authRoles(roles.admin), adminRoute);

//user routes
router.use("/user", auth, authRoles(roles.admin, roles.client, roles.staff), userRoute);

//admin routes
router.use("/wallet", auth, authRoles(roles.admin, roles.client, roles.staff), walletRoute);

router.use("/image", imageRoute);

router.use("/message", auth, messageRoute);

router.use("/notification", auth, notificationRoute);

router.use("/faq", faqRoute);

router.use("/broadcast", broadcastRoute);

router.use("/crypto", cryptoRoute);

router.use("/logs", logRoute)

module.exports = router;
