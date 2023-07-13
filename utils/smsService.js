const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require('twilio')(accountSid, authToken);


exports.sendSmsOtp = ( phoneNumber, otp)=>{
  var messageData = {
    "body":`Your One Time Password Is ${otp}`,
    "to": phoneNumber,
    "from":process.env.TWILIO_NUMBER
    }
  return client.messages.create(messageData);
}