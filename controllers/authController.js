const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');
const Wallet = require('../models/walletModel.js');
const { signUpMailer, resetPasswordMailer, noticeMailer, otpMailer } = require('../utils/nodeMailer.js');
const { serverError, createOtp } = require('../utils/services.js');
const { operations } = require('../utils/constants.js');
const jwt = require('jsonwebtoken');
const { sendSmsOtp } = require('../utils/twilio.js');

// controller for signing up
exports.registration = async (req, res) => {
    try {
        let checkUser = await User.findOne({ email: req.body.email});
        if (checkUser !== null) {
            return res.status(401).json({
                status: 'failed',
                message: 'email already exists'
            });
        }
        else {
            const { fullName, email, phoneNumber, password } = req.body;
            const otp = createOtp();
            const hashedOtp = await bcrypt.hash(otp.toString(), 10);
            var user = await User.create({
                fullName,
                email,
                phoneNumber,
                otp: hashedOtp,
                password
            });
            signUpMailer(fullName, email, otp);
            user.password = "";
            user.otp = "";
                return res.status(201).json({
                    data: user,
                    success: true,
                    message: `Successfully created user: ${fullName}, an email has been sent to ${email}` 
                });
        }

        
    } catch (error) {
        await User.findByIdAndDelete({_id: user._id},{ useFindAndModify: false});
        return serverError(res, error);
    }
}

