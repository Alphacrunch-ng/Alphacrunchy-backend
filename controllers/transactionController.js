const Transaction = require('../models/transactionModel');
const WalletTransaction = require('../models/walletTransactionModel');
const GiftCardTransaction = require('../models/giftcardTransactionModel');
const { creditWalletHelper, checkWalletHelperUserId } = require('../models/repositories/walletRepo');
const { serverError } = require('../utils/services');
const { Status, transactionTypes, transactionDirectionTypes } = require('../utils/constants');
const { getPaymentLink } = require('../utils/paymentService');
const { createApproveTransactionHelper, checkTransactionDetailsSuccess } = require('../models/repositories/transactionRepo');
const { updateGiftCardTransactionPaidAmount } = require('../models/repositories/giftcardRepo');
const { default: mongoose } = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

/**
 * GET all transactions for a specific user
 * @param req.params.id - User id
 * @param req.query.pageSize - number, Default to 16 if pageSize is not provided
 * @param req.query.page - number, Default to 1 if page is not provided
 */
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.params.id;
    const pageSize = +req.query.pageSize || 16; // Default to 16 if pageSize is not provided
    const page = +req.query.page || 1; // Default to 1 if page is not provided

    const transactions = await Transaction.aggregate([
  
      {
        $facet: {
          metadata: [
            {
              $match: { user_id: ObjectId(userId) }
            },
            { $count: "total" },
            { 
              $addFields: { 
                page, 
                pageSize, 
                totalPages: { $ceil: { $divide: ["$total", pageSize] } },
                pagesLeft: { $subtract: [{ $ceil: { $divide: ["$total", pageSize] } }, page] }
              } 
            }
          ],
          all: [
            {
              $match: { user_id: ObjectId(userId) }
            },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          credit: [
            {
              $match: { user_id: ObjectId(userId) }
            },
            { $match: { transaction_direction: transactionDirectionTypes.credit } },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          debit: [
            {
              $match: { user_id: ObjectId(userId) }
            },
            { $match: { transaction_direction: transactionDirectionTypes.debit } },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ]
        }
      },
    ]);

    const metadata = transactions[0].metadata;
    const allTransactions = transactions[0].all;
    const creditTransactions = transactions[0].credit;
    const debitTransactions = transactions[0].debit;

    const result = {
      metadata,
      all: allTransactions,
      credit: creditTransactions,
      debit: debitTransactions
    };
    return res.status(200).json({
        data: result,
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


/**
 * GET all transactions for all users
 * @param req.query.pageSize - number, Default to 16 if pageSize is not provided
 * @param req.query.page - number, Default to 1 if page is not provided
 */
exports.getTransactions = async (req, res) => {
  try {
    const pageSize = +req.query.pageSize || 16; // Default to 16 if pageSize is not provided
    const page = +req.query.page || 1; // Default to 1 if page is not provided

    // const wdebit = await Transaction.updateMany(
    //   { 
    //     transaction_type: 'wallet', 
    //     description: { $regex: /debit/i } // Case insensitive regex to match "debit"
    //   }, 
    //   { 
    //     $set: { transaction_direction: 'debit' } 
    //   },
    //   { 
    //     new: true 
    //   }
    // );
    // const wcredit = await Transaction.updateMany(
    //   { 
    //     transaction_type: 'wallet', 
    //     description: { $regex: /credit/i } // Case insensitive regex to match "debit"
    //   }, 
    //   { 
    //     $set: { transaction_direction: 'credit' } 
    //   },
    //   { 
    //     new: true 
    //   }
    // );

    const transactions = await Transaction.aggregate([
      {
        $facet: {
          metadata: [
            { $count: "total" },
            { 
              $addFields: { 
                page, 
                pageSize, 
                totalPages: { $ceil: { $divide: ["$total", pageSize] } },
                pagesLeft: { $subtract: [{ $ceil: { $divide: ["$total", pageSize] } }, page] }
              } 
            }
          ],
          all: [
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          credit: [
            { $match: { transaction_direction: transactionDirectionTypes.credit } },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          debit: [
            { $match: { transaction_direction: transactionDirectionTypes.debit } },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ]
        }
      },
    ]);

    const metadata = transactions[0].metadata;
    const allTransactions = transactions[0].all;
    const creditTransactions = transactions[0].credit;
    const debitTransactions = transactions[0].debit;

    const result = {
      metadata,
      all: allTransactions,
      credit: creditTransactions,
      debit: debitTransactions
    };
    

      return res.status(200).json({
        data: result,
        success: true,
        message: 'Successfully retrieved transactions for the today.',
      });
    }
    catch (error) {
      return serverError(res, error);
    }
  }

/**
 * GET all transactions by day 
 * @param req.body.date - Date should be in ISO format eg. Format: YYYY-MM-DD Example: "2023-09-15" (assuming today is September 15, 2023)
 * @param req.query.pageSize - number, Default to 16 if pageSize is not provided
 * @param req.query.page - number, Default to 1 if page is not provided
 */
exports.getTransactionsByDay = async (req, res) => {
  try {
    
    const { date } = req.body;
    const pageSize = +req.query.pageSize || 16; // Default to 16 if pageSize is not provided
    const page = +req.query.page || 1; // Default to 1 if page is not provided

    // Convert the date to a JavaScript Date object (assuming date is in ISO format)
    const targetDate = new Date(date? date: new Date()); // if no date, then it would return the result for today
    
    // Set the start and end date for the specified day
    targetDate.setHours(0, 0, 0, 0); // Start of the day
    const nextDay = new Date(targetDate);

    nextDay.setDate(nextDay.getDate() + 1); // End of the day

    const transactions = await Transaction.aggregate([
      {
        $facet: {
          metadata: [
            {
              $match: { createdAt: { $gte: targetDate, $lt: nextDay } }
            },
            { $count: "total" },
            { 
              $addFields: { 
                page, 
                pageSize, 
                totalPages: { $ceil: { $divide: ["$total", pageSize] } },
                pagesLeft: { $subtract: [{ $ceil: { $divide: ["$total", pageSize] } }, page] }
              } 
            }
          ],
          all: [
            {
              $match: { createdAt: { $gte: targetDate, $lt: nextDay } }
            },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          credit: [
            { $match: { transaction_direction: transactionDirectionTypes.credit } },
            {
              $match: { createdAt: { $gte: targetDate, $lt: nextDay } }
            },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ],
          debit: [
            { $match: { transaction_direction: transactionDirectionTypes.debit } },
            {
              $match: { createdAt: { $gte: targetDate, $lt: nextDay } }
            },
            { $sort: { createdAt: -1 } }, // Sort by createdAt descending
            { $skip: (page - 1) * pageSize }, // Skip records for pagination
            { $limit: pageSize }, // Limit records per page
          ]
        }
      },
    ]);

    const metadata = transactions[0].metadata;
    const allTransactions = transactions[0].all;
    const creditTransactions = transactions[0].credit;
    const debitTransactions = transactions[0].debit;

    const result = {
      metadata,
      all: allTransactions,
      credit: creditTransactions,
      debit: debitTransactions
    };

    return res.status(200).json({
      data: result,
      success: true,
      message: date? 'Successfully retrieved transactions for the specified day.': 'Successfully retrieved transactions for the today.',
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.setTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(Status).includes(status.toLocaleLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if( status === transaction.status){
      return res.status(400).json({
        success: false,
        message: "Transaction status already set",
      });
    }
    const checkUserWallet = await checkWalletHelperUserId(transaction.user_id);
    if ( !checkUserWallet) {
      return res.status(400).json({
        success: false,
        message: "User wallet not found",
      });
    }

    if (status === Status.successful) {
      const isSuccess = await checkTransactionDetailsSuccess(transaction.transaction_number, transaction.transaction_type);
      if(transaction.transaction_type === transactionTypes.giftcard){
        await creditWalletHelper(checkUserWallet.wallet_number, transaction.amount, transaction.transaction_number);
        await updateGiftCardTransactionPaidAmount(transaction.transaction_number, transaction.amount);
      }
      if (!isSuccess) {
        return res.status(400).json({
          success: false,
          message: "Transaction details verification failed",
        });
      }
    }

    transaction.status = status;
    await createApproveTransactionHelper(status, transaction.transaction_number, transaction.transaction_type, req.user.id, req.user.fullName);
    await transaction.save();
    

    return res.status(200).json({
      success: true,
      message: "Transaction status updated successfully and user wallet credited",
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