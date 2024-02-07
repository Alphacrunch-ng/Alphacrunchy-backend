const { serverError } = require("../utils/services");


exports.getAssets = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            data: data,
        });    
    } catch (error) {
        serverError(res, error);
    }
    
};

exports.getUserAssets = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.getAssetById = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.getAssetBalance = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.getAssetTransactions= async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.getCryptoTransactionById = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.createCryptoTransaction = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}

exports.createUserCryptoAccount = async (req, res) => { // This would create a subAccount on smileId
    try {
        return res.status(200).json({
            success: true,
        })
    } catch (error) {
        serverError(res, error);
    }
}
