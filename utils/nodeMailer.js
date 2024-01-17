const nodemailer = require("nodemailer");
const { product_name } = require("./constants");

exports.signUpMailer = (name, email, token) => {
  const message = `
    <h1> Welcome to ${product_name}. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    <p>Here is your token to set your password : ${token}</p>
    `;
  // setup email data with unicode symbols
  let mailOptions = {
    from: `"Cambio" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`, // list of recievedRequest
    subject: "Cambio Sign-up notification", //
    text: `Welcome ${name}, Your account has been created`, // subject
    html: message, // html body
  };

  // create reusable transporter object using the default smtp transport
  transportSender(mailOptions);
};

//email sender for reset password
exports.resetPasswordMailer = (email, token) => {
  const message = `
    <h1>${product_name}.</h1>
    <p>Your OTP is <b>${token}</b> to reset your password. </p>
    `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: `"${product_name}" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`,
    subject: `${product_name} Reset Password token`, //
    text: `Your OTP is <b>${token}</b> to reset your password. `, // subject
    html: message, // html body
  };

  // create reusable transporter object using the default smtp transport
  transportSender(mailOptions);
};

//general purpose mailer for otp
exports.otpMailer = (email, token) => {
  const message = `
    <h1>${product_name}.</h1>
    <p>Your OTP is <b>${token}</b></p>
    `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: `"${product_name}" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`,
    subject: `${product_name} Otp token`, //
    text: `Your OTP is <b>${token}</b>. `, // subject
    html: message, // html body
  };

  // create reusable transporter object using the default smtp transport
  return transportSender(mailOptions);
};

exports.noticeMailer = (email, operation) => {
  const message = `<div>
            <h1>Notification From ${product_name} App</h1>
            <p>Notifying you of ${operation} action on you account</p>
            <p>If this was not initiated by you please contact customer care</p>
            <p>Thank You</p>
            </div>`;

  // setup email data with unicode symbols
  let mailOptions = {
    from: `"${product_name}" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`, // list of recievedRequest
    subject: `${product_name} ${operation} notification`, //
    text: `New ${operation} notification`, // subject
    html: message, // html body
  };

  // create reusable transporter object using the default smtp transport
  transportSender(mailOptions);
};

exports.transactionMailer = (email, operation, amount, description) => {
  const message = `
<div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; border: 1px solid #ccc; padding: 20px; border-radius: 10px;">
    <div style="background-color:#B98100;color:white;padding:20px;text-align:center;border-radius:10px;">
        <img src="https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png" alt="Logo" style="width:100px;height:100px;">
        <h1 style="margin:0;">Notification From ${product_name} App</h1>
    </div>
    <p style="color:#333;">Notifying you of ${operation} action on your account</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
            <tr style="background-color:#f0f0f0;">
                <th style="padding:10px;border:1px solid #ccc;text-align:left;">Email</th>
                <th style="padding:10px;border:1px solid #ccc;text-align:left;">Description</th>
                <th style="padding:10px;border:1px solid #ccc;text-align:left;">Amount</th>
                <th style="padding:10px;border:1px solid #ccc;text-align:left;">Operation</th>
            </tr>
        </thead>
        <tbody >
            <tr >
                <td style="padding:10px;border:1px solid #ccc;">${email}</td>
                <td style="padding:10px;border:1px solid #ccc;">${description}</td>
                <td style="padding:10px;border:1px solid #ccc;">${amount}</td>
                <td style="padding:10px;border:1px solid #ccc;">${operation}</td>
            </tr>
        </tbody>
    </table>
    <p>If this was not initiated by you please contact customer care</p>
    <p style="text-align:center;">Thank You</p>
</div>  
  `;
  // setup email data with unicode symbols
  let mailOptions = {
    from: `"${product_name}" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`, // list of recievedRequest
    subject: `${product_name} ${operation} notification`, //
    text: `New ${operation} notification`, // subject
    html: message, // html body
  };

  transportSender(mailOptions);
};

const transportSender = (mailOptions) => {
  // create reusable transporter object using the default smtp transport
  let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });
  // send mail with defined transport object
  return transport.sendMail(mailOptions);
};
