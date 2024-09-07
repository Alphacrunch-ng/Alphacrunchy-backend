const { makeBitpowrRequest, userRequestError, serverErrorResponse, createdSuccessFullyResponse } = require("../utils/services");
const CryptoAssetModel = require("../models/cryptoAssetModel");
const CryptoWalletModel = require("../models/cryptoWalletModel");
const CryptoRate = require("../models/cryptoRateModel");
const { serverError } = require("../utils/services");
const { getCacheData, setCacheData, deleteCacheData } = require("../utils/cache");
const cloudinary = require("../middlewares/cloudinary.js");
const User = require("../models/userModel.js");
const { roles } = require("../utils/constants.js");
const { isValidAmount } = require("../utils/validators/generalValidators.js");
const { debitWalletHelper } = require("./walletController.js");
const { createVaultWalletHelper: createVaultWallet, getSupportedAssetsFromSourceHelper, getAllVaultAccountsHelper } = require("../utils/fireblockServices.js");
const { notFoundErrorResponse, badRequestResponse, successResponse, cachedResponse } = require("../utils/apiResponses.js");
const { getSupportedAssetsHelper } = require("../models/repositories/supportedAssetsRepo.js");

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

/**
 * @api {get} /crypto/supported-assets Get Supported Assets
 * @apiName getSupportedAssets
 * @apiGroup Crypto
 * @apiDescription Get all supported crypto assets
 * @apiSuccess {Object[]} data Array of supported assets with name, symbol, icon and id
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "name": "Bitcoin",
 *           "symbol": "BTC",
 *           "icon": "https://example.com/icon.png",
 *           "id": "bitcoin"
 *         },
 *         {
 *           "name": "Ethereum",
 *           "symbol": "ETH",
 *           "icon": "https://example.com/icon2.png",
 *           "id": "ethereum"
 *         }
 *       ]
 *     }
 * @apiError (404) Error Assets not found
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "message": "Assets not found"
 *     }
 */
exports.getSupportedAssets = async (req, res) => {
  const cacheKey = `supportedcryptoassets`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return cachedResponse({
        res,
        data: cachedData,
        message: "Cached result"
      })
    }

    const responseData = await getSupportedAssetsHelper();

    if (responseData) {
      setCacheData(cacheKey, responseData, 60 * 5 * 1000);
      return successResponse({
        res,
        data: responseData
      });
    }
    return notFoundErrorResponse({
      success: false, 
      message: "Assets not found"
    });
  } catch (error) {
    return serverErrorResponse(res, error);
  }
};

/**
 * @api {get} /crypto/supported-assets-source Get Supported Assets From Source
 * @apiName getSupportedAssetsFromSource
 * @apiGroup Crypto
 * @apiDescription Get all supported crypto assets from source
 * @apiSuccess {Object[]} data Array of supported assets with name, type, contractAddress, nativeAsset and decimals
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
                "id": "BTC",
                "name": "Bitcoin",
                "type": "BASE_ASSET",
                "contractAddress": "",
                "nativeAsset": "BTC",
                "decimals": 8
            },
 *         {
                "id": "ETH",
                "name": "Ethereum",
                "type": "BASE_ASSET",
                "contractAddress": "",
                "nativeAsset": "ETH",
                "decimals": 18
            },
 *       ]
 *     }
 * @apiError (404) Error Assets not found
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "message": "Assets not found"
 *     }
 */
exports.getSupportedAssetsFromSource = async (req, res) => {
  const cacheKey = `supportedcryptoassets`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return cachedResponse({
        res,
        data: cachedData,
        message: "Cached result"
      })
    }

    const responseData = await getSupportedAssetsFromSourceHelper();

    if (responseData) {
      setCacheData(cacheKey, responseData, 60 * 5 * 1000);
      return successResponse({
        res,
        data: responseData
      });
    }
    return notFoundErrorResponse({
      success: false, 
      message: "Assets not found"
    });
  } catch (error) {
    return serverErrorResponse(res, error);
  }
};

