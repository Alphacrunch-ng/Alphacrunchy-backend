
const User = require('../models/userModel.js');
const Wallet = require('../models/walletModel.js')
const { serverError } = require('../utils/services.js');

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

// controller for updating a User
exports.updateUser = async (req, res) => {
    try {
        const checkUser = await User.findOne({ id: req.params.id});
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }

        // checking the cloudiinary upload from multer
        const cloudFile = await cloudinary.uploader.upload(req.file.path)
        // Retrieving profile pic cloudinary public id if it exists.
        if (checkUser.profilePic_cloudId) {
           await cloudinary.uploader.destroy(checkPic.profilePic_cloudId)
        }
        const {fullName, sex, phoneNumber, city, state, address} = req.body;
        const profilePicture_url = cloudFile.secure_url;
        const profilePic_cloudId = cloudFile.public_id;

        const user = await User.findByIdAndUpdate({ id: checkUser._id},{fullName, sex, phoneNumber, city, state, address, profilePicture_url, profilePic_cloudId}, {new: true}).select("-password");
        return res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        return serverError(res, error);
    }
}
