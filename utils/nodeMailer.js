const nodemailer = require('nodemailer');

exports.signUpMailer = (name, email, token) => {
    const message = `
    <h1> Welcome to Alphacrunch. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    <p>Here is your token to set your password : ${token}</p>
    `

    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: process.env.SENDER_EMAIL,
            password: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
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
    tls:{
        rejectUnauthorized:false
    };
}

exports.noticeMailer = (email, operation) => {
    const message = `<div>
    <h1>Notification From Alphacrunch App</h1>
    <p></p>
    <p>Thank You</p>
    </div>`
    
    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        auth: {
            user: process.env.SENDER_EMAIL,
            password: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
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
    tls:{
        rejectUnauthorized:false
    };
}