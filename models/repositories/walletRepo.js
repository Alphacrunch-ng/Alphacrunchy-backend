
const bcrypt = require('bcrypt');
const Wallet = require('../walletModel');
const WalletTransaction = require('../walletTransactionModel')
const { createNotification } = require('./notificationRepo');
const { operations, transactionTypes, Status, DEFAULT_WALLET_PIN, transactionDirectionTypes } = require('../../utils/constants');
const { createTransaction } = require('./transactionRepo');


exports.creditWalletHelper = async (wallet_number, amount, transaction_number, reciever_acn) => {
    try {
        const description = `${amount} credited to wallet`;
        const creditWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: amount } }, { new: true }).select("-wallet_pin");

        const creditTransaction = await createTransaction({user_id: creditWallet.user_id, description, amount, operation: operations.credit, transaction_type: transactionTypes.wallet, status: Status.successful, transaction_number, transaction_direction: transactionDirectionTypes.credit});
        const walletTransaction = await this.createWalletTransaction(wallet_number, wallet_number, amount, description, creditTransaction.transaction_number, reciever_acn)
        await createNotification(creditWallet.user_id, `credited with ${amount}`);

        return { creditWallet, creditTransaction, walletTransaction };
    } catch (error) {
        throw error;
    }
}

exports.checkWalletHelper = async (wallet_number) => {
    try {
        const wallet = await Wallet.findOne({wallet_number});
        return wallet;
    } catch (error) {
        throw error;
    }
}
exports.checkWalletHelperUserId = async (user_id) => {
    try {
        const wallet = await Wallet.findOne({user_id});
        return wallet;
    } catch (error) {
        throw error;
    }
}

exports.debitWalletHelper = async ( wallet_number, amount, transaction_number, reciever_acn ) => {
    try {
        const description = `${amount} debited from wallet`;
        const debitWallet = await Wallet.findOneAndUpdate({ wallet_number },  { $inc: { balance: -amount } }, { new: true }).select("-wallet_pin");

        const debitTransaction = await createTransaction({ user_id: debitWallet.user_id, description, amount, operation: operations.debit, transaction_type: transactionTypes.wallet, status: Status.successful, transaction_number, transaction_direction: transactionDirectionTypes.debit});
        const walletTransaction = await createWalletTransaction(wallet_number, wallet_number, amount, description, debitTransaction.transaction_number, reciever_acn)
        await createNotification(debitWallet.user_id, `debited with ${amount}`);
        return { debitWallet, debitTransaction, walletTransaction };
    } catch (error) {
        throw error;
    }
}

exports.createWalletHelper = async ( user_id ) => {
    try {
        const checkWallet = await this.checkWalletHelperUserId(user_id);
       if (checkWallet) {
         throw new Error('Wallet already exists');
       }
        const hashedPin = await bcrypt.hash(DEFAULT_WALLET_PIN, 10);
        const wallet = await Wallet.create({ 
            wallet_pin: hashedPin, 
            user_id, 
            currency: {
                    "code": "NGN",
                    "name": "Nigerian Naira",
                    "symbol": "₦"
                }, 
            default: true
        });

        return wallet;
    } catch (error) {
        throw error;
    }
}

exports.createWalletTransaction = async (sender_wallet_number, reciever_wallet_number, amount, description, transaction_number, reciever_acn) =>{
    try {
        const walletTransaction = await WalletTransaction.create({sender_wallet_number, reciever_wallet_number, amount, description, transaction_number, reciever_acn})
        return walletTransaction;
    } catch (error) {
        throw error;
    }

}

exports.getUserWalletsHelper = async (user_id) => {
    try{
        const wallets = await Wallet.find({ user_id }).select("-wallet_pin");
        return wallets;
    } catch (error){
        throw error;
    }
}