
// const bcrypt = require('bcrypt');
// const Wallet = require('../models/walletModel.js');
const GiftCard = require('../models/giftCardModel');
const GiftCardRate = require('../models/giftCardRateModel');
const cloudinary = require('../middlewares/cloudinary.js');
const Wallet = require('../models/walletModel.js');
const { serverError } = require('../utils/services.js');
const GiftCardTransaction = require('../models/giftcardTransactionModel');
const mongoose = require('mongoose');
const { createTransaction } = require('./transactionController');
const { Status } = require('../utils/constants');
const { getCacheData, setCacheData } = require('../utils/cache');
const ObjectId = mongoose.Types.ObjectId;


// ------------GIFTCARD-MANAGEMENT----------- //

// controller for creating a supported giftcard
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
            });
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


// controller for starting a giftcard trading transaction
exports.createGiftCardTransaction = async (req, res) => {
    // extract data from the request body
    console.log(req.user.id);
  const {
    receiverWalletId,
    currencyName,
    currencySymbol,
    currencyCode,
    rate,
    amount,
    cards,
    description,
  } = req.body;
  
    try {

        const check = await Wallet.findById(receiverWalletId);
        if(check !== null){
            //create transactiondocument
            const transaction = await createTransaction(check.user_id, description, amount);
            // create a new GiftCardTransaction document
            const giftcardTransaction = await GiftCardTransaction.create({
                reciever_wallet_number: check.wallet_number,
                user_id: req.user.id,
                currency_name: currencyName,
                currency_symbol: currencySymbol,
                currency_code: currencyCode,
                rate: rate,
                cards: cards,
                transaction_number: transaction.transaction_number,
                description: description,
            }, async (error, result)=>{
                if(error) {
                    console.log(error);
                    return serverError(res, error);
                }else{
                    return res.status(201).json({
                        data: result,
                        transaction,
                        success: true,
                        message: 'giftcard transaction initiallized.'
                    });
                }

            });
        }
        

        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for uploading transaction card
exports.uploadGiftCard = async (req, res) => {
    const {user_id, date} = req.body;
    try {
            // checking the cloudiinary upload from multer
            const cloudFile = await cloudinary.uploader.upload(req.file.path,{folder: `Alphacrunch/Giftcards/${user_id}/${date}`});
            
            return res.status(201).json({
                data: cloudFile,
                success: true,
                message: 'giftcard successfully uploaded.'
            })
        
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for deleting uploaded transaction card
exports.deleteUploadedGiftCard = async (req, res) => {
    const {public_id} = req.body;
    try {
            const check = await GiftCard.find({picture_cloudId: public_id});
            console.log(check);
            if (check === null || check.length() < 1) {
                // deleting from cloud
                const cloudFile = await cloudinary.uploader.destroy(public_id);
                
                return res.status(200).json({
                    data: cloudFile,
                    success: true,
                    message: 'giftcard successfully deleted.'
                });
            }
            return res.status(401).json({
                success: false,
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
                success: false,
                message: 'giftcard not found'
            });
        }
        const giftcard = {...check.toObject()}
        return res.status(200).json({
            success: true,
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a giftcard transaction
exports.getGiftCardTransaction = async (req, res) => {
    try {
        const check = await GiftCardTransaction.findOne({ _id: req.params.id});
        if (!check) {
            return res.status(204).json({
                success: true,
                message: 'giftcard transaction not found'
            });
        }
        const giftcard = {...check.toObject()}
        return res.status(200).json({
            success: true,
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a giftcard transaction
exports.setGiftCardTransaction = async (req, res) => {
    const {status} = req.body;
    if (!Object.values(Status).includes(status)) {
        return res.status(400).json({
            success: false,
            message: "invalid transaction state : status can either be 'approved' 'pending', or 'failed'"
        });
    }
    try {
        const check = await GiftCardTransaction.findByIdAndUpdate({ _id: req.params.id}, { status }, {new: true});
        if (!check) {
            return res.status(404).json({
                success: true,
                message: 'giftcard transaction not found'
            });
        }
        const giftcard = {...check.toObject()}
        return res.status(200).json({
            success: true,
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a user's giftcard transactions
exports.getUserGiftCardTransactions = async (req, res) => {
    const user_id  = req.params.id;
    try {
        console.log(user_id);
        const check = await GiftCardTransaction.find({ user_id });
        if (!check) {
            return res.status(404).json({
                success: true,
                message: 'giftcard transactions not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: check
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for getting a user's giftcard transactions
exports.getAllGiftCardTransactions = async (req, res) => {
    try {
        const check = await GiftCardTransaction.find();
        if (!check) {
            return res.status(404).json({
                success: true,
                message: 'giftcard transactions not found'
            });
        }
        
        return res.status(200).json({
            success: true,
            data: check
        });
    } catch (error) {
        return serverError(res, error);
    }
}

// approving a submitted giftcard by id
exports.setTransactionGiftCardState = async (req, res) => {
    const {id} = req.params;
    const {card_id, state} = req.body;

    if (!['approved','pending', 'failed'].includes(state)) {
        return res.status(400).json({
            success: false,
            message: `invalid state`
        });
    }
    try {
        GiftCardTransaction.updateOne(
            {
              _id: ObjectId(id),
              'cards._id': ObjectId(card_id)
            },
            {
              $set: {
                'cards.$.state': state
              }
            },
            function(err, result) {
              if (err) {
                console.log(err);
                return serverError(res, err);
              } else {
                console.log(result);
                return res.status(200).json({
                    data: result,
                    success: true,
                    message: `Successfully ${state} card state`
                });
              }
            }
          );
          
    } catch (error) {
        return serverError(res, error);
    }
}

// temporarily delete a giftcard
exports.setGiftCardInactive = async (req, res) => {
    const {id} = req.params;
    try {
        const giftcard = await GiftCard.findByIdAndUpdate({ _id: id }, { active: false }, { new: true });
        if (giftcard) {
                return res.status(200).json({
                    data: giftcard,
                    success: true,
                    message: `Successfully Deleted`
                });
        } else {
                return res.status(404).json({
                    success: false,
                    message: "giftcard not found"
                  });
        }
    } catch (error) {
        return serverError(res, error);
    }
}

// get all giftcards, both active and inactive or either one by passing the active parameter.
exports.getAllGiftCards = async (req, res) => {
    const {pageSize, page, active} = req.params;
    const cacheKey = 'allgiftcards'

    try {
        // Check if the result is already cached
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
        return res.status(200).json({
            data: cachedData,
            success: true,
            message: 'Cached result',
        });
        }
        const giftcards = await GiftCard.find(active? {active: active}: {})
                                .limit(pageSize? +pageSize : 30 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (giftcards) {
                setCacheData(cacheKey, giftcards, (60 * 5 * 1000));
                return res.status(200).json({
                    data: giftcards,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return res.status(404).json({
                    success: false,
                    message: "No giftcards found"
                  });
        }
          
    } catch (error) {
        return serverError(res, error);
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
                success: false,
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
            success: true,
            data: giftcard
        });
    } catch (error) {
        return serverError(res, error);
    }
}

//permanently deleting a giftcard by id
exports.deleteGiftCard = async (req, res) => {
    try {
        const giftcard = await GiftCard.findByIdAndDelete({ _id: req.params.id }, { useFindAndModify: false});
        if (giftcard) {
                return res.status(200).json({
                data: giftcard,
                success: true,
                message: `Successfully Deleted`
              });
        } else {
                return res.status(404).json({
                    success: false,
                    message: "giftcard not found"
                  });
        }
          
    } catch (error) {
        return serverError(res, error);
    }
}

// --------------------------------------------------------- //

// --- Rates --- //
// get all giftcard rates, both active and inactive or either one by passing the active parameter.
exports.getAllGiftCardRates = async (req, res) => {
    const {pageSize, page, active} = req.params;
    const cacheKey = 'giftcardrates'

    try {
        // Check if the result is already cached
        const cachedData = getCacheData(cacheKey);
        if (cachedData) {
        return res.status(200).json({
            data: cachedData,
            success: true,
            message: 'Cached result',
        });
        }
        const giftcards = await GiftCardRate.find(active? {active: active}: {})
                                .limit(pageSize? +pageSize : 30 )
                                .skip(page? (+page - 1) * +pageSize : 0)
                                .exec();
        if (giftcards) {
                setCacheData(cacheKey, giftcards, (60 * 5 * 1000));
                return res.status(200).json({
                    data: giftcards,
                    success: true,
                    message: `Successfull`
                });
        } else {
                return res.status(404).json({
                    success: false,
                    message: "No giftcards found"
                  });
        }
          
    } catch (error) {
        return serverError(res, error);
    }
}

// controller for creating a supported giftcard rate
exports.createGiftCardRate = async (req, res) => {
    const {giftCardId, rate, currency, cardType} = req.body;
    try {

        // checking if there is already an active rate document with that currency, card type and giftcard
        const check = await GiftCardRate.findOne({ giftCardId, cardType, 'currency.code': currency?.code, active: true });
        if (!check) {
            
            GiftCardRate.create({ giftCardId, rate, cardType, currency}, (error, result)=>{
                if (error) {
                    return res.status(500).json({
                        data: error,
                        success: false,
                        message: 'failed to create giftcard rate'
                    });
                }
                return res.status(201).json({
                    data: result,
                    status: 'success',
                    message: 'giftcard rate successfully created.'
                });
            });
            
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