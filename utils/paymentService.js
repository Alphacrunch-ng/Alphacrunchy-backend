
const axios = require('axios');
const querystring = require('querystring');

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

exports.createdVirtualAccount = () => {
    
}