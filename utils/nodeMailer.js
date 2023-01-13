const nodemailer = require('nodemailer');


var emailSent = false;
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

    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
    // send mail with defined transport object
    transport.sendMail(mailOptions, (error, info) =>{
        if(error) {
            console.log(error);
        }
        else{
            
            emailSent = true;
            console.log("Email has been sent");
        }
    });
    return emailSent;
}

exports.noticeMailer = (email, operation) => {
    const message = `<div>
    <h1>Notification From Alphacrunch App</h1>
    <p>Notifying you of ${operation} action on you account</p>
    <p>If this was not initiated by you please contact customer care</p>
    <p>Thank You</p>
    </div>`
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Alphacrunch" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: `Alphacrunch ${operation} notification`,//
        text: `New ${operation} notification`,// subject
        html: message, // html body
    };

    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
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

    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
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