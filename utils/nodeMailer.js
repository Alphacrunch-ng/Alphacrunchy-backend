const nodemailer = require('nodemailer');

// create reusable transporter object using the default smtp transport
let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_EMAIL_PASSWORD,
    }
});

exports.signUpMailer = (name, email, token) => {
    const message = `
    <h1> Welcome to Alphacrunch. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    <p>Here is your token to set your password : ${token}</p>
    `
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Alphacrunch" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: "Alphacrunch Sign-up notification",//
        text: `Welcome ${name}, Your account has been created`,// subject
        html: message, // html body
    };
    // send mail with defined transport object
    transport.sendMail(mailOptions, (error, info) =>{
        if(error) {
            return console.log(error);
        }
        else{res.sendMail("Email has been sent")}
    });
}

exports.noticeMailer = (email, operation) => {
    const message = `<div>
    <h1>Notification From Alphacrunch App</h1>
    <p></p>
    <p>Thank You</p>
    </div>`
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Alphacrunch" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: "Alphacrunch transaction notification",//
        text: `New ${operation} transaction notification`,// subject
        html: message, // html body
    };
    // send mail with defined transport object
    transport.sendMail(mailOptions, (error, info) =>{
        if(error) {
            return console.log(error);
        }
        res.sendMail("Email has been sent")
    });
}

//email sender for reset password
exports.resetPasswordMailer = (email, token) => {
    const message = `
    <h1>Alphacrunch.</h1>
    <p>Your OTP is <b>${token}</b> to reset your password. </p>
    `;

    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Alphacrunch" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,
        subject: "Alphacrunch Reset Password token",//
        text: `Your OTP is <b>${token}</b> to reset your password. `,// subject
        html: message, // html body
    };

    // send mail with defined transport object
    transport.sendMail(mailOptions, (error, info) =>{
        if(error) {
            console.log(error)
        }
        else{
            console.log("Email has been sent");
        }
    });
}