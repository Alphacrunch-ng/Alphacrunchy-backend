const router = require("express").Router();
/**
 * @swagger
 * components:
 *  schemas:
 */

// create/ask question
router.post("/ask-question", askFaqQuestion);

// answer question
router.post("/answer-question", answerFaqQuestion);

// get questions
router.get("/questions", getFaqQuestions);

// archive questions
router.put("/archive-question", archiveFaqQuestion);

module.exports = router;
