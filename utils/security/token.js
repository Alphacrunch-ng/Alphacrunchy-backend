// authUtils.js
const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for a user.
 * @param {Object} user - The user object.
 * @param {string} user._id - The user's unique ID.
 * @param {string} user.email - The user's email address.
 * @param {string} user.fullName - The user's full name.
 * @param {string} user.role - The user's role.
 * @returns {Object: {String, Date}} token An object containing the generated token and its expiration time.
 * @returns {string} token.token - The generated JWT token.
 * @returns {Date} token.expiresIn - The token expiration time.
 */
exports.generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  const dataStoredInToken = {
    id: user._id.toString(),
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };

  // Signing token
  const token = jwt.sign(dataStoredInToken, secret, {
    expiresIn: "7d",
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER
  });

  const today = new Date();
  const expiresIn = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)); // Token expiration time (7 days)

  return { token, expiresIn };
};
