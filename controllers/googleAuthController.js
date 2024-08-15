const { verifyGoogleToken, fetchIdToken } = require('../middlewares/googleAuth');
const { generateToken } = require('../utils/crypto/token');
const { authEvents } = require('../utils/events/emitters');
const { events } = require('../utils/events/eventConstants');
const { getUserWalletsHelper } = require('../models/repositories/walletRepo');
const { getUserByEmailHelper, getUserByGoogleIdHelper, createUserHelper, deleteUserByIdHelper } = require('../models/repositories/userRepo');
const { serverError } = require('../utils/services');

exports.googleLoginCallback = async (req, res) => {
    const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
    const useragent = req?.useragent;
    let { idToken, code} = req.body; // Assuming idToken is sent in the request body
    try {
        if(code){
          idToken = await fetchIdToken(code);
        }
        const user = await verifyGoogleToken(idToken);
        let checkUser = await getUserByGoogleIdHelper(user.googleId);
        if (!checkUser) return res.status(400).json({ message: 'User not found' });

        const { token, expiresIn } = generateToken(checkUser);
    
        const userLocationDetails = { useragent, ip: String(ipaddress).split(',')[0] };
        authEvents.emit(events.USER_LOGGED_IN, { user: checkUser, data: { ...userLocationDetails, googleAuth: true} });
    
        const checkWallets = await getUserWalletsHelper(checkUser?._id);
        checkUser.password = "";
        return res.status(200).json({
            data: checkUser,
            wallets: checkWallets,
            success: true,
            is2FactorEnabled: false,
            message: `Login Successful`,
            token: token,
            expiresIn,
            ipaddress: req.ip
        });
    } catch (error) {
        return serverError(res, error);
    }
};

exports.googleSignupCallback = async (req, res) => {
    const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
    const useragent = req?.useragent;
    let { idToken, code} = req.body; // Assuming idToken is sent in the request body
    let createdUser;
    try {
      if(code){
        idToken = await fetchIdToken(code);
      }
      const user = await verifyGoogleToken(idToken);
        const existingUser = await getUserByEmailHelper({email: user.email});
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
        const newUser = await createUserHelper({ ...user, password: user.googleId, confirmedEmail: true });
        createdUser = newUser;
        authEvents.emit(events.USER_SIGNED_UP, {user: newUser, data: {useragent, ip: String(ipaddress).split(',')[0], otp: null, googleAuth: true}});
        const { token, expiresIn } = generateToken(createdUser);
        const checkWallets = await getUserWalletsHelper(createdUser?._id);
        return res.status(201).json({
            data: createdUser,
            wallets: checkWallets,
            success: true,
            is2FactorEnabled: false,
            token,
            expiresIn,
            ipaddress,
            message: `Successfully created user`,
        });
    } catch (error) {
        if(createdUser){
            await deleteUserByIdHelper({_id: createdUser?._id},{ useFindAndModify: false});
        }
        return serverError(res, error);
    }
};


// const passport = require('../middlewares/passport');
// const { generateToken } = require('../utils/crypto/token');
// const { authEvents } = require('../utils/events/emitters');
// const { events } = require('../utils/events/eventConstants');
// const { getUserWalletsHelper } = require('../models/repositories/walletRepo');
// const { getUserByEmailHelper, getUserByGoogleIdHelper, createUserHelper, deleteUserByIdHelper } = require('../models/repositories/userRepo');
// const { serverError } = require('../utils/services');


// // Controller for handling Google authentication callback for login
// exports.googleLoginCallback = async (req, res, next) => {
//     const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
//     const useragent = req?.useragent;
//     try {
//       passport.authenticate('google-login', { failureRedirect: '/login', session: false }, async (err, user) => {
//           if (err) return next(err);
//           if (!user) return res.status(400).json({ message: 'User not found' });

//           let checkUser = await getUserByGoogleIdHelper(user.googleId)
//           if (!checkUser) return res.status(400).json({ message: 'User not found' });

//           const { token, expiresIn } = generateToken(checkUser);
      
//           const userLocationDetails = { useragent, ip: String(ipaddress).split(',')[0] };
//           authEvents.emit(events.USER_LOGGED_IN, { user: checkUser, data: { ...userLocationDetails, googleAuth: true} });
      
//           const checkWallets = await getUserWalletsHelper(user?._id);
//           checkUser.password = "";
//           return res.status(200).json({
//               data: checkUser,
//               wallets: checkWallets,
//               success: true,
//               is2FactorEnabled: false,
//               message: `Login Successful`,
//               token: token,
//               expiresIn,
//               ipaddress: req.ip
//             });
//       })(req, res, next);
//     } catch (error) {
//       return serverError(res, error);
//     }
//   };

// // Controller for handling Google authentication callback for signup
// exports.googleSignupCallback = async (req, res, next) => {
//     const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
//     const useragent = req?.useragent;
//     let createdUser;
//     try {
//       passport.authenticate('google-signup', { session: false }, async (err, user) => {
//         if (err) return next(err);
    
//         // Check if user already exists
//         const existingUser = await getUserByEmailHelper({email: user.email})
//         if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
//         // Additional functionality for signup can be added here
//         const newUser = await createUserHelper({ ...user, password: user.googleId});
//         createdUser = newUser
//         authEvents.emit(events.USER_SIGNED_UP, {user: newUser, data: {useragent, ip: String(ipaddress).split(',')[0], otp: null, googleAuth: true}});
    
//       return res.status(201).json({
//           data: newUser,
//           success: true,
//           message: `Successfully created user` 
//       });
//       })(req, res, next);
//     } catch (error) {
//       if(createdUser){
//           await deleteUserByIdHelper({_id: createdUser?._id},{ useFindAndModify: false});
//       }
//       return serverError(res, error);
//     }
//   };