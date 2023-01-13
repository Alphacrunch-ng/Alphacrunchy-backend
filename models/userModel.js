// general user model

// importing mongoose
const mongoose = require('mongoose');
const { roles } = require('../utils/constants');
const { isEmail } = require('validator');
const { encryptPasswordSetRole, modifiedAt } = require('./hooks');

const userSchema = new mongoose.Schema({
    fullName : {
        type: String,
        required: ['true', 'fullName is required.']
    },
    email : {
        type: String,
        required: ['true', 'email is required.'],
        validate: [isEmail, 'please enter a valid email']
    },
    sex: {
        type: String,
        enum: {
            values: ['male', 'female'],
            message: "status can either be 'male' or 'female'",
        },
        required: ['true', "Input your sex"]
    },
    profilePicture_url : {
        type: String
    },
    profilePic_cloudId: {
        type: String,
    },
    phoneNumber : {
        type: String,
        required: ['true', 'phone number is required.']
    },
    city : {
        type: String
    },
    state : {
        type: String,
    },
    address : {
        type: String,
    },
    password : {
        type: String,
        required: ['true', 'password is required.']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    modifiedAt: {
        type: Date,
        default: Date.now()
    },
    role : {
        type: String,
        enum: [roles.admin, roles.staff, roles.client],
        default: roles.client
    },
    otp:{
        type: String
    },
    verified : {
        type: Boolean,
        default: false
    },
    confirmedEmail : {
        type: Boolean,
        default: false
    },
    active : {
        type: Boolean,
        default: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
});

//encrypts the password and sets the role
userSchema.pre("save", encryptPasswordSetRole);

//setting modifiedAt to current time after every update
userSchema.pre('save', modifiedAt);

const User = mongoose.model('User', userSchema);

module.exports = User;