
const bcrypt = require('bcrypt');
const Notification = require('../models/notificationModel');
const User = require('../models/userModel.js');
const { getIo } = require('../utils/socket.js');
const Wallet = require('../models/walletModel.js');
const { serverError } = require('../utils/services.js');
const { createNotification } = require('./notificationController');


// controller for creating a User wallet
exports.createWallet = async (req, res) => {
    const {wallet_pin, id} = req.body;
    try {
        const checkWallet = await Wallet.findOne({ user_id: id}).select("-wallet_pin");
        if (!checkWallet) {
            const hashedPin = await bcrypt.hash(wallet_pin, 10);
            const wallet = await Wallet.create({ wallet_pin: hashedPin, user_id: id });
            wallet.wallet_pin = "";
            return res.status(201).json({
                data: wallet,
                status: 'success',
                message: 'user wallet successfully created.'
            })
        }
        else{
            return res.status(404).json({
                status: 'failed',
                message: 'user already has a wallet'
            });
        }
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
        const transaction = {wallet_number, amount, admin_user: id, admin_name: fullName, time_stamp: (new Date).toISOString()}
        
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
        const creditWallet = await Wallet.findOneAndUpdate({wallet_number},  { $inc: { balance: amount } }, { new: true })
                                            .select("-wallet_pin")
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
        const transaction = {wallet_number, amount, admin_user: id, admin_name: fullName, time_stamp: (new Date).toISOString()}
        
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

// controller for getting a User
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

// deleting a user by id
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
        return serverError(res, error);
    }
}

// get all users, both active and inactive or either one by passing the active parameter.
exports.getWallets = async (request, response, next) => {
    const {pageSize, page, active} = request.params;

    try {
        const wallets = await Wallet.find(active? {active: active}: {})
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
        return serverError(res, error);
    }
}
