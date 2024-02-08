const axios = require("axios");
const { makeBitpowrRequest } = require("../utils/services");
const { serverError } = require("../utils/services");
const { getCacheData, setCacheData } = require("../utils/cache");

exports.getAccounts = async (req, res) => {
  const cacheKey = `cryptoaaccount_${process.env.BITPOWR_ACCOUNT_TEST_WALLET_ID1}`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/accounts`
    );
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
};

exports.getAssets = async (req, res) => {
  const cacheKey = `cryptoassets_${process.env.BITPOWR_ACCOUNT_TEST_WALLET_ID1}`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_TEST_WALLET_ID1}/assets`
    );
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
  // This would create a subAccount on smileId
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};
