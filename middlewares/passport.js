const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ['profile', 'email', 'openid', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
  },
  async (token, tokenSecret, profile, done) => {
    const user = {
        googleId: profile?.id,
        email: profile?.emails[0]?.value,
        fullName: profile?.displayName,
        role: roles.client,
        confirmedEmail: true,
        sex: profile?.gender 
    }
    return done(err, user);
  }
));

// passport.serializeUser((user, done) => {
//   done(null,  {...user});
// });

// passport.deserializeUser((user, done) => done(err, user));
