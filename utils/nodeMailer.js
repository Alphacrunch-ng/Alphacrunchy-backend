const nodemailer = require('nodemailer');
const { product_name } = require('./constants');


exports.signUpMailer = (name, email, token) => {
    var emailSent = false;
    const message = `
    <h1> Welcome to ${product_name}. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    <p>Here is your token to set your password : ${token}</p>
    `
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Cambio" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: "Cambio Sign-up notification",//
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


//email sender for reset password
exports.resetPasswordMailer = (email, token) => {
    const message = `
    <h1>${product_name}.</h1>
    <p>Your OTP is <b>${token}</b> to reset your password. </p>
    `;
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"${product_name}" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,
        subject: `${product_name} Reset Password token`,//
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
            console.log(error);
        }
        else{
            console.log("Email has been sent");
        }
    });
}

exports.noticeMailer = (email, operation) => {
            const message = `<div>
            <h1>Notification From ${product_name} App</h1>
            <p>Notifying you of ${operation} action on you account</p>
            <p>If this was not initiated by you please contact customer care</p>
            <p>Thank You</p>
            </div>`
            
            // setup email data with unicode symbols
            let mailOptions = {
                from: `"${product_name}" <${process.env.SENDER_EMAIL}>`,// sender address
                to: `${email}`,// list of recievedRequest
                subject: `${product_name} ${operation} notification`,//
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
                    console.log(error);
                }
                else{
                    console.log("Email has been sent");
                }
            });
}

exports.transactionMailer = (email, operation, amount, description) => {
    const message = `<div>
    <h1>Notification From ${product_name} App</h1>
    <p>Notifying you of ${operation} action on you account</p>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${email}</td>
          <td>${description}</td>
          <td>${amount}</td>
          <td>${operation}</td>
        </tr>
      </tbody>
    </table>
    <p>If this was not initiated by you please contact customer care</p>
    <p>Thank You</p>
    </div>`
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"${product_name}" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: `${product_name} ${operation} notification`,//
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
            console.log(error);
        }
        else{
            console.log("Email has been sent");
        }
    });
}