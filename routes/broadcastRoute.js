const { auth, authRoles } = require("../middlewares/auth");
const { roles } = require("../utils/constants");
const router = require("express").Router();
const { editBroadcast, createNewBroadcast, archiveBroadcast, getUserBroadcasts, getAllActiveBroadcasts, getBroadcasts, deleteBroadcast, getAuthorBroadcasts } = require("../controllers/broadcastController");
/**
 * @swagger
 * components:
 *  schemas:
 */

// get broadcast
router.get("/all", auth, getBroadcasts);

// get broadcast
router.get("/author/:id", auth, authRoles(roles.admin), getAuthorBroadcasts);

// get broadcast
router.get("/user", auth, getUserBroadcasts);

// get broadcast
router.get("/active", auth, getAllActiveBroadcasts);

// create broadcast
router.post("/create", auth, authRoles(roles.admin), createNewBroadcast);

// edit broadcast
router.patch("/edit/:id", auth, authRoles(roles.admin), editBroadcast);

// archive broadcast
router.patch("/archive/:id", auth, authRoles(roles.admin, roles.staff), archiveBroadcast);

// get broadcast
router.delete("/:id", auth, authRoles(roles.admin), deleteBroadcast);


module.exports = router;
