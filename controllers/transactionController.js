const Transaction = require('../models/transactionModel');
const User = require('../models/userModel.js');
const { serverError } = require('../utils/services');
const { Status } = require('../utils/constants');
const { transactionMailer } = require('../utils/nodeMailer');

// GET all notifications for a specific user
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.params.id;
    const transactions = await Transaction.find({ user_id: userId })
                                            .sort({ createdAt: -1 });
    return res.status(200).json({
        data: transactions,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};


exports.setTransactionStatus = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const { status } = req.body;
    
    if (!Object.values(Status).includes(status.toLocaleLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "invalid status: " + status
      })
    }
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "no id provided"
      })
    }
    const transaction = await Transaction.findByIdAndUpdate(transactionId, {status : status.toLocaleLowerCase()}, {new: true});
    return res.status(200).json({
        data: transaction,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.setTransactionInactive = async (req, res) => {
  try {
    const transactionId = req.params.id;
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "no notification_id provided"
      })
    }
    const transaction = await Transaction.findByIdAndUpdate(transactionId, {active : false}, {new: true});
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "transaction not found"
      })
    }
    return res.status(200).json({
        data: transaction,
        success: true,
        message: `Successfull`
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// // CREATE a new notification controller
// exports.createUserNotification = async (req, res) => {
//   try {
//     const { user, message } = req.body;
//     const savedNotification = await createNotification( user, message);
//     return res.status(201).json({
//         data: savedNotification,
//         status: 'success',
//         message: 'notification successfully created.'
//     })
//   } catch (error) {
//     return serverError(res, error);
//   }
// };

// DELETE a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const Id = req.params.id;
    await Transaction.findByIdAndDelete(Id);
    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    return serverError(res, error);
  }
};


//Services 
//create notification service
exports.createTransaction = async (user_id, description, amount , operation)=> {
    try {
        const checkUser = await User.findOne({ _id: user_id}).select("-password");
        if (!checkUser) {
          throw new Error("user_id not found");
      }
        transactionMailer(checkUser.email, operation, amount, description)
        const newTransaction = new Transaction({ user_id, description, amount });
        const saveTransaction = await newTransaction.save();
        return saveTransaction;
    } catch (error) {
        throw error;
    }
}