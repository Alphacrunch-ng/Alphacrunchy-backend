const Transaction = require('../transactionModel');
const User = require('../userModel.js');
const WalletTransaction = require('../walletTransactionModel');
const GiftCardTransaction = require('../giftcardTransactionModel');
const CryptoTransaction = require('../cryptoTransactionModel');
const TransactionApproval = require('../TransactionApprovalModel');
const { Status, transactionTypes } = require('../../utils/constants');
const { transactionMailer } = require('../../utils/nodeMailer');
//Services 
//create transaction service
exports.createTransaction = async (user_id, description, amount , operation, transaction_type, status, transaction_number, transaction_direction)=> { // everything apart from transaction_number here is required
    try {
        const checkUser = await User.findOne({ _id: user_id}).select("-password");
        if (!checkUser) {
          throw new Error("user_id not found");
      }
        transactionMailer(checkUser.email, operation, amount, description)
        
        const newTransaction = transaction_number? 
        new Transaction({ user_id, description, amount, transaction_type, status: status? status : "pending" , transaction_number, transaction_direction}) 
        : 
        new Transaction({ user_id, description, amount, transaction_type, status: status? status : "pending", transaction_direction });

        const saveTransaction = await newTransaction.save();
        return saveTransaction;
    } catch (error) {
        throw error;
    }
}

exports.checkTransactionDetailsSuccess = async ( transaction_number, transaction_type ) => {
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
  return check.status === Status.approved;
}

exports.checkTransactionHelper = async ( transaction_number ) => {
  const check = await Transaction.findOne({ transaction_number });
  return check;
}

exports.updateTransactionAmountHelper = async ( transaction_number, amount ) => {
  const check = await Transaction.findOneAndUpdate({ transaction_number }, { amount }, { new: true });
  return check;
}

exports.createApproveTransactionHelper = async ( status, transaction_number, transaction_type, user_id, comment ) => {
  try {
      const ApprovedBy = await TransactionApproval.create({
      transaction_type,
      transaction_number,
      user_id,
      status,
      comment
    });
    await ApprovedBy.save();

    await ApprovedBy.populate('user_id')
    return ApprovedBy;
  } catch (error) {
    throw error;
  }
}