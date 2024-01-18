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
router.put("/answer-question", answerFaqQuestion);

// get questions
router.get("/questions", getFaqQuestions);

// archive questions
router.put("/archive-question", archiveFaqQuestion);

module.exports = router;
