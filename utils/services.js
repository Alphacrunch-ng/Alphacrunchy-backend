const crypto = require("crypto");
const phones = require("./phone.json");
const axios = require("axios");
const { product_name } = require("./constants");

function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex") // convert to hexadecimal format
    .slice(0, length); // return required number of characters
}

exports.serverErrorResponse = async (res, error) => {
  return res.status(500).json({
    success: false,
    message: "An error occured, we are working on it",
    error: error.message,
    data: error.data
  });
};
exports.successResponse = async ({res, data, message }) => {
  return res.status(200).json({
    success: true,
    message: message,
    data: data
  });
};
exports.createdSuccessFullyResponse = async ({res, data, message }) => {
  return res.status(201).json({
    success: true,
    message: message,
    data: data
  });
};
exports.badRequestResponse = async ({res, message}) => {
  return res.status(400).json({
    success: false,
    message
  });
};

exports.unauthorizedError  = async (res, message) => {
  return res.status(401).json({
    success: false,
    message
  })
}

exports.createOtp = () => {
  return Math.floor(Math.random() * 900000) + 100000;
};

exports.createWalletNumber = (length) => {
  return generateRandomString(length).toUpperCase();
};

exports.createJobId = () => {
  return product_name.trim().toUpperCase() + generateRandomString(10).toUpperCase();
}

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

resolveDeviceType = (useragent) => {
  const { isTablet, isiPad, isiphone, isAndroid, isBlackberry, isDesktop } =
    useragent;
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

exports.getUserDeviceInfo = (useragent) => {
  const deviceInfo = {
    Browser: useragent.browser,
    deviceType: resolveDeviceType(useragent),
    deviceName: useragent.platform, // name &  platform.
  };

  return deviceInfo;
};

exports.getUserLocation = async (ip) => {
  const url = `http://ip-api.com/json/${ip}`;
  const { data } = await axios.get(url);
  return { country: data.country, city: data.city };
};

exports.makeBitpowrRequest = async (url, method = "get", data = null) => {
  try {
    const encodedToken = Buffer.from(
      `${process.env.BITPOWR_PUBLICKEY}:${process.env.BITPOWR_SECRETKEY}`
    ).toString("base64");

    const options = {
      headers: {
        Authorization: `Bearer ${encodedToken}`,
      },
    };

    let response;
    if (method.toLowerCase() === "get") {
      response = await axios.get(url, options);
    } else if (method.toLowerCase() === "post") {
      response = await axios.post(url, data, options);
    } else if (method.toLowerCase() === "put") {
      response = await axios.put(url, data, options);
    }
    return response.data;
    
  } catch (err) {
    if(err.response.status >= 400){
      return err.response;
    }
    throw err;
  }
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


exports.setTokenDataInCookie = (res, { token, expiresIn }) => {
  res.cookie("tokenData", JSON.stringify({ token, expiresIn }), {
    httpOnly: true,
    expires: expiresIn,
    secure: process.env.NODE_ENV === 'production', // true for production
    sameSite: "none",
  });
}