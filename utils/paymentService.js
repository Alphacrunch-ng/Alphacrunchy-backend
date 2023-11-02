
const axios = require('axios');
const querystring = require('querystring');
const { product_name } = require('./constants');
const FormData = require('form-data');

const marabaseUrl = process.env.MARABASEURL;
const encrypt_key = process.env.ENC_KEY

exports.getPaymentBanks = async () => {
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }
    const url = marabaseUrl+"/getbanks";
    const formData = {
        enc_key: encrypt_key
    }
    console.log(encrypt_key);
    const data = querystring.stringify(formData);
    try {
        const result = await axios.post(url, data, config)
        return {    
            error: result.error, 
            response: result.data
        }
    } catch (error) {
        return {    
            error: result.error, 
            response: result.data
        }
    }

}

//validate the provided bank
exports.resolveBank = async (bankCode, accountNumber) => {
    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }
    const url = marabaseUrl+"/resolvebank";
    const formData = {
        enc_key: encrypt_key,
        bank_code: bankCode,
        account_number: accountNumber
    }
    const data = querystring.stringify(formData);
    try {
        const result = await axios.post(url, data, config)
        return {    
            error: result.error, 
            response: result.data
        }
    } catch (error) {
        return {    
            error: result.error, 
            response: result.data
        }
    }

}

exports.transferToBank = async (bankCode, accountNumber, wallet_number, amount) => {

    const config = {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }
    const url = marabaseUrl+"/createtransfer";
    
    const formData = new FormData();
    formData.append('enc_key', encrypt_key);
    formData.append('bank_code', bankCode);
    formData.append('account_number', accountNumber);
    formData.append('transactionRef', wallet_number);
    formData.append('amount', amount);
    formData.append('currency', 'NGN');
    formData.append('description', product_name);
    
    try {
        const result = await axios.post(url, formData, config);
        return {    
            error: result.data?.error, 
            response: result.data
        }
    } catch (error) {
        return {    
            error: result.error, 
            response: result.data
        }
    }

}
    // const formData = {
    //     enc_key: encrypt_key,
    //     bank_code: bankCode,
    //     account_number: accountNumber,
    //     amount,
    //     currency: "NGN",
    //     description: product_name
    // }
    // const data = querystring.stringify(formData);
exports.createdVirtualAccount = () => {
    
}