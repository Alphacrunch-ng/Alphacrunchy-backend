// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// const verifySid = process.env.TWILIO_VERIFY_SID;
const client = require('twilio')(accountSid, authToken);

// client.messages
//   .create({
//     body: 'here is you OTP: 23423 ',
//     to: '+2348163214714', // Reciever number
//     from: process.env.TWILIO_NUMBER, // Valid Twilio number
//   })
//   .then((message) => console.log(message.sid));

exports.sendSmsOtp = ( phoneNumber, otp)=>{
  return new Promise((resolve,reject)=>{
      var messageData={
        "body":`Your One Time Password Is ${otp}`,
        "to": phoneNumber,
        "from":process.env.TWILIO_NUMBER
        }
        client.messages
        .create(messageData,(err,responseData)=>{
          if(!err){
            resolve({message:"OTP Sent", responseData})
            }
          else{
              reject({message:`Error Sending Message`, err})
            }
        });
      });
}