exports.getCryptoWallet = async (req, res) => {
  const { id } = req.user;
  let { source } = req.query;
  source = Boolean(source);
  const cacheKey = `cryptowallet${id}`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }

    const cryptoWallet = await CryptoWalletModel.findOne({ externalId: id }).exec();
    if (!cryptoWallet){
      return res.status(404).json({
        success: true,
        data: "Wallet not found",
      });
    }
    if(source){
      const responseData = await makeBitpowrRequest(
        `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_WALLET_ID}/sub-accounts/${cryptoWallet.uid}?orderBy=asc`,
        "get"
      );
      if (responseData) {
        setCacheData(cacheKey, responseData.data, 60 * 5 * 1000);
        return res.status(200).json({
          success: true,
          data: responseData.data,
        })
      } else {
        return res.status(404).json({
          success: false,
          message: "Error getting sub accounts",
        })
      }
    }
    setCacheData(cacheKey, cryptoWallet, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
      data: cryptoWallet
    });
  } catch (error) {
    return serverError(res, error);
  }
}

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

exports.addUserAsset = async (req, res) => {
  // the asset should have been added on the bitpowr dashboard
  const { chain_name } = req.body;
  const user_id = req.user.id;
  try {
    const userCryptoWallet = await CryptoWalletModel.findOne({ externalId : user_id });
    if (!userCryptoWallet){
      return  res.status(401).send("Please create a crypto wallet first");
    }
    //checking if the user has that asset already on our database
    const ifExists = await CryptoAssetModel.findOne({
      chain: String(chain_name).toUpperCase(),
    });
    if (ifExists) {
      return res.status(400).json({
        success: false,
        message: "Asset already exists",
      });
    }


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

    const ifExistsOnDatabase = await CryptoAssetModel.find({
      chain: String(chain_name).toUpperCase(), account_uid: process.env.BITPOWR_ACCOUNT_WALLET_ID
    });

    if(ifExistsOnDatabase.length < 1){
      return res.status(400).json({
        success: false,
        message: "Asset not foundr",
      })
    }

    const adminAsset = ifExistsOnDatabase.find((item)=> item.chain === String(chain_name).toUpperCase())
    console.log("check: ", check[0]);

    if(!adminAsset){
      return res.status(400).json({
        success: false,
        message: "Asset not foundr",
      })
    }

    const icon = adminAsset.icon;
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
  let { source, uid } = req.body;
  // convert source to boolean irrespective of the data type
  source = Boolean(source);

  const cacheKey = `cryptoassets`+ uid + source;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }

    const wallet = await CryptoWalletModel.findOne({
      externalId: req.user.id
    });
    if (!wallet){
      return res.status(400).json({
        success: false,
        message: "Wallet not found"
      });
    }

    const uid = wallet.uid;

    let responseData;
    if (source) {
      responseData = await makeBitpowrRequest(
        `${process.env.BITPOWR_BASEURL}assets/${uid}`
        );
    } else {
      responseData = await CryptoAssetModel.find({
        uid,
        isDeleted: false,
      });
    }
  

    

    if (responseData) {
      if(responseData.status === 404){
        return res.status(404).json({ 
          success: false,
          message: responseData.data.message
         });
      }
      setCacheData(cacheKey, responseData, 60 * 5 * 1000);
      return res.status(200).json({
        success: true,
        data: responseData,
      });
    }
    return res.status(404).json({ success: false });
  } catch (error) {
    return serverError(res, error);
  }
};