// signin in controller where token is created.
exports.loggingIn = async (request, response) => {
    const {email, password} = request.body;
    try {
        const user = await User.findOne({ email: email });
        const checkWallet = await Wallet.findOne({user_id: user._id}).select("-wallet_pin");
        if (user) {
            const isPasswordMatching = await bcrypt.compare(password, user.password);
            if (!user.confirmedEmail) {
                return response.status(400).json({
                    success: false,
                    message: "email not yet confirmed, please check your email or create new otp"
                  });
            }
            if (isPasswordMatching) {

                const secret = process.env.JWT_SECRET;

                const dataStoredInToken = {
                    id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                  };

                //signing token
                const token = jwt.sign(dataStoredInToken,secret,{
                  expiresIn:"7d",
                  audience: process.env.JWT_AUDIENCE,
                  issuer: process.env.JWT_ISSUER
                });
                user.password = "";
                const today = new Date();

                return response.status(200).json({
                    data: user,
                    wallet: checkWallet,
                    success: true,
                    message: `Login Successfull`,
                    token: token,
                    expiresIn: new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000))
                });
            } else {
                return response.status(401).json({
                    success: false,
                    message: "Username or Password incorrect"
                  });
            }
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

// 2 factor signin in controller where token is created.
exports.twoFactorLoggingIn = async (request, response) => {
    const {email, otp} = request.body;
    try {
        const user = await User.findOne({ email: email });
        const checkWallet = await Wallet.findOne({user_id: user._id}).select("-wallet_pin");
        if (user) {
            const isOtpMatching = await bcrypt.compare(otp, user.twoFactorAuth?.tempSecret);
            if (!user.confirmedEmail) {
                return response.status(400).json({
                    success: false,
                    message: "email not yet confirmed, please check your email or create new otp"
                  });
            }
            if (!user.twoFactorAuth?.enabled) {
                return response.status(400).json({
                    success: false,
                    message: "Two Factor Authentication not enabled"
                  });
            }
            if (isOtpMatching) {

                const secret = process.env.JWT_SECRET;

                const dataStoredInToken = {
                    id: user._id.toString(),
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role
                  };

                //signing token
                const token = jwt.sign(dataStoredInToken,secret,{
                  expiresIn:"7d",
                  audience: process.env.JWT_AUDIENCE,
                  issuer: process.env.JWT_ISSUER
                });
                user.password = "";
                const today = new Date();

                return response.status(200).json({
                    data: user,
                    wallet: checkWallet,
                    success: true,
                    message: `Login Successfull`,
                    token: token,
                    expiresIn: new Date(today.getTime() + (6 * 24 * 60 * 60 * 1000))
                });
            } else {
                return response.status(401).json({
                    success: false,
                    message: "Username or Password incorrect"
                  });
            }
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

// controller to confirm a User's email
exports.confirmUserEmail = async (req, res) => {
    const {otp, id} = req.body;
    try {
        
        const checkUser = await User.findOne({ _id: id}).lean();
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        if (checkUser.otp ===''){
            return res.status(400).json({
                status: 'failed',
                message: 'email already confirmed'
            });

        }
        const isMatching = await bcrypt.compare(otp, checkUser.otp);
        if (isMatching) {
            await User.findByIdAndUpdate({_id: id},{confirmedEmail : true, otp: ''});
            return res.status(200).json({
                status: 'success'
            });
        }
        else{
            return res.status(400).json({
                status: 'failed',
                message: 'otp not matched'
            });
        }
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for reseting a User's password
exports.resetPassword = async (req, res) => {
    const {otp, id, password} = req.body;
    try {
        
        const checkUser = await User.findOne({ _id: id}).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        const isMatching = await bcrypt.compare(otp, checkUser.otp);
        if (isMatching) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate({_id: id},{ password: hashedPassword, otp: ''});
            noticeMailer(checkUser.email, operations.changedPassword);
            return res.status(200).json({
                status: 'success',
                message: 'Password changed successfully.'
            });
        }
        else {
            return res.status(400).json({
                status: 'failed',
                message: 'otp not matched'
            });
        }
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for reseting a User's password
exports.resetPin = async (req, res) => {
    const {otp, wallet_number, pin} = req.body;

    if (parseInt(pin)< 1000 || parseInt(pin) > 9999) {
        return res.status(404).json({
            success: false,
            message: 'invalid pin'
        });
    }
    try {
        const checkWallet = await Wallet.findOne({wallet_number}).lean();
        const checkUser = await User.findOne({ _id: checkWallet.user_id}).lean();
        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            });
        }
        if (!checkWallet) {
            return res.status(404).json({
                success: false,
                message: 'wallet not found'
            });
        }
        const isMatching = await bcrypt.compare(otp, checkUser.otp);
        if (isMatching) {
            const hashedPin = await bcrypt.hash(pin, 10);
            const wallet = await Wallet.findOneAndUpdate({wallet_number},{ wallet_pin: hashedPin});
            await User.findByIdAndUpdate({_id: checkWallet.user_id}, {otp: ""})
            noticeMailer(checkUser.email, operations.changedPassword);
            return res.status(200).json({
                data: wallet,
                success: true,
                message: 'Password changed successfully.'
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'otp not matched'
            });
        }
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for requesting reset of a User's password.
exports.requstResetPassword = async (req, res) => {
    const {email} = req.body;
    try {
        var checkUser = await User.findOne({ email: email}).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        const otp =  createOtp();
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        await User.findByIdAndUpdate({_id: checkUser._id},{ otp: hashedOtp });
        resetPasswordMailer(checkUser.email, otp);
            return res.status(200).json({
                status: 'success',
                message: 'an email has been sent with the reset otp'
            });
        
    } catch (error) {
        return serverError(res, error);
    }
}

exports.requstOtp = async (req, res) => {
    const {email, phoneNumber} = req.body;
    try {
        
        const otp =  createOtp();
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        var checkUser = await User.findOne(email? { email: email} : { phoneNumber : phoneNumber }).lean();

        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        if (!checkUser.twoFactorAuth.enabled) {
            return res.status(401).json({
                status: 'failed',
                message: '2 factor authentication not activated'
            });
        }
        
        await User.findByIdAndUpdate({_id: checkUser._id},{ otp: hashedOtp });
        email? otpMailer(checkUser.email, otp) : sendSmsOtp(checkUser.phoneNumber, otp);
            return res.status(200).json({
                status: 'success',
                message: 'otp sent'
            });
        
    } catch (error) {
        return serverError(res, error);
    }
}

// .
exports.changePassword = async (request, response) => {
    const {oldPassword, password} = request.body;
    try {
        const user = await User.findById(request.user._id);
        if (user) {
            const isPasswordMatching = await bcrypt.compare(oldPassword, user.password);
            if (isPasswordMatching) {
                // hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                const result = await User.findByIdAndUpdate(request.user.id,{password: hashedPassword}, {new: true}).select("-password");
                return response.status(200).json({
                    data: result,
                    success: true,
                    message: `Changed Password Successfully`
                });
            } else {
                return response.status(401).json({
                    success: false,
                    message: "Old Password incorrect"
                });
            }
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