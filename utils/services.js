const crypto = require("crypto");
const phones = require("./phone.json");
const useragent = require("express-useragent");

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

resolveWebBrowser = (request) => {
  let {
    isOpera,
    isIE,
    isEdge,
    isSafari,
    isFirefox,
    isWebkit,
    isChrome,
    isKonqueror,
    isOmniWeb,
    isSeaMonkey,
    isFlock,
    isAmaya,
    isPhantomJS,
    isEpiphany,
  } = request.useragent;

  switch (
    isOpera ||
    isIE ||
    isEdge ||
    isSafari ||
    isFirefox ||
    isWebkit ||
    isChrome ||
    isKonqueror ||
    isOmniWeb ||
    isSeaMonkey ||
    isFlock ||
    isAmaya ||
    isPhantomJS ||
    isEpiphany
  ) {
    case isOpera:
      return `${"isOpera".slice(2)}`;
    case isEdge:
      return `${"isEdge".slice(2)}`;
    case isSafari:
      return `${"isSafari".slice(2)}`;
    case isFirefox:
      return `${"isFirefox".slice(2)}`;
    case isWebkit:
      return `${"isWebkit".slice(2)}`;
    case isChrome:
      return `${"isChrome".slice(2)}`;
    case isKonqueror:
      return `${"isKonqueror".slice(2)}`;
    case isOmniWeb:
      return `${"isOmniWeb".slice(2)}`;
    case isSeaMonkey:
      return `${"isSeaMonkey".slice(2)}`;
    case isFlock:
      return `${"isFlock".slice(2)}`;
    case isAmaya:
      return `${"isAmaya".slice(2)}`;
    case isPhantomJS:
      return `${"isPhantomJS".slice(2)}`;
    case isEpiphany:
      return `${"isEpiphany".slice(2)}`;

    default:
      return "Unable to resolve web browser";
  }
};

resolveDeviceType = (request) => {
  const {
    isMobile,
    isTablet,
    isiPad,
    isiphone,
    isAndroid,
    isBlackberry,
    isDesktop,
  } = request.useragent;
  switch (
    isMobile ||
    isTablet ||
    isiPad ||
    isiphone ||
    isAndroid ||
    isBlackberry ||
    isDesktop
  ) {
    case isMobile:
      return `${"isMobile".slice(2)}`;
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

resolveDeviceName = (request) => {};
exports.getUserDeviceInfo = (request) => {
  // console.log(request.useragent);
  const deviceInfo = {
    Browser: resolveWebBrowser(request),
    deviceType: resolveDeviceType(request),
  };

  return deviceInfo;
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
