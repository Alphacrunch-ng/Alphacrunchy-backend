
// const bcrypt = require('bcrypt');
// const Wallet = require('../models/walletModel.js');
const GiftCard = require('../models/giftCardModel');
const cloudinary = require('../middlewares/cloudinary.js');
const { serverError } = require('../utils/services.js');


// ------------GIFTCARD-MANAGEMENT----------- //

// controller for getting a User
exports.createGiftCard = async (req, res) => {
    const {name, rate, description} = req.body;
    try {
        const check = await GiftCard.findOne({ name: name});
        if (!check) {
            // checking the cloudiinary upload from multer
            const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: "Alphacrunch/Giftcards"});
            const picture_url = cloudFile.secure_url;
            const picture_cloudId = cloudFile.public_id;
            const giftcard = await GiftCard.create({ name, rate, description, picture_url, picture_cloudId});
            return res.status(201).json({
                data: giftcard,
                status: 'success',
                message: 'giftcard successfully created.'
            })
        }
        else{
            return res.status(400).json({
                status: 'failed',
                message: 'card already exists'
            });
        }
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User
exports.uploadGiftCard = async (req, res) => {
    const {user_id, date} = req.body;
    try {
            // checking the cloudiinary upload from multer
            const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: `Alphacrunch/Giftcards/${user_id}/${date}`});
            
            return res.status(201).json({
                data: cloudFile,
                status: 'success',
                message: 'giftcard successfully uploaded.'
            })
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a User
exports.deleteUploadedGiftCard = async (req, res) => {
    const {public_id} = req.body;
    try {
            const check = await GiftCard.find({picture_cloudId: public_id});
            console.log(check);
            if (check === null || check.length() < 1) {
                // deleting from cloud
                const cloudFile = await cloudinary.uploader.destroy(public_id);
                
                return res.status(201).json({
                    data: cloudFile,
                    status: 'success',
                    message: 'giftcard successfully deleted.'
                });
            }
            return res.status(401).json({
                status: 'failed',
                message: 'you are not allowed to delete this card, or wrong route'
            })
            
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a giftcard
exports.getGiftCardById = async (req, res) => {
    try {
        const check = await GiftCard.findOne({ _id: req.params.id});
        if (!check) {
            return res.status(204).json({
                status: 'failed',
                message: 'giftcard not found'
            });
        }
        const giftcard = {...check.toObject()}
        return res.status(200).json({
            status: 'success',
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// deleting a user by id
exports.setGiftCardInactive = async (request, response) => {
    const {id} = request.params;
    try {
        const giftcard = await GiftCard.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
        if (giftcard) {
                return response.status(200).json({
                    data: giftcard,
                    success: true,
                    message: `Successfully Deleted`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "giftcard not found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// get all giftcards, both active and inactive or either one by passing the active parameter.
exports.getAllGiftCards = async (request, response, next) => {
    const {pageSize, page, active} = request.params;

    try {
        const giftcards = await GiftCard.find(active? {active: active}: {})
                                .limit(pageSize? +pageSize : 30 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (giftcards) {
                return response.status(200).json({
                    data: giftcards,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "No giftcards found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// controller for updating a giftcard
exports.updateGiftCard = async (req, res) => {
    const {name, rate, description} = req.body;
    let picture_url = undefined;
    let picture_cloudId = undefined;
    try {
        const check = await GiftCard.findOne({ id: req.params.id});
        if (!check) {
            return res.status(204).json({
                status: 'failed',
                message: 'card not found'
            });
        }
        if (req.file) {
            // cloudiinary upload from multer
            const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: "Alphacrunch/Giftcards"}, (error,result) => {
                if (error) {
                    console.log("Error uploading file:", error);
                } else {
                    console.log("File uploaded successfully:", result);
                }
            });
            // Retrieving card pic cloudinary public id if it exists.
            if (check.picture_cloudId) {
                await cloudinary.uploader.destroy(check.picture_cloudId, (error,result) => {
                    if (error) {
                        console.log("Error deleting file:", error);
                    } else {
                        console.log("File deleted successfully:", result);
                    }
                })
            }
            picture_url = cloudFile.secure_url;
            picture_cloudId = cloudFile.public_id;
        }
        
        

        const data = {name, rate, description, picture_url, picture_cloudId}
        const giftcard = await GiftCard.findOneAndUpdate({ id: check._id},{name, rate, description, picture_url, picture_cloudId}, {new: true});
        
        return res.status(200).json({
            status: 'success',
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

//completely deleting a giftcard by id
exports.deleteGiftCard = async (request, response) => {
    try {
        const giftcard = await GiftCard.findByIdAndDelete({ _id: request.params.id }, { useFindAndModify: false});
        if (giftcard) {
                return response.status(200).json({
                data: giftcard,
                success: true,
                message: `Successfully Deleted`
              });
        } else {
                return response.status(404).json({
                    success: false,
                    message: "giftcard not found"
                  });
        }
          
    } catch (error) {
        return serverError(response, error);
    }
}

// --------------------------------------------------------- //