exports.getAssetById = async (req, res) => {
  const asset_id = req.params.id;
  try {
    const asset = await CryptoAssetModel.findById(asset_id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }
    const wallet = await CryptoWalletModel.findById(asset.account_uid);
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    if ((wallet.externalId !== req.user.id) && (req.user.role !== roles.admin)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      })
    }

    return res.status(200).json({
      success: true,
      asset
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.getAssetBalance = async (req, res) => {
  const asset_id = req.params.id;
  try {
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/assets/${asset_id}/balance`,
      'GET'
    );
    return res.status(200).json({
      success: true,
      data: responseData?.data
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
  // expected input at bitpowr
//   {
//     "address": "2N35FKTBaEAJ8TJA98B4h7tfmLoVUfp2qNY",
//     "cryptoAmount": 0.000002,
//     "assetType": "BTC",
//     "walletId": {{accountId}}
// }
  const { address, cryptoAmount, assetType, walletId } = req.body;
  try {
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

  /**
   * @api {post} /crypto/:id/create-subaccount
   * @apiName createUserCryptoAccount
   * @apiGroup Crypto
   * @apiDescription Create a subaccount on the bitpowr platform
   * @apiParam {String} id The id of the user to create the subaccount for
   * @apiSuccess {Object} data The created subaccount
   * @apiError {Object} 404 Error creating wallet
   * @apiError {Object} 400 User wallet already exists
   */
exports.createUserCryptoAccount = async (req, res) => { // create subaccount
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ 
        success: false, 
        message: "user not found" 
      });
    const account = await createVaultWallet({user_id: userId, fullname: user.fullName});

    const ifExists = await CryptoWalletModel.findOne({
      externalId: user._id,
    });
    if (ifExists) {
      return res.status(400).json({
        success: false,
        message: "User wallet already exists",
      });
    }
    const data = {
      externalId: userId,
      name: user.fullName,
      accountId: account.id,
      addresses: account.addresses,
    };

    // // create the subaccount on bitpowr
    // const responseData = await makeBitpowrRequest(
    //   `${process.env.BITPOWR_BASEURL}/accounts/${process.env.BITPOWR_ACCOUNT_WALLET_ID}/sub-accounts`,
    //   "post",
    //   data
    // );
    // if (responseData) {
    //   const data = {
    //     uid: responseData.data.uid,
    //     name: responseData.data.name,
    //     externalId: responseData.data.externalId,
    //     isDeleted: responseData.data.isDeleted,
    //     isArchived: responseData.data.isArchived,
    //     organizationId: responseData.data.organizationId,
    //     network: responseData.data.network,
    //     createdAt: responseData.data.createdAt,
    //     updatedAt: responseData.data.updatedAt,
    //     mode: responseData.data.mode,
    //     accountId: responseData.data.accountId,
    //     addresses: responseData.data.addresses,
    //   };
      const wallet = await CryptoWalletModel.create(data);
      if (wallet) {
        return createdSuccessFullyResponse({res, data: wallet, message: "Wallet created successfully"});
      }
      
      return badRequestResponse({res, message: "Error creating wallet"});

  } catch (error) {
    if (error?.response?.status === 404) {
      return notFoundErrorResponse({
        res,
        message: error?.response?.data?.message,
      })
    }
    return serverErrorResponse(res, error);
  }
};

exports.getSubAccountsFromSource = async (req, res) => {
  const cacheKey = `subaccounts`;
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return cachedResponse({
        res, 
        data: cachedData, 
        message: "Success getting sub accounts"
      });
    }
    const responseData = await getAllVaultAccountsHelper();
    if (responseData) {
      setCacheData(cacheKey, responseData, 60 * 5 * 1000);
      return successResponse({
        res,
        data: responseData,
        message: "Success getting sub accounts",
      })
    } else {
      return notFoundErrorResponse({
        res, 
        message: "Error getting sub accounts"
      });
    }
  }
  catch (error) {
    return serverErrorResponse(res, error);
  }
}

exports.buyCrypto = async (req, res) => {
  // Validate input parameters
  const { crypto_address, crypto_amount, asset_type, crypto_wallet_id } = req.body;

  if(isValidAmount(crypto_amount)){
    if(parseFloat(crypto_amount) < 0) {
      return userRequestError(res, "crypto amount must be a positive number.");
    }
  }

  try {

    const data = { address: crypto_address, cryptoAmount: crypto_amount, assetType: asset_type, walletId: crypto_wallet_id };
    const debitWallet = await debitWalletHelper();
    // create the transaction on bitpowr
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/transactions`,
      "post",
      data
    );
    if (responseData){
      if(responseData?.data?.status === "error"){
        return res.status(400).json({ 
          success: false,
          message: responseData.data.errorCode,
          status: responseData.data.status
         });
      }
      if(responseData?.status >= 400){
        return res.status(responseData?.status).json({
          success: false,
          message: responseData?.data?.message
         });
      }
      
      return res.status(200).json({
        success: true,
        data: responseData,
      });
    }
  } catch (error) {
    return serverError(res, error);
  }

  

  // response from bitpowr
  // {
  //   "status": "success",
  //   "data": {
  //     "hash": "1b6dff5b430a8b0b4bc604a23dda5aa4d7979dd11dbc25d9345bd88889ad8297",
  //     "status": "PENDING",
  //     "amount": "0.00012741",
  //     "uid": "6680c116-c803-4e46-aa99-2f261cd216ac",
  //     "assetType": "BTC",
  //     "chain": "BITCOIN",
  //     "fee": "0.00003034",
  //     "ref": "BTP-Up5Ubzb0ot#H4LtW2VbdrxoxMt7Wy1"
  //   }
  // }
}

exports.getSwapRate = async (req, res) => {
  const {sourceCurrency, sourceAmount, destinationCurrency } = req.body;
  const cacheKey = `swaprate${sourceCurrency}_${destinationCurrency}`;
  // Request to bitpowr
  // { 
  //   "sourceCurrency": "BTC",
  //   "sourceAmount": 0.0002,
  //   "destinationCurrency": "ETH"
  // }
  try {
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const data = { sourceCurrency, sourceAmount, destinationCurrency };

    // create the get swap rate on bitpowr
    const responseData = await makeBitpowrRequest(
      `${process.env.BITPOWR_BASEURL}/integration/swap/rates`,
      "post",
      data
    );
    if (responseData){
      if(responseData.status >= 400){
        return res.status(responseData.status).json({ 
          success: false,
          message: responseData.data.message
         });
      }
      setCacheData(cacheKey, responseData, 60 * 1 * 1000);  // Cache for one minute
      return res.status(200).json({
        success: true,
        data: responseData,
      });
    }
    
  } catch (error) {
    return serverError(res, error);
  }
  // Response from bitpowr
  // {
  //   "status": "success",
  //   "data": "0.00088921",
  //   "message": "Successfully fetch rate"
  // }
}


// in house crypto to naira rate controllers //
exports.getCryptoRate = async (req, res) => {
  const id = req.params.id;
  const { currencyName } = req.body;
  let cacheKey = `cryptorate_${currencyName}`;

  try {
    if(!id && !currencyName) {
      return res.status(400).json({
        success: false,
        message: "Please provide id or currencyName",
      });
    }
    // Check whether the request is cached or not
    const cachedData = getCacheData(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        data: cachedData,
        success: true,
        message: "Cached result",
      });
    }
    const cryptoCurrencyRate = id ? await CryptoRate.findById(id) : await CryptoRate.findOne({ currency: currencyName });
    if (!cryptoCurrencyRate) {
      return res.status(404).json({
        success: false,
        message: "Crypto currency rate not found",
      });
    }
    setCacheData(cacheKey, cryptoCurrencyRate, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
      data: cryptoCurrencyRate
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.createCryptoRate = async (req, res) => {
  const { currencyName, rate } = req.body;
  let cacheKey = `cryptorate_${currencyName}`;
  try {
    if(rate < 0) {
      return res.status(400).json({
        success: false,
        message: "rate must be a positive number.",
      });
    }
    const newCryptoCurrencyRate = await CryptoRate.create({
      currency: currencyName,
      rate
    });

    setCacheData(cacheKey, newCryptoCurrencyRate, 60 * 5 * 1000);

    return res.status(200).json({
      success: true,
      data: newCryptoCurrencyRate
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.updateCryptoRate = async (req, res) => {
  const cryptoId = req.params.id;
  const { rate } = req.body;
  try {
    if(rate < 0) {
      return res.status(400).json({
        success: false,
        message: "rate must be a positive number.",
      });
    }
    const updatedCryptoCurrencyRate = await CryptoRate.findOneAndUpdate(
      { id: cryptoId },
      { rate },
      { new: true, omitUndefined: true }
      );
      
    let cacheKey = `cryptorate_${updatedCryptoCurrencyRate.currency}`;
    setCacheData(cacheKey, updatedCryptoCurrencyRate, 60 * 5 * 1000);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};

exports.deleteCryptoRate = async (req, res) => {
  const cryptoId = req.params.id;
  try {
    const deletedCryptoCurrencyRate = await CryptoRate.findByIdAndDelete(cryptoId);
    let cacheKey = `cryptorate_${deletedCryptoCurrencyRate.currency}`;
    deleteCacheData(cacheKey);
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    serverError(res, error);
  }
};