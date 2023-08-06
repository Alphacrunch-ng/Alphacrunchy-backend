const nodemailer = require('nodemailer');
const { product_name } = require('./constants');


exports.signUpMailer = (name, email, token) => {
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
    transportSender(mailOptions);
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
    transportSender(mailOptions);
}

//general purpose mailer for otp
exports.otpMailer = (email, token) => {
    const message = `
    <h1>${product_name}.</h1>
    <p>Your OTP is <b>${token}</b></p>
    `;
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"${product_name}" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,
        subject: `${product_name} Otp token`,//
        text: `Your OTP is <b>${token}</b>. `,// subject
        html: message, // html body
    };


    // create reusable transporter object using the default smtp transport
    return transportSender(mailOptions);
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
            transportSender(mailOptions);
}

exports.transactionMailer = (email, operation, amount, description) => {
    const message = `
    <div>
    <h1>Notification From ${product_name} App</h1>
    <p>Notifying you of ${operation} action on you account</p>
    <table  style="width:30rem;color:black;text-align:left;font-family:sans-serif;padding:0;margin:0;">
      <thead style="background-color:#808080;border: solid blue 1px;color:white;padding:1rem;" >
        <tr>
          <th>Email</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Operation</th>
        </tr>
      </thead>
      <tbody style="width:30rem;color:black;border: solid black 1px;text-align:left;padding:0.5rem">
        <tr>
          <td>${email}</td>
          <td style="color:blue;">${description}</td>
          <td>${amount}</td>
          <td>${operation}</td>
        </tr>
      </tbody>
    </table>
    <p>If this was not initiated by you please contact customer care</p>
    <p style="">Thank You</p>
 </div>`
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: `"${product_name}" <${process.env.SENDER_EMAIL}>`,// sender address
        to: `${email}`,// list of recievedRequest
        subject: `${product_name} ${operation} notification`,//
        text: `New ${operation} notification`,// subject
        html: message, // html body
    };

    transportSender(mailOptions);
}

const transportSender = (mailOptions) => {
    // create reusable transporter object using the default smtp transport
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SENDER_EMAIL,
            pass: process.env.SENDER_EMAIL_PASSWORD,
        }
    });
    // send mail with defined transport object
    return transport.sendMail(mailOptions);
} 