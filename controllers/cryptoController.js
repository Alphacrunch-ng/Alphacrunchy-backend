const { makeBitpowrRequest } = require("../utils/services");
const CryptoAssetModel = require("../models/cryptoAssetModel");
const CryptoWalletModel = require("../models/cryptoWalletModel");
const { serverError } = require("../utils/services");
const { getCacheData, setCacheData } = require("../utils/cache");
const cloudinary = require("../middlewares/cloudinary.js");
const User = require("../models/userModel.js");

exports.getAssets = async (req, res) => {
  const cacheKey = `cryptoassets`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }

    const responseData = await CryptoAssetModel.find({
      account_uid: process.env.BITPOWR_ACCOUNT_WALLET_ID,
      isDeleted: false,
    });

    if (responseData) {
      setCacheData(cacheKey, responseData, 60 * 5 * 1000);
      return res.status(200).json({
        success: true,
        data: responseData,
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    serverError(res, error);
  }

  // const cacheKey = `cryptoassets_${process.env.BITPOWR_ACCOUNT_WALLET_ID}`;
  // try {
  //   const cachedData = getCacheData(cacheKey);
  //   if (cachedData) {
  //     return res.status(200).json({
  //       data: cachedData,
  //       success: true,
  //       message: "Cached result",
  //     });
  //   }

  //   const responseData = await makeBitpowrRequest(
  //       `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_WALLET_ID}/assets`
  //       );

  //   if (responseData) {
  //     setCacheData(cacheKey, responseData, 60 * 5 * 1000);
  //     return res.status(200).json({
  //       success: true,
  //       data: responseData,
  //     });
  //   }
  //   return res.status(404).json({ success: false });
  // } catch (error) {
  //   serverError(res, error);
  // }
};

exports.addAdminAsset = async (req, res) => {
  // the asset should have been added on the bitpowr dashboard
  const { chain_name } = req.body;
  try {
    console.log(chain_name);
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_WALLET_ID}/assets`
    );
    if (!responseData.data) {
      return res.status(404).json({
        success: false,
        message: "unable to check provider",
      });
    }
    const assets = Array(...responseData.data);
    const check = assets.filter((asset) => {
      return asset.chain.toUpperCase() === String(chain_name).toUpperCase();
    });
    if (check.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Asset not found on the provider",
      });
    }

    const ifExists = await CryptoAssetModel.findOne({
      chain: String(chain_name).toUpperCase(),
    });
    if (ifExists) {
      return res.status(400).json({
        success: false,
        message: "Asset already exists",
      });
    }
    console.log("check: ", check[0]);

    const cloudFile = await cloudinary.uploader.upload(req.file.path, {
      folder: "Alphacrunch/crypto",
    });
    const icon = cloudFile.secure_url;
    const assetData = {
      account_uid: process.env.BITPOWR_ACCOUNT_WALLET_ID,
      icon: icon,
      uid: check[0].uid,
      guid: check[0].guid,
      label: check[0].label,
      isDeleted: check[0].isDeleted,
      isArchived: check[0].isArchived,
      isContract: check[0].isContract,
      chain: check[0].chain,
      network: check[0].network,
      mode: check[0].mode,
      assetType: check[0].assetType,
      autoForwardAddress: check[0].autoForwardAddress,
      createdAt: check[0].createdAt,
      balance: check[0].balance,
    };
    const asset = await CryptoAssetModel.create(assetData);

    return res.status(200).json({
      success: true,
      asset,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getUserAssets = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getAssetById = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getAssetBalance = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getAssetTransactions = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getCryptoTransactionById = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.createCryptoTransaction = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.createUserCryptoAccount = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ 
        success: false, 
        message: "user not found" 
      });

    const ifExists = await CryptoWalletModel.findOne({
      externalId: user._id,
    });
    console.log(ifExists, userId);
    if (ifExists) {
      return res.status(400).json({
        success: false,
        message: "User wallet already exists",
      });
    }
    const data = {
      externalId: userId,
      name: user.fullName,
    };
    console.log(data);
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_WALLET_ID}/sub-accounts`,
      "post",
      data
    );
    if (responseData) {
      const data = {
        uid: responseData.data.uid,
        name: responseData.data.name,
        externalId: responseData.data.externalId,
        isDeleted: responseData.data.isDeleted,
        isArchived: responseData.data.isArchived,
        organizationId: responseData.data.organizationId,
        network: responseData.data.network,
        createdAt: responseData.data.createdAt,
        updatedAt: responseData.data.updatedAt,
        mode: responseData.data.mode,
        accountId: responseData.data.accountId,
        addresses: responseData.data.addresses,
      };
      const wallet = await CryptoWalletModel.create(data);
      if (wallet) {
        return res.status(201).json({
          success: true,
          message: wallet,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Error creating wallet",
      });
    }
  } catch (error) {
    if (error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: error?.response?.data?.message,
      });
    }
    serverError(res, error);
  }
};
