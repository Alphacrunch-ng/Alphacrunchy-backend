const nodemailer = require("nodemailer");
const { product_name } = require("./constants");

exports.signUpMailer = async (name, email, token, deviceInfo, userLocation) => {
  const message = `
    <h1> Welcome to ${product_name}. ${name}</h1>
    <p>Your account has been sucessfully created</p>
    ${`<p>Here is your token to set your password : ${token}</p>` && token}
    ${deviceInfoMarkup(deviceInfo, userLocation)}
    `;
  // setup email data with unicode symbols
  let mailOptions = {
    from: `"Cambio" <${process.env.SENDER_EMAIL}>`, // sender address
    to: `${email}`,
    subject: "Cambio Sign-up notification",
    text: `Welcome ${name}, Your account has been created`, // subject
    html: message, // html body
  };

  // create reusable transporter object using the default smtp transport
  await transportSender(mailOptions);
};

//email sender for reset password
exports.resetPasswordMailer = async (email, token) => {
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
  await transportSender(mailOptions);
};

//general purpose mailer for otp
exports.otpMailer = async (email, token) => {
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
  return await transportSender(mailOptions);
};

exports.noticeMailer = async (email, operation) => {
  const message = `
      <div>
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
  await transportSender(mailOptions);
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
    <div style="border: 1px solid #ccc; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); max-width: 400px;">
        <div style="margin-bottom: 10px;">
            <strong>Email:</strong>
            <p style="margin: 5px 0;">${email}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Description:</strong>
            <p style="margin: 5px 0;">${description}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Amount:</strong>
            <p style="margin: 5px 0;">${amount}</p>
        </div>
        <div>
            <strong>Operation:</strong>
            <p style="margin: 5px 0;">${operation}</p>
        </div>
    </div>


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

exports.initiateTransactionMailer = ({email, operation, description}) => {
  const message = `
<div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; border: 1px solid #ccc; padding: 20px; border-radius: 10px;">
    <div style="background-color:#B98100;color:white;padding:20px;text-align:center;border-radius:10px;">
        <img src="https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png" alt="Logo" style="width:100px;height:100px;">
        <h1 style="margin:0;">Notification From ${product_name} App</h1>
    </div>
    <p style="color:#333;">Notifying you of ${operation} action on your account</p>
    <div style="border: 1px solid #ccc; border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); max-width: 400px;">
        <div style="margin-bottom: 10px;">
            <strong>Email:</strong>
            <p style="margin: 5px 0;">${email}</p>
        </div>
        <div style="margin-bottom: 10px;">
            <strong>Description:</strong>
            <p style="margin: 5px 0;">${description}</p>
        </div>
    </div>


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

const transportSender = async (mailOptions) => {
  // create reusable transporter object using the default smtp transport
  let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_EMAIL_PASSWORD,
    },
  });
  // send mail with defined transport object
  return await transport.sendMail(mailOptions);
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
    <p>Time: ${new Date().toUTCString()}</p>
  </li>
</ul>`

const header = `
<div style="width:100%; max-width:600px; margin:0 auto; font-family: 'Arial', sans-serif; background-color: #f5f5f5; color: #333; padding: 10px; border-collapse: collapse;">
  <div style="background-color:#B98100;color:white;padding:20px;text-align:center;border-radius:10px;">
        <img src="https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png" alt="Logo" style="width:100px;height:100px;">
    </div>
</div>
`