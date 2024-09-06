const SupportedCryptoAsset = require("../supportedCryptoAssetModel");

/**
 * Deletes a supported crypto asset by its id or asset_id.
 * @param {Object} options - The options for deleting a supported asset.
 *   @property {string} name - The id of the supported asset to delete.
 *   @property {string} asset_id - The asset_id of the supported asset to delete.
 * @returns {Promise<SupportedCryptoAsset>} A promise that resolves with the deleted supported asset.
 */
exports.getSupportedAssetsHelper = async (options) => {
    try {
        const result = await SupportedCryptoAsset.find(options);
        return result;
    } catch (error) {
        throw error;
    }
}


/**
 * Adds a supported asset to the database
 * @param {Object} asset - Asset object with the following properties:
 *   @property {string} name - The name of the asset
 *   @property {string} asset_id - The ID of the asset
 *   @property {string} contractAddress - The contract address of the asset
 *   @property {string} nativeAsset - The native asset symbol
 *   @property {string} icon_url - The native asset symbol
 *   @property {number} decimals - The number of decimal places for the asset
 * @returns {Promise<SupportedCryptoAsset>} The newly created asset
 * @throws {Error} If there is an error creating the asset
 */
exports.addSupportedAssetHelper = async (asset) => {
    try {
        const result = await SupportedCryptoAsset.create(asset);
        return result;
    } catch (error) {
        throw error;
    }
}

/**
 * Deletes a supported crypto asset by its id or asset_id.
 * @param {Object} options - The options for deleting a supported asset.
 *   @property {string} _id - The id of the supported asset to delete.
 *   @property {string} asset_id - The asset_id of the supported asset to delete.
 * @returns {Promise<SupportedCryptoAsset>} A promise that resolves with the deleted supported asset.
 */
exports.deleteSupportedAssetHelper = async (options) => {
    try {
        const result = await SupportedCryptoAsset.findOneAndDelete(options);
        return result;
    } catch (error) {
        throw error;
    }
}