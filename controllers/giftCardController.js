// const bcrypt = require('bcrypt');
// const Wallet = require('../models/walletModel.js');
const mongoose = require("mongoose");
const GiftCard = require("../models/giftCardModel");
const GiftCardRate = require("../models/giftCardRateModel");
const cloudinary = require("../middlewares/cloudinary.js");
const Wallet = require("../models/walletModel.js");
const { serverError } = require("../utils/services.js");
const GiftCardTransaction = require("../models/giftcardTransactionModel");
const { createTransaction,/**, checkTransactionHelper**/ 
createApproveTransactionHelper} = require("../models/repositories/transactionRepo");
const { Status, operations, transactionTypes, transactionDirectionTypes } = require("../utils/constants");
const { getCacheData, setCacheData } = require("../utils/cache");
const ObjectId = mongoose.Types.ObjectId;
const SupportedCurrencies = require("../utils/currencies.json");
// const { creditWalletHelper } = require("./walletController.js");


// ------------GIFTCARD-MANAGEMENT----------- //

// controller for creating a supported giftcard
exports.createGiftCard = async (req, res) => {
  const { name, description } = req.body;
  try {
    const check = await GiftCard.findOne({ name: name });
    if (!check) {
      // checking the cloudiinary upload from multer
      const cloudFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "Alphacrunch/Giftcards",
      });
      const picture_url = cloudFile.secure_url;
      const picture_cloudId = cloudFile.public_id;
      const giftcard = await GiftCard.create({
        name,
        description,
        picture_url,
        picture_cloudId,
      });
      return res.status(201).json({
        data: giftcard,
        status: "success",
        message: "giftcard successfully created.",
      });
    } else {
      return res.status(400).json({
        status: "failed",
        message: "card already exists",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for starting a giftcard trading transaction
exports.createGiftCardTransaction = async (req, res) => {
  // extract data from the request body
  const {
    receiverWalletId,
    giftcard_id,
    total_amount,
    cards,
    description,
  } = req.body;

  const transaction_direction = transactionDirectionTypes.credit;
  const amount = total_amount;


  try {
    const check = await Wallet.findById(receiverWalletId);
    if (check !== null) {
      //create transactiondocument
      const transaction = await createTransaction(
        check.user_id,
        description,
        amount,
        operations.sellGiftcard,
        transactionTypes.giftcard,
        transaction_direction
      );
      // create a new GiftCardTransaction document
     const result = await GiftCardTransaction.create(
        {
          reciever_wallet_number: check.wallet_number,
          user_id: req.user.id,
          giftcard_id,
          cards: cards,
          transaction_number: transaction.transaction_number,
          total_amount_expected: amount,
          description: description,
        },
        async (error, result) => {
          if (error) {
            console.log(error);
            return serverError(res, error);
          } else {
            return res.status(201).json({
              data: result,
              transaction,
              success: true,
              message: "giftcard transaction initiallized.",
            });
          }
        }
      );
    } else {
      return res.status(400).json({
        success: false,
        message: "wallet not found",
      })
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// exports.creditUserForGiftcardTransaction = async (req, res) => {
//   const { transaction_number, amount } = req.body;
//   try {
//     const checkGiftcardTransaction = await GiftCardTransaction.findOne({
//       transaction_number: transaction_number,
//     });
//     if (checkGiftcardTransaction === null){
//       return res.status(404).json({
//         success: false,
//         message: "transaction not found",
//       });
//     }
//     const checkTransaction = await checkTransactionHelper(checkGiftcardTransaction.transaction_number);
//     if (checkTransaction.status !== Status.successful){ 
//       return res.status(400).json({
//         success: false,
//         message: "transaction status is not successful",
//       });
//     }
//     if(checkTransaction){
//       return res.status(400).json({
//         success: false,
//         message: "transaction has a failed status",
//       });
//     }
//     if(checkGiftcardTransaction.status === Status.failed){
//       return res.status(400).json({
//         success: false,
//         message: "transaction has a failed status",
//       });
//     }


//   const creditUser = await creditWalletHelper(checkGiftcardTransaction.reciever_wallet_number, amount, checkGiftcardTransaction.transaction_number);
  
//   } catch (error) {
//     return serverError(res, error);
//   }
// }

// controller for uploading transaction card
exports.uploadGiftCard = async (req, res) => {
  const { user_id, date } = req.body;
  try {
    // checking the cloudiinary upload from multer
    const cloudFile = await cloudinary.uploader.upload(req.file.path, {
      folder: `Alphacrunch/Giftcards/${user_id}/${date}`,
    });

    return res.status(201).json({
      data: cloudFile,
      success: true,
      message: "giftcard successfully uploaded.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for deleting uploaded transaction card
exports.deleteUploadedGiftCard = async (req, res) => {
  const { public_id } = req.body;
  try {
    const check = await GiftCard.find({ picture_cloudId: public_id });
    console.log(check);
    if (check === null || check.length() < 1) {
      // deleting from cloud
      const cloudFile = await cloudinary.uploader.destroy(public_id);

      return res.status(200).json({
        data: cloudFile,
        success: true,
        message: "giftcard successfully deleted.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "you are not allowed to delete this card, or wrong route",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting a giftcard
exports.getGiftCardById = async (req, res) => {
  const cacheKey = `giftcard_${req.params.id}`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const check = await GiftCard.findOne({ _id: req.params.id });
    if (!check) {
      return res.status(204).json({
        success: false,
        message: "giftcard not found",
      });
    }
    const giftcard = { ...check.toObject() };
    if (giftcard) {
      setCacheData(cacheKey, giftcard, 60 * 5 * 1000);
      return res.status(200).json({
        success: true,
        data: giftcard,
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting a giftcard transaction
exports.getGiftCardTransaction = async (req, res) => {
  const cacheKey = `giftcardtransaction_${req.params.id}`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const check = await GiftCardTransaction.findOne({ _id: req.params.id }).populate("cards.item_card_rate");
    if (!check) {
      return res.status(204).json({
        success: true,
        message: "giftcard transaction not found",
      });
    }
    const giftcard = { ...check.toObject() };
    if (giftcard) {
      setCacheData(cacheKey, giftcard, 60 * 5 * 1000);
      return res.status(200).json({
        success: true,
        data: giftcard,
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for adding a card to giftcard transaction
exports.addCardToGiftCardTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_item, amount, item_card_rate } = req.body;

    const giftCardTransaction = await GiftCardTransaction.findById(id);
    if (!giftCardTransaction) {
      return res.status(404).json({
        success: false,
        message: "Gift Card Transaction not found",
      });
    }

    const newCard = {
      card_item,
      amount,
      item_card_rate,
    };

    giftCardTransaction.cards.push(newCard);
    await giftCardTransaction.save();
    await updateTransactionAmountHelper(giftCardTransaction.transaction_number, giftCardTransaction.total_amount_expected);

    return res.status(201).json({
      data: giftCardTransaction,
      success: true,
      message: "Card added successfully",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting a giftcard transaction
exports.setGiftCardTransaction = async (req, res) => {
  const { status } = req.body;
  if (!Object.values(Status).includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "invalid transaction state : status can either be 'approved' 'pending', or 'failed'",
    });
  }
  try {
    const check = await GiftCardTransaction.findById({ _id: req.params.id });
    if (!check) {
      return res.status(404).json({
        success: true,
        message: "giftcard transaction not found",
      });
    }

    const checkCardsApproved = check.cards.every(
      (card) => card.state === Status.approved
    );
    const checkCardsFailed = check.cards.every(
      (card) => card.state === Status.failed
    );
    if (checkCardsApproved) {
      const updated = await GiftCardTransaction.findByIdAndUpdate(
        { _id: req.params.id },
        { status: Status.approved },
        { new: true }
      );
      const giftcard = { ...updated.toObject() };
      return res.status(200).json({
        message: "all cards are approved so transaction approved",
        success: true,
        data: giftcard,
      });
    } else if (checkCardsFailed) {
      const updated = await GiftCardTransaction.findByIdAndUpdate(
        { _id: req.params.id },
        { status: Status.failed },
        { new: true }
      );
      const giftcard = { ...updated.toObject() };
      return res.status(200).json({
        message: "all cards are failed so transaction failed",
        success: true,
        data: giftcard,
      });
    }

    const updated = await GiftCardTransaction.findByIdAndUpdate(
      { _id: req.params.id },
      { status },
      { new: true }
    );

    const giftcard = { ...updated.toObject() };

    await createApproveTransactionHelper(transaction)
    return res.status(200).json({
      success: true,
      data: giftcard,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting a user's giftcard transactions
exports.getUserGiftCardTransactions = async (req, res) => {
  const cacheKey = `giftcard_${req.params.id}`;
  const user_id = req.params.id;
  try {
    console.log(user_id);
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const check = await GiftCardTransaction.find({ user_id }).populate("cards.item_card_rate");
    if (!check) {
      return res.status(404).json({
        success: true,
        message: "giftcard transactions not found",
      });
    }

    setCacheData(cacheKey, check, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
      data: check,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting all giftcard transactions
exports.getAllGiftCardTransactions = async (req, res) => {
  const cacheKey = "allgiftcardtransactions";
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const check = await GiftCardTransaction.find().populate("cards.item_card_rate");
    if (!check) {
      return res.status(404).json({
        success: true,
        message: "giftcard transactions not found",
      });
    }
    setCacheData(cacheKey, check, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
      data: check,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// approving a submitted giftcard by id
exports.setTransactionGiftCardState = async (req, res) => {
  const { id } = req.params;
  const { card_id, state } = req.body;

  if (!["approved", "pending", "failed"].includes(state)) {
    return res.status(400).json({
      success: false,
      message: `invalid state`,
    });
  }

  try {
    // Use Mongoose's findOneAndUpdate method to trigger pre-hooks
    const result = await GiftCardTransaction.findOneAndUpdate(
      {
        _id: ObjectId(id),
        "cards._id": ObjectId(card_id),
      },
      {
        $set: {
          "cards.$.state": state,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Gift card transaction or card not found",
      });
    }

    return res.status(200).json({
      data: result,
      success: true,
      message: `Successfully ${state} card state`,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// temporarily delete a giftcard
exports.setGiftCardInactive = async (req, res) => {
  const { id } = req.params;
  try {
    const giftcard = await GiftCard.findByIdAndUpdate(
      { _id: id },
      { active: false },
      { new: true }
    );
    if (giftcard) {
      return res.status(200).json({
        data: giftcard,
        success: true,
        message: `Successfully Deleted`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "giftcard not found",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// get all giftcards, both active and inactive or either one by passing the active parameter.
exports.getAllGiftCards = async (req, res) => {
  const { pageSize, page, active } = req.params;
  const cacheKey = "allgiftcards";
  
  try {
    // Check if the result is already cached
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const giftcards = await GiftCard.find(active ? { active: active } : {})
      .limit(pageSize ? +pageSize : 30)
      .skip(page ? (+page - 1) * +pageSize : 0)
      .exec();
    if (giftcards) {
      setCacheData(cacheKey, giftcards, 60 * 5 * 1000);
      return res.status(200).json({
        data: giftcards,
        success: true,
        message: `Successfull`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No giftcards found",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for updating a giftcard
exports.updateGiftCard = async (req, res) => {
  const { name, rate, description } = req.body;
  let picture_url = undefined;
  let picture_cloudId = undefined;
  try {
    const check = await GiftCard.findOne({ id: req.params.id });
    if (!check) {
      return res.status(204).json({
        success: false,
        message: "card not found",
      });
    }
    if (req.file) {
      // cloudiinary upload from multer
      const cloudFile = await cloudinary.uploader.upload(
        req.file.path,
        { folder: "Alphacrunch/Giftcards" },
        (error, result) => {
          if (error) {
            console.log("Error uploading file:", error);
          } else {
            console.log("File uploaded successfully:", result);
          }
        }
      );
      // Retrieving card pic cloudinary public id if it exists.
      if (check.picture_cloudId) {
        await cloudinary.uploader.destroy(
          check.picture_cloudId,
          (error, result) => {
            if (error) {
              console.log("Error deleting file:", error);
            } else {
              console.log("File deleted successfully:", result);
            }
          }
        );
      }
      picture_url = cloudFile.secure_url;
      picture_cloudId = cloudFile.public_id;
    }

    const data = { name, rate, description, picture_url, picture_cloudId };
    const giftcard = await GiftCard.findOneAndUpdate(
      { id: check._id },
      { name, rate, description, picture_url, picture_cloudId },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      data: giftcard,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

//permanently deleting a giftcard by id
exports.deleteGiftCard = async (req, res) => {
  try {
    const giftcard = await GiftCard.findByIdAndDelete(
      { _id: req.params.id },
      { useFindAndModify: false }
    );
    if (giftcard) {
      return res.status(200).json({
        data: giftcard,
        success: true,
        message: `Successfully Deleted`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "giftcard not found",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// --------------------------------------------------------- //

// ----------------------- Rates --------------------------- //
// get all giftcard rates, both active and inactive or either one by passing the active parameter.
exports.getAllGiftCardRates = async (req, res) => {
  const { pageSize, page, active } = req.params;
  const cacheKey = "allgiftcardrates";

  try {
    // Check if the result is already cached
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const giftcardRates = await GiftCardRate.find(
      active ? { active: active } : {}
    )
      .limit(pageSize ? +pageSize : 30)
      .skip(page ? (+page - 1) * +pageSize : 0)
      .exec();
    if (giftcardRates) {
      setCacheData(cacheKey, giftcardRates, 60 * 5 * 1000);
      return res.status(200).json({
        data: giftcardRates,
        success: true,
        message: `Successfull`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No giftcards found",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for creating a supported giftcard rate
exports.createGiftCardRate = async (req, res) => {
  const { giftCardId, rate, currency, cardType } = req.body;
  try {
    // checking if there is already an active rate document with that currency, card type and giftcard
    const check = await GiftCardRate.findOne({
      giftCardId,
      cardType,
      "currency.code": currency?.code,
      active: true,
    });
    if (!check) {
      GiftCardRate.create(
        { giftCardId, rate, cardType, currency },
        (error, result) => {
          if (error) {
            return res.status(500).json({
              data: error,
              success: false,
              message: "failed to create giftcard rate",
            });
          }
          return res.status(201).json({
            data: result,
            status: "success",
            message: "giftcard rate successfully created.",
          });
        }
      );
    } else {
      return res.status(400).json({
        status: "failed",
        message: "card already exists",
      });
    }
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for getting a giftcard transaction
exports.getGiftCardRates = async (req, res) => {
  const cacheKey = "giftcardrates" + req.params.giftcardId;
  try {
    // Check if the result is already cached
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const check = await GiftCardRate.find({
      giftCardId: req.params.giftcardId,
      active: true,
    });
    if (!check) {
      return res.status(204).json({
        success: true,
        message: "giftcard rates not found",
      });
    }

    const giftcardRates = check;
    setCacheData(cacheKey, giftcardRates, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
      data: giftcardRates,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for updating a giftcard rate
exports.updateGiftCardRate = async (req, res) => {
  const { rate, cardType } = req.body;
  try {
    const check = await GiftCardRate.findOne({ id: req.params.id });
    if (!check) {
      return res.status(204).json({
        success: false,
        message: "giftcard rate not found",
      });
    }

    const giftcard = await GiftCardRate.findOneAndUpdate(
      { id: check._id },
      { rate, cardType },
      { new: true, omitUndefined: true }
    );

    return res.status(200).json({
      success: true,
      data: giftcard,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// controller for updating a giftcard rate
exports.setGiftCardRateState = async (req, res) => {
  const { active } = req.body;
  try {
    GiftCardRate.findOneAndUpdate(
      { _id: req.params.giftcardRateId },
      { active },
      { new: true },
      (error, result) => {
        if (error) {
          return res.status(500).json({
            data: error,
            success: false,
            message: "failed to set giftcard rate state",
          });
        }
        return res.status(200).json({
          success: true,
          data: result,
        });
      }
    );
  } catch (error) {
    return serverError(res, error);
  }
};

exports.getGiftCardSupportedAllCurrencies = async (req, res) => {
  try {
    const currencies = SupportedCurrencies.currencies;
    
    return res.status(200).json({
      success: true,
      data: currencies,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.editGiftCardCurrency = async (req, res) => {
  const { id } = req.params;
  const { code, name, symbol } = req.body;

  try {
    const updatedCurrency = await GiftCardRate.findOneAndUpdate(
      { 'currency._id': id },
      { 'currency.code': code, 'currency.name': name, 'currency.symbol': symbol },
      { new: true, omitUndefined: true }
    );

    if (!updatedCurrency) {
      return res.status(404).json({
        success: false,
        message: 'Currency not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedCurrency,
    });
  } catch (error) {
    return serverError(res, error);
  }
};
