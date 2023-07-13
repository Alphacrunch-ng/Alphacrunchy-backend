
const bcrypt = require('bcrypt');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel.js');
const { getIo } = require('../utils/socket.js');
const Wallet = require('../models/walletModel.js');
const { serverError } = require('../utils/services.js');
const { createNotification } = require('./notificationController');
const { operations } = require('../utils/constants');
const { createTransaction } = require('./transactionController');
const { currencies } = require('../utils/currencies.json')


// controller for creating a User wallet
exports.createWallet = async (req, res) => {
    const {wallet_pin, id, currency_code} = req.body;
    //checking if the sent currency code exist in the collection of supported currency
    const checkCurrency = currencies.filter((currency) => currency.code === String(currency_code).trim().toLocaleUpperCase());
    let selectedCurrency = {};
    if (checkCurrency.length < 1) {
        return res.status(400).json({
            success: false,
            message: 'invalid currency code'
        })
    }
    selectedCurrency = checkCurrency[0];
    try {
        const checkWallets = await Wallet.find({ user_id: id}).select("-wallet_pin");

        //checking if user already has an wallet with provided currency
        const checkWalletCurrency = checkWallets.filter((wallet)=> wallet.currency.code === selectedCurrency.code)
        if (checkWalletCurrency.length > 0 ) {
            return res.status(400).json({
                success: false,
                message: `wallet with ${selectedCurrency.code} already exist.`
            })
        }
       
        
            const hashedPin = await bcrypt.hash(wallet_pin, 10);
            const wallet = await Wallet.create({ wallet_pin: hashedPin, user_id: id, currency: selectedCurrency, default:(checkWallets.length < 1)});
            wallet.wallet_pin = "";
            return res.status(201).json({
                data: wallet,
                status: 'success',
                message: 'user wallet successfully created.'
            });
    } catch (error) {
        return serverError(res, error);
    }
}

// credit a users wallet
exports.creditWallet = async (req, res) => {
    const {wallet_number, amount, admin_password} = req.body;
    const { id, fullName} = req.user
    
    try {
        const checkWallet = await Wallet.findOne({ wallet_number});
        const checkAdmin = await User.findById(id);
        const description = `${amount} credited to wallet`;
        
        const checkPin = await bcrypt.compare(admin_password, checkAdmin.password);
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        if (!checkPin) {
            
            return res.status(401).json({
                success: false,
                message: 'user password incorrect'
            })
        }
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }
        const creditWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: amount } }, { new: true }).select("-wallet_pin");
        const transaction = await createTransaction(checkWallet.user_id, description, amount, operations.credit);
        console.log(await createNotification(checkWallet.user_id, `credited with ${amount}`))
        return res.status(200).json({
            data: creditWallet,
            success: true,
            message: 'successfully credited wallet'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// debit a users wallet
exports.debitWallet = async (req, res) => {
    const {wallet_number, amount, admin_password} = req.body;
    const { id, fullName} = req.user
    
    try {
        const checkWallet = await Wallet.findOne({ wallet_number});
        const checkAdmin = await User.findById(id);
        const description = `${amount} debited from wallet`
        
        const checkPin = await bcrypt.compare(admin_password, checkAdmin.password);
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        if (!checkPin) {
            console.log(checkPin + ": ", checkWallet.wallet_pin);
            return res.status(401).json({
                success: false,
                message: 'user password incorrect'
            })
        }
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }
        const creditWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: -amount } }, { new: true })
                                            .select("-wallet_pin")
        const transaction = await createTransaction(checkWallet.user_id, description, amount, operations.debit);
        console.log(await createNotification(checkWallet.user_id, `debited of ${amount}`))
        return res.status(200).json({
            data: creditWallet,
            success: true,
            message: 'successfully debit wallet'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// debit a users wallet
exports.wallet2WalletTransfer = async (req, res) => {
    const {wallet_number, amount, reciever_wallet_number } = req.body;
    
    try {
        const checkWallet = await Wallet.findOne({ wallet_number}).populate({
            path: "user_id",
            select: "fullName _id"
        });
        const checkRecieverWallet = await Wallet.findOne({ wallet_number}).populate({
            path: "user_id",
            select: "fullName _id"
        });

        const debitDescription = `${amount} debited from wallet to ${checkRecieverWallet.user_id.fullName}: ${checkRecieverWallet.wallet_number}.`;

        const creditDescription = `${amount} credited to wallet from ${checkWallet.user_id.fullName}: ${checkWallet.wallet_number}.`;

        if (!checkWallet || !checkRecieverWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            })
        }
        if (!amount || amount < 1 || !parseFloat(amount)) {
            return res.status(400).json({
                success: false,
                message: 'invalid amount'
            })
        }

        //debit the sender
        const debitWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: -amount } }, { new: true }).select("-wallet_pin");
        const debitTransaction = await createTransaction(checkWallet.user_id, description, amount, operations.debit);
        console.log(await createNotification(checkWallet.user_id._id, `debited of ${amount}`));

        //credit the reciever
        await Wallet.findOneAndUpdate({reciever_wallet_number},  { $inc: { balance: amount } }, { new: true }).select("-wallet_pin");
        await createTransaction(checkWallet.user_id, description, amount, operations.credit);
        console.log(await createNotification(checkRecieverWallet.user_id._id, `credited with ${amount}`));

        return res.status(200).json({
            data: debitWallet,
            success: true,
            message: 'successfully transfered funds'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User wallet by wallet id
exports.getWalletById = async (req, res) => {
    try {
        const checkWallet = await Wallet.findOne({ _id: req.params.id}).select("-wallet_pin").populate({
            path: "user_id",
            select: "fullName "
        });
        if (!checkWallet) {
            return res.status(204).json({
                status: 'failed',
                message: 'wallet not found'
            });
        }
        const wallet = {...checkWallet.toObject()}
        return res.status(200).json({
            status: 'success',
            data: wallet
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// deleting a user wallet temporarily by id
exports.setUserWalletInactive = async (request, response) => {
    const {id} = request.params;
    try {
        const user = await Wallet.findByIdAndUpdate({ user_id: id }, { active: false }, { new: true }).select("-wallet_pin");
        if (user) {
                return response.status(200).json({
                    data: user,
                    success: true,
                    message: `Successfully Deleted`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "User not found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// get all user wallets, both active and inactive or either one by passing the active parameter.
exports.getWallets = async (request, response) => {
    const {pageSize, page, active} = request.query;
    const {id} = request.params
    try {
        const wallets = await Wallet.find(active? {user_id: id, active}: {user_id: id})
                                .select("-wallet_pin")
                                .limit(pageSize? +pageSize : 30 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (wallets) {
                return response.status(200).json({
                    data: wallets,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "No Wallets found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}
