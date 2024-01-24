const { authEvents } = require("./emitters");
const { events } = require("./eventConstants");

authEvents.on(events.USER_LOGGED_IN, ()=>{
    console.log("user sign in");
})