// events.js
const EventEmitter = require('events');
const { events } = require('./eventConstants');
const { loginNotificationMailer, noticeMailer, kycMailer } = require("../nodeMailer");
const useragent = require("express-useragent");
const { getUserDeviceInfo, getUserLocation } = require("../services");
const User = require('../../models/userModel');
const { operations } = require('../constants');
const UserBasicKYCVerification = require('../../models/userBasicKYCVerification');

class AuthEmitter extends EventEmitter {}
const authEvents = new AuthEmitter();

class KycEmitter extends EventEmitter {}
const kycEvents = new KycEmitter();

authEvents.on(events.USER_LOGGED_IN, async ({user, data})=>{

    const { useragent, ip } = data;
    const deviceInfo = getUserDeviceInfo(useragent);
    const userLocation = await getUserLocation(ip);
    await loginNotificationMailer( user.fullName, user.email, deviceInfo, userLocation);
    await User.findByIdAndUpdate(user._id, { lastLogin : new Date()})
})


kycEvents.on(events.USER_BASIC_KYC_SUCCESS, async ({ user_id , email, dob, firstName, middleName, lastName, gender, result})=>{
    try {
        const user = await User.findByIdAndUpdate(user_id, { kycLevel : 1, firstName: firstName, middleName: middleName, lastName: lastName, dob: dob, sex: gender}, { new : true, omitUndefined: true});
        await UserBasicKYCVerification.create(result);
    } catch (error) {
        console.log(error);
    } finally {
        noticeMailer(email, operations.basicKycSuccess);
    }
    
});

kycEvents.on(events.USER_BASIC_KYC_FAILED, async ({user, result})=>{
    try {
        kycMailer(user?.email, operations.basicKycFailed, result?.ResultText);
    } catch (error) {
        console.log(error);
    }
    
});

kycEvents.on(events.USER_BIOMETRIC_KYC_SUCCESS, async ({ user_id })=>{
    try {
        const user = await User.findByIdAndUpdate(user_id, { kycLevel : 2}, { new : true });
        noticeMailer(user.email, operations.biometricKycSuccess);
    } catch (error) {
        console.log(error);
    }
});

kycEvents.on(events.USER_BIOMETRIC_KYC_FAILED, async ({ user, result })=>{
    try {
        kycMailer(user?.email, operations.biometricKycFailed, result?.ResultText);
    } catch (error) {
        console.log(error);
    }
});


module.exports = {
    authEvents,
    kycEvents
};
