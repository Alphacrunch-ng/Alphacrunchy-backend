const { loginNotificationMailer } = require("../nodeMailer");
const { getUserDeviceInfo, getUserLocation } = require("../services");
const { authEvents } = require("./emitters");
const { events } = require("./eventConstants");

authEvents.on(events.USER_LOGGED_IN, async ({user, request})=>{
    console.log("user sign in");
    const deviceInfo = getUserDeviceInfo(request);
    const userLocation = await getUserLocation(request);
    await loginNotificationMailer( user.fullName, user.email, deviceInfo, userLocation);
    await user.update({lastLogin: new Date()}, {where:{id: user.id}}).catch((err)=>{console.error(`Error updating last login date for: ${user} `)})
})