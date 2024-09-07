const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');
const Wallet = require('../models/walletModel.js');
const { resetPasswordMailer, noticeMailer, otpMailer } = require('../utils/nodeMailer.js');
const { serverError, createOtp, formatEmail, userRequestError, unauthorizedError, setTokenDataInCookie } = require('../utils/services.js');
const { operations } = require('../utils/constants.js');
const jwt = require('jsonwebtoken');
const { authEvents } = require('../utils/events/emitters.js');
const { events } = require('../utils/events/eventConstants.js');
const { checkWalletHelper } = require('../models/repositories/walletRepo.js');
const { comparePassword, hashPassword } = require('../utils/security/hash.js');
const { generateToken } = require('../utils/security/token.js');
const { validatePassword } = require('../utils/validators/passwordValidators/passwordValidator.js');
const { lengthValidator, uppercaseValidator, symbolValidator, numberValidator } = require('../utils/validators/passwordValidators/passwordValidators.js');

exports.walletTransactionTokenGen = async (req, res) =>{
  const { wallet_pin, wallet_number, reciever_wallet_number, amount } = req.body;
  try {
    const checkWallet = await checkWalletHelper(wallet_number);
    const recieverWallet = await checkWalletHelper(reciever_wallet_number)
    if(!checkWallet){
    return userRequestError(res,'Invalid wallet number');
    }
    else{
        let isMatched = await comparePassword(wallet_pin, checkWallet.wallet_pin);
        if (!isMatched) {
            return unauthorizedError(res,"Incorrect pin");
        }
        const secret = process.env.JWT_SECRET;

        const dataStoredInToken = {
            user_id: checkWallet.user_id.toString(),
            wallet_number: reciever_wallet_number,
            reciever_wallet_balance: checkWallet.balance,
            amount
        };

        const tokenExpiry = 300

        //signing token
        const token = jwt.sign(dataStoredInToken,secret,{
            expiresIn: tokenExpiry,
            audience: process.env.JWT_AUDIENCE,
            issuer: process.env.JWT_ISSUER
        });

        return res.status(200).json({
            token,
            expiresIn: 300,
            message: `token expires in ${tokenExpiry} seconds`
        });
    }
  } catch (error) {
    return serverError(res, error);
  }
    
}
// controller for signing up
exports.registration = async (req, res) => {
    const { fullName, email, phoneNumber, password, sex, country, state, city } = req.body;
    const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
    const passwordValidators = [lengthValidator, uppercaseValidator, symbolValidator, numberValidator];
    let user;
    try {

        let checkUser = await User.findOne({ email: req.body.email});
        if (checkUser !== null) {
            return res.status(400).json({
                status: 'failed',
                message: 'email already exists'
            });
        }
        else {
            if (!validatePassword(password, passwordValidators)) {
                return badRequestResponse(res, "Password does not meet the required criteria.")
            }
            const otp = createOtp();
            const hashedOtp = await hashPassword(otp.toString());
            user = await User.create({
                fullName,
                email,
                phoneNumber,
                otp: hashedOtp,
                password,
                sex, 
                country, 
                state, 
                city 
            });
            authEvents.emit(events.USER_SIGNED_UP, {user, data: {useragent: req.useragent, ip: String(ipaddress).split(',')[0], otp, googleAuth: false}});
            user.password = "";
            user.otp = "";
                return res.status(201).json({
                    data: user,
                    success: true,
                    message: `Successfully created user: ${fullName}, an email has been sent to ${email}` 
                });
        }

        
    } catch (error) {
        if(user){
            await User.findByIdAndDelete({_id: user?._id},{ useFindAndModify: false});
        }
        return serverError(res, error);
    }
}

