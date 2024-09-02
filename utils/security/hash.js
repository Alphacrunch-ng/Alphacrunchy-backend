const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password.
 * @param {String} password - The plain text password to hash.
 * @returns {String} hash The hashed password.
 */
exports.hashPassword = async ( password ) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * Compares a plain text password with a hashed password.
 * @param password - The plain text password.
 * @param hash - The hashed password.
 * @returns A boolean indicating if the passwords match.
 */
exports.comparePassword = async (password, hash) => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};
