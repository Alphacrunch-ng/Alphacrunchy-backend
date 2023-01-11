const bcrypt = require('bcrypt');
const User = require('../models/userModel.js');
const { signUpMailer, resetPasswordMailer } = require('../utils/nodeMailer.js');
const { serverError, createOtp } = require('../utils/services.js');

// controller for signing up
exports.registration = async (req, res, role) => {
    try {
        let checkUser = await User.findOne({ email: req.body.email});
        if (checkUser !== null) {
            return res.status(401).json({
                status: 'failed',
                message: 'email already exists'
            });
        }
        else {
            const { fullName, email, phoneNumber, sex, password } = req.body;
            const otp = createOtp();
            const hashedPassword = await bcrypt.hash(password, 13);
            const hashedOtp = await bcrypt.hash(otp.toString());
            const user = await User.create({
                fullName,
                email,
                sex,
                phoneNumber,
                otp: hashedOtp,
                password: hashedPassword
            });
            user.password = undefined;
            user.otp = undefined;
            signUpMailer(fullName, email, otp);
            response.status(201).json({
                data: user,
                success: true,
                message: `Successfully created user: ${fullName}, an email has been sent to ${email}` 
            });
        }

        
    } catch (error) {
        return serverError(res, error);
    }
}


// signin in controller where token is created.
exports.loggingIn = async (request, response, next) => {
    const {email, password} = request.body;
    try {
        const user = await User.findOne({ email: email });
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
                const token = jwt.sign(dataStoredInToken,secret,{
                  expiresIn:"7d",
                  audience: process.env.JWT_AUDIENCE,
                  issuer: process.env.JWT_ISSUER
                });
                user.password = "";
                return response.status(200).json({
                data: user,
                success: true,
                message: `Login Successfull`,
                token: token 
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
        return serverError(res, error);
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
            res.status(200).json({
                status: 'success'
            });
        }
        res.status(400).json({
            status: 'failed',
            message: 'otp not matched'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for reseting a User's password
exports.resetPassword = async (req, res, next) => {
    const {otp, id, password} = req.body;
    try {
        
        const checkUser = await User.findOne({ _id: id}).lean();
        if (!checkUser) {
            return res.status(404).json({
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
            const hashedPassword = await bcrypt.hash(password, 13);
            await User.findByIdAndUpdate({_id: id},{hashedPassword, otp: ''});
            res.status(200).json({
                status: 'success',
                message: 'Password changed successfully.'
            });
        }
        res.status(400).json({
            status: 'failed',
            message: 'otp not matched'
        });
        next();
    } catch (error) {
        return serverError(res, error);
    }
}


// controller for requesting reset of a User's password.
exports.requstResetPassword = async (req, res, next) => {
    const {email} = req.body;
    try {
        const checkUser = await User.findOne({ email: email}).lean();
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        const otp =  createOtp();
        resetPasswordMailer(checkUser.email, otp);
        res.status(200).json({
            status: 'success',
            message: 'an email has been sent with the reset otp'
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User
exports.getUser = async (req, res) => {
    try {
        const checkUser = await User.findOne({ email: req.body.email}).select("-password");
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }

        const staff = {...checkUser.toObject()}
        return res.status(200).json({
            status: 'success',
            data: staff
        });
        next();
    } catch (error) {
        return serverError(res, error);
    }
}

//completely deleting a user by id
exports.deleteUser = async (request, response) => {
    try {
        const user = await User.findByIdAndDelete({ _id: request.params.id }, { useFindAndModify: false}).select("-password");
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

// deleting a user by id
exports.setInActiveUser = async (request, response) => {
    const {id} = request.params;
    try {
        const user = await User.findByIdAndUpdate({ _id: id }, { active: false }, { new: true }).select("-password");
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