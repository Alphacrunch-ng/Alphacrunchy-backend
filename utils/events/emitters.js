// events.js
const EventEmitter = require('events');
const { events } = require('./eventConstants');
const { loginNotificationMailer } = require("../nodeMailer");
const useragent = require("express-useragent");
const { getUserDeviceInfo, getUserLocation } = require("../services");
const User = require('../../models/userModel');

class AuthEmitter extends EventEmitter {}

const authEvents = new AuthEmitter();

authEvents.on(events.USER_LOGGED_IN, async ({user, request})=>{

    const deviceInfo = getUserDeviceInfo(request.useragent);
    let ip = request.ip;
    const userLocation = await getUserLocation(ip);
    await loginNotificationMailer( user.fullName, user.email, deviceInfo, userLocation);
    await User.findByIdAndUpdate(user._id, { lastLogin : new Date()})
})

module.exports = {
    authEvents,
};
