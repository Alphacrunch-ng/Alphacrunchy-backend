const axios = require("axios");
const { createJobId } = require("./services");
const smileIdentityCore = require("smile-identity-core");
const { countryCodes } = require("./constants");
const WebApi = smileIdentityCore.WebApi;
let crypto = require('crypto');

// Initialize
let partner_id = process.env.PARTNER_ID; // login to the Smile ID portal to view your partner id
let default_callback = process.env.SMILEID_CALLBACK_URL;
let api_key = process.env.API_SIGNATURE_LIVE; // copy your API key from the Smile ID portal
let sid_server = '1'; // Use '0' for the sandbox server, use '1' for production server
let baseUrl = process.env.SMILEID_BASE_URL_LIVE;

const biometericKycChecker = async (documentBase64StringImage, selfieBase64StringImage, user_id, id_type) => {

// const biometericKycChecker = async (documentBase64StringImage, selfieBase64StringImage, user_id, firstName, lastName, id_type, id_number, dob) => {
    

    const connection = new WebApi(partner_id, default_callback, api_key, sid_server);

    // Create required tracking parameters
    let partner_params = {
        job_id: createJobId(),
        user_id: user_id,
        job_type: 6
    };

    // Create image list
    // image_type_id Integer
    // 0 - Selfie image jpg (if you have the full path of the selfie)
    // 2 - Selfie image jpg base64 encoded (if you have the base64image string of the selfie)
    // 4 - Liveness image jpg (if you have the full path of the liveness image)
    // 6 - Liveness image jpg base64 encoded (if you have the base64image string of the liveness image)
    let image_details = [
        {
        image_type_id: 2,
        image: selfieBase64StringImage //'<full path to selfie image or base64image string>'
        },
        {
            image_type_id: 3, //<1 | 3>
            image: documentBase64StringImage //'<full path to front of id document image or base64image string>'
        },
        // ,
        // { // Not required if you don't require proof of life (note photo of photo check will still be performed on the uploaded selfie)
        // image_type_id: 6,
        // image: livelinessBase64StringImage // '<full path to liveness image or base64 image string>'
        // }
    ];

    let id_info = {
        country: countryCodes.Nigeria, // The country where ID document was issued
        id_type: id_type, // The ID document type
      };

    // // Create ID number info
    // let id_info = {
    //     first_name: firstName,
    //     last_name: lastName, //'<surname>',
    //     country: countryCodes.Nigeria, // '<2-letter country code>'
    //     id_type: id_type,
    //     id_number: id_number, // '<valid id number>',
    //     dob: dob, // yyyy-mm-dd
    //     entered: 'true' // must be a string
    // };

    // Set the options for the job
    let options = {
    return_job_status: true, // Set to true if you want to get the job result in sync (in addition to the result been sent to your callback). If set to false, result is sent to callback url only.
    return_history: false, // Set to true to return results of all jobs you have ran for the user in addition to current job result. You must set return_job_status to true to use this flag.
    return_image_links: false, // Set to true to receive selfie and liveness images you uploaded. You must set return_job_status to true to use this flag.
    signature: true
    };

    // Submit the job.
    // This method returns a promise
    try {
        const result = await connection.submit_job(partner_params, image_details, id_info, options);
        return result;
    } catch (error) {
        throw error;
    }

}


const basicKycChecker = async ( dob, user_id, bvn, id_type, firstName, middleName, lastName, phoneNumber, gender ) => {

    let { timestamp, signature } = getSignatureAndTimeStamp();
    const data = {
        source_sdk: "rest_api",
        source_sdk_version: "2.0.0",
        partner_id: partner_id,
        timestamp: timestamp,
        signature: signature,
        country: countryCodes.Nigeria,
        id_type: id_type,
        id_number: bvn,
        callback_url: default_callback,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phoneNumber,
        dob: dob,
        gender: gender,
        partner_params: {
            job_id: createJobId(),
            user_id: user_id
        }
    };

    try {
        const result = await axios.post(baseUrl+"/verify", data)
        return result.data;
        
    } catch (error) {
        throw error;
    }
    
}

const getSignatureAndTimeStamp = () => {
    let timestamp = new Date().toISOString();
    let hmac = crypto.createHmac('sha256', api_key);

    hmac.update(timestamp, 'utf8');
    hmac.update(partner_id, 'utf8');
    hmac.update("sid_request", 'utf8');

    let signature = hmac.digest().toString('base64');

    return {
        timestamp,
        signature
    }
}

module.exports = {
    getSignatureAndTimeStamp,
    basicKycChecker,
    biometericKycChecker
}