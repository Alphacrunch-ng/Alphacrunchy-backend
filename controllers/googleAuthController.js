const passport = require('passport');
const { generateToken } = require('../utils/crypto/token');
const { authEvents } = require('../utils/events/emitters');
const { events } = require('../utils/events/eventConstants');
const { getUserWalletsHelper } = require('../models/repositories/walletRepo');
const { getUserByEmailHelper, getUserByGoogleIdHelper, createUserHelper } = require('../models/repositories/userRepo');

// Controller for initiating Google authentication
exports.googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Controller for handling Google authentication callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/login' }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');

    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
};


// Controller for handling Google authentication callback for login
exports.googleLoginCallback = async (req, res, next) => {
    passport.authenticate('google', { session: false }, async (err, user) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const checkUser = await getUserByGoogleIdHelper(user.googleId)
        if (!checkUser) return res.status(400).json({ message: 'User not found' });

        const { token, expiresIn } = generateToken(checkUser);
    
        const userLocationDetails = { useragent: req.useragent, ip: String(req.ip).split(',')[0] };
        authEvents.emit(events.USER_LOGGED_IN, { user, data: { ...userLocationDetails, googleAuth: true} });
    
        const checkWallets = await getUserWalletsHelper(user?._id);
        return res.status(200).json({
            data: user,
            wallets: checkWallets,
            success: true,
            is2FactorEnabled: false,
            message: `Login Successful`,
            token: token,
            expiresIn,
            ipaddress: req.ip
          });
    })(req, res, next);
  };

// Controller for handling Google authentication callback for signup
exports.googleSignupCallback = (req, res, next) => {
    const ipaddress =  req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || req?.ip;
    const useragent = req?.useragent;
    passport.authenticate('google', { session: false }, async (err, user) => {
      if (err) return next(err);
  
      // Check if user already exists
      const existingUser = await getUserByEmailHelper({email: user.email})
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      // Additional functionality for signup can be added here
      const newUser = await createUserHelper({ ...user});
      authEvents.emit(events.USER_SIGNED_UP, {user: newUser, data: {useragent, ip: String(ipaddress).split(',')[0], otp}});
  
      return res.status(200).json({ user });
    })(req, res, next);
  };