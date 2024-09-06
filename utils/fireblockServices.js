
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

exports.createVaultWalletHelper = async ({ user_id, fullname }) => {
    try {
        const response = await fireblocks.createVaultAccount(fullname, false, user_id);
        return response;
    } catch (error) {
        throw error;
    }
}

exports.getSupportedAssetsFromSourceHelper = async () => {
    try {
        const response = await fireblocks.getSupportedAssets();
        return response;
    } catch (error) {
        throw error;
    }
}