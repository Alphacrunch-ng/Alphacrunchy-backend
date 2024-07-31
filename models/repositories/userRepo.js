const User = require('../userModel');
const { roles } = require('../../utils/constants');
const { hashPassword } = require('../../utils/crypto/hash');

/**
 * Finds a user by their email address.
 * @param {Object} user - requery data
 * @param {string} user.email - The email address of the user.
 * @returns {Promise<Object>} - The user document.
 */
const getUserByEmailHelper = async ({ email }) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(`Error finding user by email: ${error.message}`);
  }
};

/**
 * Deletes a user by their ID.
 * @param {Object} user 
 * @param {string} user.userId - The ID (id or _id) of the user.
 * @returns {Promise<Object>} - The user document.
 */
const getUserByIdHelper = async ({ userId }) => {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  };

/**
 * Finds a user by their Google ID.
 * @param {string} googleId - The Google ID of the user.
 * @returns {Promise<Object>} - The user document.
 */
const getUserByGoogleIdHelper = async (googleId) => {
  try {
    const user = await User.findOne({ googleId });
    return user;
  } catch (error) {
    throw new Error(`Error finding user by Google ID: ${error.message}`);
  }
};

/**
 * Creates a new user.
 * @param {Object} userData - The data for the new user.
 * @returns {Promise<Object>} - The created user document.
 */
const createUserHelper = async ({
  fullName,
  firstName,
  lastName,
  middleName,
  email,
  sex,
  dob,
  profilePicture_url,
  profilePic_cloudId,
  phoneNumber,
  country,
  state,
  city,
  address,
  password,
  googleId,
  role,
  otp,
  confirmedEmail,
} = {}) => {
  try {
    
    const userData = {
      ...(fullName && { fullName }),
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(middleName && { middleName }),
      ...(email && { email }),
      ...(sex && { sex }),
      ...(dob && { dob }),
      ...(profilePicture_url && { profilePicture_url }),
      ...(profilePic_cloudId && { profilePic_cloudId }),
      ...(phoneNumber && { phoneNumber }),
      ...(country && { country }),
      ...(state && { state }),
      ...(city && { city }),
      ...(address && { address }),
      ...(password && { password }),
      ...(googleId && { googleId }),
      ...(role && { role }),
      ...(otp && { otp }),
      ...(confirmedEmail !== undefined && { confirmedEmail })
    };

    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error(`Error creating user: ${error.message}`);
  }
};


/**
 * Updates a user by their ID.
 * @param {string} userId - The ID of the user.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<Object>} - The updated user document.
 */
const updateUserByIdHelper = async (userId, updateData) => {
  try {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return user;
  } catch (error) {
    throw new Error(`Error updating user by ID: ${error.message}`);
  }
};

/**
 * Deletes a user by their ID.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Object>} - The deleted user document.
 */
const deleteUserByIdHelper = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (error) {
    throw new Error(`Error deleting user by ID: ${error.message}`);
  }
};

/**
 * Finds or creates a user based on the provided profile.
 * @param {Object} profile - The profile object from Google.
 * @returns {Promise<Object>} - The found or created user document.
 */
const findOrCreateUserHelper = async (profile) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      return user;
    } else {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        fullName: profile.displayName,
        role: roles.client,
        confirmedEmail: true,
        sex: profile.sex,
      });
      return user;
    }
  } catch (error) {
    throw new Error(`Error finding or creating user: ${error.message}`);
  }
};

module.exports = {
  getUserByEmailHelper,
  getUserByGoogleIdHelper,
  getUserByIdHelper,
  createUserHelper,
  updateUserByIdHelper,
  deleteUserByIdHelper,
  findOrCreateUserHelper,
};
