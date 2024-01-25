const crypto = require("crypto");
const phones = require("./phone.json");
const useragent = require("express-useragent");
const axios = require("axios");

function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, length); // return required number of characters
}

exports.serverError = async (res, error) => {
  return res.status(500).json({
    success: false,
    message: "An error occured, we are working on it",
    error: error.message,
  });
};

exports.createOtp = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

exports.createWalletNumber = (length) => {
  return generateRandomString(length).toUpperCase();
};

// not implemented
exports.connectChat = (socket) => {
  socket.on("admin", (user) => {
    socket.join(user);
    socket.on("chat", (message, user) => {
      console.log(message);
      console.log(user);
      socket.emit("chat", message);
    });
    console.log(`${user} has joined been connected`);
  });
};

exports.phoneFormater = (phone, country) => {
  let countryPhone = {};
  if (phone[0] === "+") {
    return phone;
  }
  phones.forEach((phoneNum) => {
    if (phoneNum.name.includes(country)) {
      countryPhone = phoneNum;
    }
  });
  return countryPhone + phone.slice(1);
};

exports.formatEmail = (email) => {
  let firstPartEmail = email.slice(0, email.indexOf("@"));
  return `${firstPartEmail.slice(0, 3)}***${email.slice(email.indexOf("@"))}`;
};

resolveDeviceType = (request) => {
  const { isTablet, isiPad, isiphone, isAndroid, isBlackberry, isDesktop } =
    request.useragent;
  switch (
    isTablet ||
    isiPad ||
    isiphone ||
    isAndroid ||
    isBlackberry ||
    isDesktop
  ) {
    case isDesktop:
      return `${"isDesktop".slice(2)}`;
    case isTablet:
      return `${"isTablet".slice(2)}`;
    case isiPad:
      return `${"isiPad".slice(2)}`;
    case isiphone:
      return `${"isiphone".slice(2)}`;
    case isAndroid:
      return `${"isAndroid".slice(2)}`;
    case isBlackberry:
      return `${"isBlackberry".slice(2)}`;
    default:
      return "Unable to resolve device type";
  }
};

exports.getUserDeviceInfo = (request) => {
  const deviceInfo = {
    Browser: request.useragent.browser,
    deviceType: resolveDeviceType(request),
    deviceName: request.useragent.platform,
  };

  return deviceInfo;
};

exports.getUserLocation = async (request) => {
  let ip = request.ip;
  const url = `http://ip-api.com/json/${ip}`;
  const { data } = await axios.get(url);
  return { country: data.country, city: data.city };
};

// For Populating the rates =>
//    giftcards.forEach((giftcard)=>{
//     currencies.forEach(async (currency)=>{
//         const dataP = {
//             giftCardId: giftcard._id,
//             rate: 860,
//             currency,
//             cardType: "Physical Card"
//         }
//         await GiftCardRate.create(dataP)
//         const dataE = {
//             giftCardId: giftcard._id,
//             rate: 800,
//             currency,
//             cardType: "E-Code"
//         }
//         await GiftCardRate.create(dataE)
//     })
// })
