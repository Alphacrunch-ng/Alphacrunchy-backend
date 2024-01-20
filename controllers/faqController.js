const FAQ = require("../models/faqModel");
const { serverError } = require("../utils/services.js");
const { roles } = require("../utils/constants");

exports.askFaqQuestion = async (req, res) => {
  const { fullName, email, question, category } = req.body;
  try {
    const data = new FAQ({ fullName, email, question, category });
    await data.save();
    res.status(201).json({ message: "Question created successfully", data });
  } catch (err) {
    console.error(err);
    return serverError(res, err);
  }
};
exports.answerFaqQuestion = async (req, res) => {
  const { id, answer } = req.body;
  try {
    const instance = await FAQ.findById({ _id: id });
    if (instance) {
      if (instance.answered === false) {
        const data = await FAQ.findByIdAndUpdate(
          { _id: instance._id },
          { $set: { answer, answered: !instance.answered } },
          { new: true }
        );
        if (data) {
          res.status(200).json({
            message: "Question answered successfully",
            data,
          });
        }
      } else if (instance.answered === true) {
        res.status(400).json({ message: "Question has already been answered" });
      }
    } else {
      res.status(400).json({ message: "No instance found" });
    }
  } catch (err) {
    console.error(err.message);
    return serverError(res, err);
  }
};
exports.getFaqQuestions = async (req, res) => {
  try {
    const data = await FAQ.find();
    if (data) {
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
    return serverError(res, err);
  }
};
exports.archiveFaqQuestion = async (req, res) => {
  const { id } = req.body; //or get id from params
  try {
    const data = await FAQ.findById({ _id: id });
    if (!data) {
      res.status(404).json({ message: "Question Not Found!" });
    }
    if (req.user.role === roles.admin) {
      const deletedQuestion = await FAQ.findByIdAndDelete({ _id: data._id });
      if (deletedQuestion) {
        res
          .status(200)
          .json({ message: "Question deleted successfully", deletedQuestion });
      } else {
        res.status(404).json({ message: "Error deleting question" });
      }
    } else if (req.user.role === roles.staff) {
      const archivedFaq = await FAQ.findByIdAndUpdate(
        { _id: data._id },
        { $set: { archived: !data.archived } },
        { new: true }
      );

      if (archivedFaq) {
        const message = archivedFaq.archived
          ? "Question archived successfully"
          : "Question removed from archive successfully";

        return res.status(200).json({ message, archivedFaq });
      } else {
        res.status(404).json({ message: "Error archiving question" });
      }
    }
  } catch (err) {
    console.error(err.message);
    return serverError(res, err);
  }
};
