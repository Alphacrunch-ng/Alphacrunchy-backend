// events.js
const EventEmitter = require('events');
const { events } = require('./eventConstants');
const { loginNotificationMailer } = require("../nodeMailer");
const { getUserDeviceInfo, getUserLocation } = require("../services");
const User = require('../../models/userModel');

class AuthEmitter extends EventEmitter {}

const authEvents = new AuthEmitter();

authEvents.on(events.USER_LOGGED_IN, async ({user, request})=>{
    const deviceInfo = getUserDeviceInfo(request);
    const userLocation = await getUserLocation(request);
    const result = await loginNotificationMailer( user.fullName, user.email, deviceInfo, userLocation);
    console.log(result);
    await User.findByIdAndUpdate(user._id, { lastLogin : new Date()})
})

module.exports = {
    authEvents,
};
