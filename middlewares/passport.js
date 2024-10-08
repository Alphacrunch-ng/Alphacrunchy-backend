const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { roles } = require('../utils/constants');
const GOOGLE_SIGNUP_CALLBACK_URL = process.env.NODE_ENV === "production"? 
"https://aphacrunch-api.onrender.com/auth/google/signup/callback" : "/auth/google/signup/callback";

const GOOGLE_LOGIN_CALLBACK_URL = process.env.NODE_ENV === "production"? 
"https://aphacrunch-api.onrender.com/auth/google/login/callback" : "/auth/google/login/callback"

passport.use("google-signup",new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_SIGNUP_CALLBACK_URL,
    scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  },
  async (token, tokenSecret, profile, done) => {
    try {
      const user = {
          googleId: profile?.id,
          email: profile?.emails[0]?.value,
          fullName: profile?.displayName,
          role: roles.client,
          confirmedEmail: true,
          // sex: profile?.gender 
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
    
  }
));

passport.use("google-login",new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: GOOGLE_LOGIN_CALLBACK_URL,
  scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
},
async (token, tokenSecret, profile, done) => {
  try {
    const user = {
      googleId: profile?.id,
      email: profile?.emails[0]?.value,
      fullName: profile?.displayName,
      confirmedEmail: true
    };
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}
));

module.exports = passport;