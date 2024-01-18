const FAQ = require("../models/faqModel");
const { getCacheData, setCacheData } = require("../utils/cache");

exports.askFaqQuestion = async (req, res) => {
  const { fullName, email, question } = req.body;
  try {
    const data = new FAQ({ fullName, email, question });
    await data.save();
    res.status(201).json({ message: "Question created successfully", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating question" });
  }
};
exports.answerFaqQuestion = async (req, res) => {
  const { id, answer } = req.body;
  try {
    const data = await FAQ.findByIdAndUpdate(
      { _id: id },
      { $set: { answer, status: true } },
      { new: true }
    );
    if (data) {
      res.status(200).json({
        message: "Question answered successfully",
        data,
      });
    } else {
      res.status(404).json({ message: "Question not found" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error answering question" });
  }
};
exports.getFaqQuestions = async (req, res) => {
  const cacheKey = "faqquestions";
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const data = await FAQ.find();
    if (data) {
      setCacheData(cacheKey, data, 60 * 5 * 1000);
      res.status(200).json({
        data,
      });
    } else {
      res
        .status(404)
        .json({ message: "No Questions for now, check back later!" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: err.message });
  }
};
exports.archiveFaqQuestion = async (req, res) => {};
