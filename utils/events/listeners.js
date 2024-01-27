const { loginNotificationMailer } = require("../nodeMailer");
const { getUserDeviceInfo, getUserLocation } = require("../services");
const User = require('../../models/userModel')
const { authEvents } = require("./emitters");
const { events } = require("./eventConstants");

authEvents.on(events.USER_LOGGED_IN, async ({user, request})=>{
    console.log("user sign in");
    const deviceInfo = getUserDeviceInfo(request);
    const userLocation = await getUserLocation(request);
    await loginNotificationMailer( user.fullName, user.email, deviceInfo, userLocation);
    await User.findByIdAndUpdate(user._id, { lastLogin : new Date()})
})