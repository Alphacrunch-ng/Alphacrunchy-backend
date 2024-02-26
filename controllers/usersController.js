
const User = require('../models/userModel.js');
const cloudinary = require('../middlewares/cloudinary.js');
const UserKYCVerification2 = require('../models/userKYCVerificationModel2');
const UserBasicKYCVerification = require('../models/userBasicKYCVerification');
const { serverError } = require('../utils/services.js');
const { roles, operations } = require('../utils/constants.js');
const { noticeMailer } = require('../utils/nodeMailer.js');
const { createNotification } = require('./notificationController.js');
const { basicKycChecker, biometericKycChecker } = require('../utils/kycService.js');
const { kycEvents } = require('../utils/events/emitters.js');
const { events } = require('../utils/events/eventConstants.js');

// controller for getting a User by Id
exports.getUserById = async (req, res) => {
    try {
        const checkUser = await User.findOne({ _id: req.params.id}).select("-password");
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }else{
            const staff = {...checkUser.toObject()}
            return res.status(200).json({
                status: 'success',
                data: staff
            });
        }
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User by Email
exports.getUserByEmail = async (req, res) => {
    const email = req.query.email;
    try {
        const checkUser = await User.findOne({ email: email.toLowerCase() }).select("-password");
        if (!checkUser) {
            return res.status(404).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        const staff = {...checkUser.toObject()}
        return res.status(200).json({
            status: 'success',
            data: staff
        });
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

// deleting a user by id temporary
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

// get all users, both active and inactive or either one by passing the active parameter.
exports.getUsers = async (request, response) => {
    const {pageSize, page, active} = request.params;

    try {
        const user = await User.find(active? {active: active}: {})
                                .select("-password")
                                .limit(pageSize? +pageSize : 16 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (user) {
                return response.status(200).json({
                    data: user,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return response.status(401).json({
                    success: false,
                    message: "User not found"
                  });
        }
          
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for updating a User
exports.updateUser = async (req, res) => {
    try {
        const {fullName, firstName, middleName, lastName, sex, country, city, state, address} = req.body;
        const checkUser = await User.findOne({ id: req.params.id});
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        if (req.file) {
            // checking the cloudiinary upload from multer
            const cloudFile = await cloudinary.uploader.upload(req.file?.path,{folder: "Alphacrunch/Users"})
            // Retrieving profile pic cloudinary public id if it exists.
            if (checkUser.profilePic_cloudId) {
            await cloudinary.uploader.destroy(checkPic.profilePic_cloudId)
            }
            const profilePicture_url = cloudFile.secure_url;
            const profilePic_cloudId = cloudFile.public_id;

            const user = await User.findByIdAndUpdate(req.params.id,{fullName, firstName, middleName, lastName, sex, country, city, state, address, profilePicture_url, profilePic_cloudId}, {new: true}).select("-password");
        }
        const user = await User.findByIdAndUpdate(req.params.id,{fullName, firstName, middleName, lastName, sex, country, city, state, address}, {new: true, omitUndefined: true}).select("-password");
        return res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: 'An error occured, we are working on it',
            error: error.message
        });
    }
}

// controller for updating a User by deleting the user profile picture
exports.deleteUserProfilePicture = async (req, res) => {
    try {
        const checkUser = await User.findOne({ id: req.params.id});
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }
        // Retrieving profile pic cloudinary public id if it exists.
        if (checkUser.profilePic_cloudId) {
            await cloudinary.uploader.destroy(checkPic.profilePic_cloudId)
        }
        const profilePicture_url = "";
        const profilePic_cloudId = "";

        const user = await User.findByIdAndUpdate(req.params.id,{profilePicture_url, profilePic_cloudId}, {new: true}).select("-password");
        
        return res.status(200).json({
            status: 'success',
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            status: 'failed',
            message: 'An error occured, we are working on it',
            error: error.message
        });
    }
}

// deleting a user by id
exports.setUserRole = async (request, response) => {
    const {id} = request.params;
    const { role } = request.body;

    if (!role) {
        return response.status(400).json({
            success: false,
            message: "invalid user role"
          });
    }
    if (!Object.values(roles).includes(role.toLocaleUpperCase())) {
        return response.status(400).json({
            success: false,
            message: "invalid user role"
          });
    }
    try {
        const user = await User.findByIdAndUpdate({ _id: id }, { role }, { new: true }).select("-password");
        if (user) {
                return response.status(200).json({
                    data: user,
                    success: true,
                    message: `user is now ${role} successfully`
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

exports.kycCallBack = async (req, res) => {
    const { kycResult } = req.body;
    console.log(kycResult, req.body);
    const user = await User.findById(kycResult.PartnerParams.user_id);
    const names = user.fullName.split(' ').map((name)=> name.toLowerCase());
    
    
    if(kycResult.ResultCode === "1012"){
        const userKyc = await UserKYCVerification2.create(kycResult);
        // update the user's KYC status to approved in the database and send an email notification

        if (names.includes(userKyc.FullData.surname.toLowerCase()) && names.includes(userKyc.FullData.firstNames.toLowerCase())  ) {
            return res.status(200).json({
                success: true
            });
        }

        const user = await User.findByIdAndUpdate(userKyc.PartnerParams.user_id, { kycLevel : 2}, { new : true});

        await createNotification(user._id, operations.biometricKycSuccess)
        noticeMailer(user.email, operations.biometricKycSuccess)
        return res.status(200).json({
            success: true
        });
    }
    if(kycResult.ResultCode === "1020" || kycResult.ResultCode === "1021"){
        const userKyc = await UserBasicKYCVerification.create(kycResult);
        // update the user's KYC status to approved in the database and send an email notification
        const user = await User.findByIdAndUpdate(userKyc.PartnerParams.user_id, { kycLevel : 1}, { new : true});
        await createNotification(user._id, operations.basicKycSuccess)
        noticeMailer(user.email, operations.basicKycSuccess)
        return res.status(200).json({
            success: true
        });
    }
    return res.status(200).json({
        success: true
    });
}

exports.basicKycCheck = async (req, res) => {
    const { id } = req.params;
    const user_id = id;
    const { dob, bvn, id_type, firstName, middleName, lastName, phoneNumber, gender} = req.body;

    try {
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            });
        }
        if(!user.fullName.toLowerCase().includes(firstName.toLowerCase()) && !user.fullName.toLowerCase().includes(lastName.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'first and last names not in fullname'
            })
        }
        if(user_id !== req.user.id && user.role !== roles.admin) {
            return res.status(400).json({
                success: false,
                message: 'invalid user'
            })
        }
        const result = await basicKycChecker(dob, user_id, bvn, id_type, firstName, middleName, lastName, phoneNumber, gender);
        const verified = "Exact Match"
        if (result?.Actions?.Names === verified && result?.Actions.DOB === verified && result?.Actions.Verify_ID_Number === "Verified" && result?.Actions.Gender === verified) {
            kycEvents.emit(events.USER_BASIC_KYC_SUCCESS, { user_id, email: req.user.email, dob, bvn, id_type, firstName, middleName, lastName, phoneNumber, gender, result})
            await createNotification(user_id, operations.basicKycSuccess)
        }
        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (error) {
        return serverError(res, error);
    }
}

exports.biometricKycCheck = async (req, res) => {
    const { id } = req.params;
    const user_id = id;
    const { documentBase64StringImage, selfieBase64StringImage, id_type} = req.body;
    // const { documentBase64StringImage, selfieBase64StringImage, firstName, lastName, id_type, id_number} = req.body;

    try {

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'user not found'
            })
        }
        const result = await biometericKycChecker( documentBase64StringImage, selfieBase64StringImage, user_id, id_type);
        // const result = await biometericKycChecker( documentBase64StringImage, selfieBase64StringImage, user_id, firstName, lastName, id_type, id_number, user.dob);
        return res.status(200).json({
            success: true,
            data: result
        })
    } catch (err) {
        return serverError(res, err);
    }
}