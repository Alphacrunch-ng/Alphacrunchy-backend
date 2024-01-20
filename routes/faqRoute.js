const { auth, authRoles } = require("../middlewares/auth");
const { roles } = require("../utils/constants");
const router = require("express").Router();
const {
  askFaqQuestion,
  answerFaqQuestion,
  getFaqQuestions,
  archiveFaqQuestion,
} = require("../controllers/faqController");
/**
 * @swagger
 * components:
 *  schemas:
 */

// create/ask question
router.post("/ask-question", askFaqQuestion);

// answer question
router.put("/answer-question", auth, authRoles(roles.admin), answerFaqQuestion);

// get questions
router.get("/questions", getFaqQuestions);

// archive questions
router.put(
  "/archive-question",
  auth,
  authRoles(roles.admin, roles.staff),
  archiveFaqQuestion
);

module.exports = router;
