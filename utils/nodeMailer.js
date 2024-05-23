const nodemailer = require("nodemailer");
const { product_name } = require("./constants");

exports.signUpMailer = (name, email, token, deviceInfo, userLocation) => {
  const message = `
    <h1> Welcome to ${product_name}. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    <p>Here is your token to set your password : ${token}</p>
    ${deviceInfoMarkup(deviceInfo, userLocation)}
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

exports.kycMailer = (email, operation, msg) => {
  const message = `<div>
            <h1>Notification From ${product_name} App</h1>
            <p>Notifying you of ${operation} action on you account</p>
            <p>${msg}</p>
            <p>Please ensure that your details on your profile matches your kyc document</p>
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

exports.loginNotificationMailer = async (
  name,
  email,
  deviceInfo,
  userLocation
) => {
  const message = `
<div style="width:100%; max-width:600px; margin:0 auto; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333; padding: 10px; border-collapse: collapse;">
  <div style="background-color:#B98100;color:white;padding:20px;text-align:center;border-radius:10px;">
        <img src="https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png" alt="Logo" style="width:100px;height:100px;">
    </div>
  <div style="padding: 10px">
      <h1 style="color: #B98100; margin-bottom: 20px; font-size: 24px;">Welcome back to ${product_name}, ${name}!</h1>
      ${deviceInfoMarkup(deviceInfo, userLocation)}
      <p>If this was you, no further action is required. If you didn't recognize this login, please secure your account.</p>
  </div>
</div>

  `;

  // Setup email data with unicode symbols
  let mailOptions = {
    from: `"${product_name}" <${process.env.SENDER_EMAIL}>`, // Sender address
    to: `${email}`, // Recipient address
    subject: "Login Notification", // Email subject
    text: `Welcome back, ${name}! Your account has been accessed recently.`, // Plain text body
    html: message, // HTML body
  };

  // Create reusable transporter object using the default SMTP transport
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

const deviceInfoMarkup = (deviceInfo, userLocation) => `
<p>Your account has been accessed recently. Here are the details:</p>
<ul style="list-style: none; padding: 0;">
  <li style="margin-bottom: 10px;">
    <strong>Device Information:</strong><br/>
    <p style="margin-right: 10px;"><strong>Browser:</strong> ${deviceInfo.Browser},</p>
    <p style="margin-right: 10px;"><strong>Device Type:</strong> ${deviceInfo.deviceType},</p>
    <p><strong>Name of Device:</strong> ${deviceInfo.deviceName}</p>
  </li>
  <li style="margin-bottom: 10px;">
    <strong>Location:</strong> ${userLocation.country}, ${userLocation.city}
  </li>
  <li style="margin-bottom: 10px;">
    <p>Time: ${new Date().toLocaleDateString()}</p>
  </li>
</ul>`