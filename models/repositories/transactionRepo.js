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
exports.createTransaction = async ({user_id, description, amount , operation, transaction_type, status, transaction_number, transaction_direction})=> { // everything apart from transaction_number here is required
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


exports.deleteTransactionHelper = async ( { transaction_number, id } ) => {

  try {
    let transaction;
    let result = {}
     if(id){
      transaction = await Transaction.findById(id);
      transaction_number = transaction.transaction_number;
     }else {
      transaction = await Transaction.findOne({ transaction_number });
     } 
    if(!transaction){
      throw Error("Transaction not found");
    }
    let transaction_type = transaction.transaction_type;
    switch (transaction_type) {
      case transactionTypes.wallet:
        result.walletTransaction = await WalletTransaction.findOneAndDelete({ transaction_number });
        break;
      case transactionTypes.giftcard:
        result.giftcardTransaction = await GiftCardTransaction.findOneAndDelete({ transaction_number });
        break;
      case transactionTypes.crypto:
        result.cryptoTransaction = await CryptoTransaction.findOneAndDelete({ transaction_number });
        break;
      default:
        return false
    }
    result.deletedTransaction = await transaction.delete();

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Deletes transactions based on the provided options if nothing is provided then all transactions will be deleted.
 * 
 * @param {Object} options - The options for deleting transactions.
 * @param {string} options.user_id - The ID of the user whose transactions to delete.
 * 
 * @returns {Promise<void>} A promise that resolves when the transactions are deleted.
 */
exports.deleteAllTransactionsHelper = async (options) => {
  /**
   * Extracts the user ID from the options.
   * 
   * @type {string}
   */
  const { user_id } = options;

  /**
     * Finds transactions based on the provided options.
     * 
     * @type {Object}
     */
  let result = {
    walletTransaction: [],
    giftcardTransaction: [],
    cryptoTransaction: []
  }

  try {
    /**
     * Finds transactions based on the provided options.
     * 
     * @type {Transaction[]}
     */
    let transactions;
    if( user_id ){
      transactions = await Transaction.find({ user_id });
      if (transactions.length < 1) {
        /**
         * Throws an error if no transactions are found.
         * 
         * @throws {Error} Transaction not found.
         */
        throw Error("Transactions not found");
      }
    }else{
      transactions = await Transaction.find();
    }

    /**
     * Iterates over each transaction and deletes it based on its type.
     */
    if(user_id)
      for (const transaction of transactions) {
        {/**
        * Extracts the transaction type and number.
        * 
        * @type {string}
        */
          let transaction_type = transaction.transaction_type;
          /**
           * @type {string}
           */
          let transaction_number = transaction.transaction_number;
  
          /**
           * Deletes the transaction based on its type.
           */
          switch (transaction_type) {
            case transactionTypes.wallet:
              result.walletTransaction.push(await WalletTransaction.findOneAndDelete({ transaction_number }));
              break;
            case transactionTypes.giftcard:
              result.giftcardTransaction.push(await GiftCardTransaction.findOneAndDelete({ transaction_number }));
              break;
            case transactionTypes.crypto:
              result.cryptoTransaction.push(await CryptoTransaction.findOneAndDelete({ transaction_number }));
              break;
            default:
              break;
          }
        };
        }
    else {
          result.walletTransaction.push(await WalletTransaction.deleteMany());

          result.giftcardTransaction.push(await GiftCardTransaction.deleteMany());

          result.cryptoTransaction.push(await CryptoTransaction.deleteMany());
    }

    await Promise.all(result.cryptoTransaction, result.giftcardTransaction, result.walletTransaction);

    /**
     * Deletes all transactions that match the options.
     */
    if( user_id ){
      result.deletedTransactions = await Transaction.deleteMany({user_id});
    }else{
      result.deletedTransactions = await Transaction.deleteMany();
    }

    return result;
  } catch (error) {
    /**
     * Throws any error that occurs during the deletion process.
     * 
     * @throws {Error} Any error that occurs during deletion.
     */
    throw error;
  }
};