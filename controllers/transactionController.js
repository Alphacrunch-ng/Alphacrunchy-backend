const Transaction = require('../models/transactionModel');
const User = require('../models/userModel.js');
const WalletTransaction = require('../models/walletTransactionModel');
const GiftCardTransaction = require('../models/giftcardTransactionModel');
const CryptoTransaction = require('../models/cryptoTransactionModel');
const { serverError } = require('../utils/services');
const { Status, transactionTypes } = require('../utils/constants');
const { transactionMailer } = require('../utils/nodeMailer');
const { getPaymentLink } = require('../utils/paymentService');

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

exports.generatePaymentLink = async (req, res) => {
  // Extract necessary data from req.body or any other source
  const {
    wallet_number,
    amount,
    phoneNumber,
    email,
    fullName,
  } = req.body;

  try {
    // Call the getPaymentLink function with the required parameters
    const response = await getPaymentLink( wallet_number, amount, phoneNumber, email, fullName);

    const data = response.data;

    if (data.status === 'success' && data.url) {
      // Send the payment URL back to the client
      return res.status(200).json({ 
        success: true, 
        url: data.url 
      });
    } else {
      return serverError(res, error);
    }
  } catch (error) {
    return serverError(res, error);
  }
};
exports.getTransactionByTransactionNumber = async (req, res) => {
  const { transaction_number } = req.params;
  let transaction = {}
  try {
      const check = await Transaction.findOne({transaction_number});

      if (!check) {
        return res.status(404).json({
          success: false,
          message: 'transaction not found',
        });
      }
      transaction = {...check.toObject()};

      if (check.transaction_type === transactionTypes.wallet) {
        const transaction_details = await WalletTransaction.findOne({transaction_number : check.transaction_number});
        transaction.transaction_details = transaction_details;

      } else if (check.transaction_type === transactionTypes.giftcard) {
        const transaction_details = await GiftCardTransaction.findOne({transaction_number : check.transaction_number});
        transaction.transaction_details = transaction_details;
      }

      return res.status(200).json({
        data: transaction,
        success: true,
        message: 'Successfully retrieved transaction.',
      });
    }
    catch (error) {
      return serverError(res, error);
    }
  }

// GET a transaction by id
exports.getTransactionById = async (req, res) => {
  const { id } = req.params;
  let transaction = {}
  try {
      const check = await Transaction.findById(id);

      if (!check) {
        return res.status(404).json({
          success: false,
          message: 'transaction not found',
        });
      }
      transaction = {...check.toObject()};

      if (check.transaction_type === transactionTypes.wallet) {
        const transaction_details = await WalletTransaction.findOne({transaction_number : check.transaction_number});
        transaction.transaction_details = transaction_details;

      } else if (check.transaction_type === transactionTypes.giftcard) {
        const transaction_details = await GiftCardTransaction.findOne({transaction_number : check.transaction_number});
        transaction.transaction_details = transaction_details;
      }

      return res.status(200).json({
        data: transaction,
        success: true,
        message: 'Successfully retrieved transaction.',
      });
    }
    catch (error) {
      return serverError(res, error);
    }
  }

// GET all transactions
exports.getTransactions = async (req, res) => {
  const {pageSize, page} = req.params;
  try {
      const transactions = await Transaction.find().sort({ createdAt: -1 })
                                                  .limit(pageSize? +pageSize : 16 )
                                                  .skip(page? (+page - 1) * +pageSize : 0)
                                                  .exec();
      return res.status(200).json({
        data: transactions,
        success: true,
        message: 'Successfully retrieved transactions for the today.',
      });
    }
    catch (error) {
      return serverError(res, error);
    }
  }

// GET all transactions by day date should be in ISO format eg. Format: YYYY-MM-DD Example: "2023-09-15" (assuming today is September 15, 2023)
exports.getTransactionsByDay = async (req, res) => {
  try {
    const { date } = req.body; // Assuming date is passed as a query parameter
    if (!date) {
      // if no date, then it would return the result for today
      const targetDate = new Date(Date.now());
      
      // Set the start and end date for the specified day
      targetDate.setHours(0, 0, 0, 0); // Start of the day
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1); // End of the day

      const transactions = await Transaction.find({
        createdAt: { $gte: targetDate, $lt: nextDay },
      }).sort({ createdAt: -1 });
      return res.status(200).json({
        data: transactions,
        success: true,
        message: 'Successfully retrieved transactions for the today.',
      });
    }

    // Convert the date to a JavaScript Date object (assuming date is in ISO format)
    const targetDate = new Date(date);
    // Set the start and end date for the specified day
    targetDate.setHours(0, 0, 0, 0); // Start of the day
    const nextDay = new Date(targetDate);

    nextDay.setDate(nextDay.getDate() + 1); // End of the day

    const transactions = await Transaction.find({
      createdAt: { $gte: targetDate, $lt: nextDay },
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      data: transactions,
      success: true,
      message: 'Successfully retrieved transactions for the specified day.',
    });
  } catch (error) {
    return serverError(res, error);
  }
};



exports.setTransactionStatus = async (req, res) => {
  try {
    const transactionId = req.params.id;
    let { status } = req.body;
    status = String(status).toLowerCase();

    let transaction = await Transaction.findById(transactionId);

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
    if( status === Status.successful ) {
      const isSuccess = await checkTransactionDetailsSuccess(transaction.transaction_number, transaction.transaction_type);

      if (!isSuccess) {
        return res.status(400).json({
          success: false,
          message: "Transaction details verification failed"
        });
      }
      transaction = await Transaction.findByIdAndUpdate(transactionId, {status : status.toLocaleLowerCase()}, {new: true});
    } else {
      transaction = await Transaction.findByIdAndUpdate(transactionId, {status : status.toLocaleLowerCase()}, {new: true});
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
exports.createTransaction = async (user_id, description, amount , operation, transaction_type, status, transaction_number)=> { // everything here is required
    try {
        const checkUser = await User.findOne({ _id: user_id}).select("-password");
        if (!checkUser) {
          throw new Error("user_id not found");
      }
        transactionMailer(checkUser.email, operation, amount, description)
        
        const newTransaction = transaction_number? 
        new Transaction({ user_id, description, amount, transaction_type, status: status? status : "pending" , transaction_number}) 
        : 
        new Transaction({ user_id, description, amount, transaction_type, status: status? status : "pending" });

        const saveTransaction = await newTransaction.save();
        return saveTransaction;
    } catch (error) {
        throw error;
    }
}

const checkTransactionDetailsSuccess = async ( transaction_number, transaction_type ) => {
  let check;
  switch (transaction_type) {
    case transactionTypes.wallet:
      check = await WalletTransaction.findOne({ transaction_number });
      break;
    case transactionTypes.giftcard:
      check = await GiftCardTransaction.findOne({ transaction_number });
      break;
    case transactionTypes.crypto:
      check = CryptoTransaction.findOne({ transaction_number });
      break;
    default:
      return false
  }
  return check.status === Status.successful;
}

