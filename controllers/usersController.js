
const User = require('../models/userModel.js');
const cloudinary = require('../middlewares/cloudinary.js');
const { serverError } = require('../utils/services.js');

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

// get all users, both active and inactive or either one by passing the active parameter.
exports.getUsers = async (request, response, next) => {
    const {pageSize, page, active} = request.params;

    try {
        const user = await User.find(active? {active: active}: {})
                                .select("-password")
                                .limit(pageSize? +pageSize : 30 )
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
        const checkUser = await User.findOne({ id: req.params.id});
        if (!checkUser) {
            return res.status(204).json({
                status: 'failed',
                message: 'user not found'
            });
        }

        // checking the cloudiinary upload from multer
        const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: "Alphacrunch/Users"})
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
        return res.status(500).json({
            status: 'failed',
            message: 'An error occured, we are working on it',
            error: error.message
        });
    }
}