// signin in controller where token is created.
exports.loggingIn = async (request, response) => {
    const {email, password} = request.body;
    const ipaddress =  request?.headers['x-forwarded-for'] || request?.connection?.remoteAddress || request?.ip;
    const useragent = request?.useragent;
    try {
        const user = await User.findOne({ email: email });
        
        if (user) {
            const isPasswordMatching = await comparePassword(password, user.password);
            
            if (!user.confirmedEmail) {
                return response.status(400).json({
                    success: false,
                    message: "email not yet confirmed, please check your email or create new otp"
                  });
            }
            // if 2 factor auth is enable we generate the otp here for and send an sms
            if (isPasswordMatching) {
                if (user.twoFactorAuth?.enabled) {
                    const otp =  createOtp();
                    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

                    user.twoFactorAuth.secret = hashedOtp
                    user.twoFactorAuth.expiresAt = new Date( Date.now() + 2 * 60 * 1000)

                    const otpPhone = `${user.phoneNumber.slice(0,7)}...${user.phoneNumber.slice(-2)}` // making the phonenumber to this format 0801...89
                    const otpEmail = formatEmail(user.email)
                    await User.findByIdAndUpdate({_id: user._id},{ twoFactorAuth: user.twoFactorAuth }).catch((error)=>{
                        console.log(error);
                    })
                    await Promise.all([
                        otpMailer(user.email, otp), 
                        // sendSmsOtp(user.phoneNumber, otp)
                    ])
                    .then(() => {
                        return response.status(200).json({
                            is2FactorEnabled: true,
                            data: user,
                            success: true,
                            message: `An OTP has been sent to: ${otpPhone} and ${otpEmail}`,
                            expiresIn: user.twoFactorAuth.expiresAt,
                        });
                    })
                    .catch((error) => {
                        console.log(error);
                        return serverError(response, error);
                    });

                    
                } else {
                    const { token, expiresIn } = generateToken(user);
                    user.password = "";

                    const userLocationDetails = { useragent, ip: String(ipaddress).split(',')[0] }
                    authEvents.emit( events.USER_LOGGED_IN, { user , data: userLocationDetails } )
                    
                    const checkWallets = await Wallet.find({user_id: user._id}).select("-wallet_pin");

                    setTokenDataInCookie(response, { token, expiresIn });

                    return response.status(200).json({
                        data: user,
                        wallets: checkWallets,
                        success: true,
                        is2FactorEnabled: false,
                        message: `Login Successfull`,
                        token,
                        expiresIn,
                        ipaddress
                    });
                }
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
    const ipaddress =  request?.headers['x-forwarded-for'] || request?.connection?.remoteAddress || request?.ip;
    const useragent = request?.useragent;
    try {
        const user = await User.findOne({ email: email });
        const checkWallets = await Wallet.find({user_id: user._id}).select("-wallet_pin");
        if (user) {
            const isOtpMatching = await bcrypt.compare(otp, user.twoFactorAuth?.secret);
            if (user.twoFactorAuth.expiresAt < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'otp expired'
                });
            }
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

                const { token, expiresIn } = generateToken(user);

                //resetting the 2 factor properties to default value
                user.twoFactorAuth.expiresAt = 1;
                user.twoFactorAuth.secret = "";
                await user.save();
                user.password = "";
                
                const userLocationDetails = {useragent, ip: String(ipaddress).split(',')[0]}
                authEvents.emit(events.USER_LOGGED_IN, {user , data: userLocationDetails})

                setTokenDataInCookie(response, { token, expiresIn });

                return response.status(200).json({
                    data: user,
                    wallets: checkWallets,
                    success: true,
                    is2FactorEnabled: true,
                    message: `Login Successfull`,
                    token,
                    expiresIn,
                    ipaddress
                });
            } else {
                return response.status(401).json({
                    success: false,
                    message: "Wrong OTP"
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

// controller for reseting a User's wallet pin
exports.resetPin = async (req, res) => {
    const {otp, wallet_number, pin} = req.body;

    if (parseInt(pin)< 1000 || parseInt(pin) > 9999) {
        return res.status(404).json({
            success: false,
            message: 'invalid pin'
        });
    }
    if (!wallet_number) {
        return res.status(404).json({
            success: false,
            message: 'invalid wallet number '+ wallet_number
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
        const isMatching = await bcrypt.compare(otp, checkUser.twoFactorAuth?.secret);
        if (isMatching) {
            if (checkUser.twoFactorAuth.expiresAt < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'otp expired'
                });
            }
            const hashedPin = await bcrypt.hash(pin, 10);
            const wallet = await Wallet.findOneAndUpdate({wallet_number},{ wallet_pin: hashedPin});
            await User.findByIdAndUpdate({_id: checkWallet.user_id}, {otp: ""})
            noticeMailer(checkUser.email, operations.changedWalletPin);
            return res.status(200).json({
                data: wallet,
                success: true,
                message: 'Wallet Pin changed successfully.'
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

// controller for reseting a User's wallet pin
exports.changeWalletPin = async (req, res) => {
    const {wallet_number, current_pin, pin} = req.body;

    if (parseInt(pin)< 1000 || parseInt(pin) > 9999) {
        return res.status(404).json({
            success: false,
            message: 'invalid new pin'
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
        const isMatching = await bcrypt.compare(current_pin, checkWallet.wallet_pin);
        if (isMatching) {
            const hashedPin = await bcrypt.hash(pin, 10);
            const wallet = await Wallet.findOneAndUpdate({wallet_number},{ wallet_pin: hashedPin }, { new: true });
            noticeMailer(checkUser.email, operations.changedWalletPin);
            return res.status(200).json({
                data: wallet,
                success: true,
                message: 'Wallet Pin changed successfully.'
            });
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'old pin incorrect'
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

//uses either email or phone number
exports.requestOtp = async (req, res) => {
    const {email, phoneNumber} = req.body;
    try {
        
        const otp =  createOtp();
        const hashedOtp = await bcrypt.hash(otp.toString(), 10);
        var checkUser = await User.findOne(email? { email} : { phoneNumber }).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        
        checkUser.twoFactorAuth.secret = hashedOtp
        checkUser.twoFactorAuth.expiresAt = new Date( Date.now() + 2 * 60 * 1000) // expires in 10mins time

        await User.findByIdAndUpdate({_id: checkUser._id},{ twoFactorAuth: checkUser.twoFactorAuth })
        try {
            otpMailer(checkUser.email, otp)
            // if (email) {
            //     otpMailer(checkUser.email, otp)
            // }
            // sendSmsOtp(checkUser.phoneNumber, otp)
        } catch (error) {
            return res.status(500).json({
                status: 'failed',
                message: 'an error has occured we are working on it',
                error: error
            });
        }
        const minutes = Math.floor((checkUser.twoFactorAuth.expiresAt.getTime() - Date.now()) / 60000);
        return res.status(200).json({
            status: 'success',
            message: `otp sent and expires in ${minutes} minutes`,
            expiresIn: checkUser.twoFactorAuth.expiresAt
        });
        
    } catch (error) {
        return serverError(res, error);
    }
}

exports.setup2Factor = async (req, res) => {
    const {email, phoneNumber, otp, state} = req.body;
    try {
        var checkUser = await User.findOne(email? { email} : { phoneNumber }).lean();
        const isOtpMatching = await bcrypt.compare(otp, checkUser.twoFactorAuth?.secret);
        if (!checkUser) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            });
        }

        if (isOtpMatching) {
            const twoFA = {
                enabled : state,
                secret : ''
            }
    
            if (checkUser.twoFactorAuth.expiresAt < Date.now()) {
                return res.status(400).json({
                    success: false,
                    message: 'otp expired'
                });
            }
            const setUser = await User.findByIdAndUpdate({_id: checkUser._id},{ twoFactorAuth: {...twoFA} }, { new: true}).select('-password');
            return res.status(200).json({
                data: setUser,
                success: true,
                message: `2 factor authentication ${setUser.twoFactorAuth.enabled? 'activated': 'deactivated'}`
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'otp not matching'
            });
        }
        
    } catch (error) {
        return serverError(res, error);
    }
}

// change user password (must provide auth token data).
exports.changePassword = async (request, response) => {
    const {currentPassword, password} = request.body;
    try {
        const user = await User.findById(request.user.id);
        if (user) {
            const isPasswordMatching = await bcrypt.compare(currentPassword, user.password);
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

exports.getKycKey = async (req, res) => {

    let { timestamp, signature } = getSignatureAndTimeStamp();
    const { environment } = req.body;
    switch (environment) {
        case 'sandbox':
            res.status(200).json({
                data: process.env.API_SIGNATURE_SANDBOX,
                message: "Your Signature API Key"
            });
            break;
        case 'live':
            res.status(200).json({
                data: process.env.API_SIGNATURE_LIVE,
                message: "Your Signature API Key",
                signature,
                timestamp
            });
            break;
        default:
            res.status(400).json({
                message: "No environment given",
                success: false
            });
    }
}
