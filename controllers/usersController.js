const bcrypt = require('bcrypt');
const User = require('../models/userModel.js')

// controller for signing up  a Admin
exports.signup = async (req, res, role, next) => {
    try {
        let checkUser = User.findOne({ email: req.body.email});
        if (checkUser) {
            return res.status(401).json({
                status: 'failed',
                message: 'email already exists'
            })         
        }
        // input validation product
        if (req.body.password !== req.body.confirmPassword) {
            return res.status(400).json({
                status: 'failed',
                message: `password and confirm password doesn't match`
            });
        }
        const {firstName, lastName, email, phoneMumber, sex, password } = req.body;
        
        // hash password
        const hashedPassword = await bcrypt.hash(password, 13);
        let newStaff = {
            firstName,
            lastName,
            email,
            sex,
            phoneMumber,
            role,
            password
        }

        const staff = await User.create(newStaff);
        res.status(201).json({
            status: 'success',
            message: 'Welcome to Alphacrunch',
            data: staff
        });
    } catch (error) {
        res.status(500).json({
            status: 'failed',
            message: 'An error occured, we are working on it',
            error: error.message
        });
    }
}