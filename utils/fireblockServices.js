
const axios = require('axios');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const { product_name, frontend_link, backend_link } = require('./constants');
const FormData = require('form-data');
const { FireblocksSDK } = require('fireblocks-sdk');

const FIREBLOCKS_BASEURL = process.env.FIREBLOCKS_BASEURL; //process.env.NODE_ENV === 'development' ? process.env.FIREBLOCKS_BASEURL : process.env.FIREBLOCKS_BASEURL_LIVE;
const fireblocks_api_key = process.env.FIREBLOCKS_API_KEY_DEV; //process.env.NODE_ENV === 'development' ? process.env.FIREBLOCKS_API_KEY : process.env.FIREBLOCKS_API_SECRET_LIVE;
const fireblocks_api_secret = fs.readFileSync(path.resolve(process.cwd(), "./fireblocks_secret_dev.key"), "utf8")
const fireblocks =  new FireblocksSDK(fireblocks_api_secret, fireblocks_api_key, FIREBLOCKS_BASEURL);

/**
 * Creates a new vault account on Fireblocks for the user with the given `user_id` and `fullname`.
 * @param {Object} options - An object containing the required parameters.
 * @param {string} options.user_id - The ID of the user to create the vault account for.
 * @param {string} options.fullname - The full name of the user to be used as the name of the vault account.
 * @returns {Promise<Object>} - The response from Fireblocks containing the newly created vault account.
 * @throws {Error} - If there is an error creating the vault account.
 */
exports.createVaultWalletHelper = async ({ user_id, fullname }) => {
    try {
        const response = await fireblocks.createVaultAccount(fullname, false, user_id);
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Get all supported assets from the source (Fireblocks)
 * @returns {Promise<AssetTypeResponse[]>} Array of supported assets with name, symbol, icon and id
 */
exports.getSupportedAssetsFromSourceHelper = async () => {
    try {
        const response = await fireblocks.getSupportedAssets();
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Retrieves a list of all vault accounts, with optional filtering and pagination.
 * @param {Object} options - The options for retrieving vault accounts.
 *   @property {string} [namePrefix] - The prefix of the vault account name.
 *   @property {string} [nameSuffix] - The suffix of the vault account name.
 *   @property {number} [minAmountThreshold] - The minimum amount threshold for the vault account.
 *   @property {string} [assetId] - The asset id to filter the vault accounts by.
 *   @property {string} [orderBy] - The field to order the vault accounts by  "ASC" | "DESC".
 *   @property {number} [limit] - The limit of the number of vault accounts to retrieve.
 *   @property {string} [before] - The cursor to retrieve vault accounts before.
 *   @property {string} [after] - The cursor to retrieve vault accounts after.
 * @returns {Promise<Object>} A promise that resolves with the list of vault accounts.
 */
exports.getAllVaultAccountsHelper = async ({ namePrefix, nameSuffix, minAmountThreshold, assetId, orderBy, limit, before, after }) => {
    try {
        const response = await fireblocks.getVaultAccountsWithPageInfo({ namePrefix, nameSuffix, minAmountThreshold, assetId, orderBy, limit, before, after });
        return response;
    } catch (error) {
        throw error;
    }
}

/**
 * Adds an asset to a vault on fireblocks
 * @param {Object} options - The options for adding an asset to a vault.
 *   @property {string} vault_id - The ID of the vault to add the asset to.
 *   @property {string} asset_id - The ID of the asset to add to the vault.
 * @returns {Promise<Object>} - The response from Fireblocks.
 * @throws {Error} If there is an error creating the vault asset.
 */
exports.addAssetToVaultHelper = async ({ vault_id, asset_id }) => {
    try {
        const response = await fireblocks.createVaultAsset( vault_id, asset_id );
        return response;
    } catch (error) {
        throw error;
    }
}

// exports.deleteVaultAccount = async (vault_id) => {
//     try {
//         const response = await fireblocks.(vault_id);
//         return response;
//     } catch (error) {
//         throw error;
//     }
// }

/**
 * Generates a new address for the given asset in the given vault.
 * @param {Object} options - The options for creating the address.
 *   @property {string} vault_id - The ID of the vault to create the address in.
 *   @property {string} asset_id - The ID of the asset to create the address for.
 *   @property {string} fullname - The full name of the user to create the address for.
 *   @property {string} user_id - The ID of the user to create the address for.
 * @returns {Promise<GenerateAddressResponse>} - The response from Fireblocks.
 * @throws {Error} If there is an error creating the address.
 */
exports.createAssetAddress = async ( { vault_id, asset_id, fullname, user_id} ) => {
    try {
        const response = await fireblocks.generateNewAddress(vault_id, asset_id, fullname, user_id);
        return response;
    } catch (error) {
        throw error;
    }
}