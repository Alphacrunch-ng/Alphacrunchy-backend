const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { roles } = require('../utils/constants');

passport.use("google-signup",new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/signup/callback",
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
  callbackURL: "/auth/google/login/callback",
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