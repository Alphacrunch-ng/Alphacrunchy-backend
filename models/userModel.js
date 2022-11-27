// general user model

// importing mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName : {
        type: String,
        required: ['true', 'first name is required.']
    },
    lastName : {
        type: String,
        required: ['true', 'last name is required.']
    },
    email : {
        type: String,
        required: ['true', 'email is required.']
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
        required: ['true', 'state is required.']
    },
    address : {
        type: String,
        required: ['true', 'address is required.']
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
        enum: ['admin','staff','user'],
        default: 'user'
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

const User = mongoose.model('User', userSchema);

module.exports = User;