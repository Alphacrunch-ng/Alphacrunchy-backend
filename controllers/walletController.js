
const bcrypt = require('bcrypt');
const Wallet = require('../models/walletModel.js')
const { serverError } = require('../utils/services.js');


// controller for getting a User
exports.createWallet = async (req, res) => {
    const {wallet_pin, id} = req.body;
    try {
        const checkWallet = await Wallet.findOne({ user_id: id}).select("-password");
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

// controller for getting a User
exports.getWalletById = async (req, res) => {
    try {
        const checkWallet = await Wallet.findOne({ _id: req.params.id}).select("-password");
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
        const user = await Wallet.findByIdAndUpdate({ user_id: id }, { active: false }, { new: true }).select("-password");
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
exports.getWallets = async (request, response,) => {
    const {pageSize, page, active} = request.params;

    try {
        const wallets = await Wallet.find(active? {active: active}: {})
                                .select("-password")
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
