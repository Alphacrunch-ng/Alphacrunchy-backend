
const bcrypt = require('bcrypt');
const { roles, Status } = require('../utils/constants');
const { createWalletNumber } = require('../utils/services');

exports.modifiedAt = async function(next){
    try {
        if (!this.isNew) {
            this.modifiedAt = Date.now();
        }
        next();
    } catch (error) {
        next();
    }
}

exports.sum = async function(next){
    const cards = this.cards;
    this.total_cards = cards.length
    let totalAmountExpected = 0;
    let totalAmount = 0;
    try {
        cards.forEach(card => {
            totalAmountExpected += card.amount;
            if (card.state === Status.approved) {
                totalAmount += card.amount;
            }

        });

        this.total_amount_expected = totalAmountExpected * this.rate;
        this.total_amount_paid = totalAmount * this.rate;

        next();
    } catch (error) {
        next();
    }
}

exports.setWalletNumber = async function(next){
    try {
        if (this.isNew) {
            this.wallet_number = createWalletNumber(8);
        }
        next();
    } catch (error) {
        next();
    }
}

exports.setTransactionNumber = async function(next){
    try {
        if (this.isNew) {
            this.transaction_number = createWalletNumber(11);
        }
        next();
    } catch (error) {
        next();
    }
}

exports.encryptPassword = async function(next){
    try {
        if (this.isNew) {
            // hash password
            const hashedPassword = await bcrypt.hash(this.password, 10);
            this.password = hashedPassword
            if (this.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
              this.role = roles.admin;
            }
        }
        next();
    } catch (error) {
        next();
    }
}

exports.setRole = async function(next){
    try {
        if (this.isNew) {
            if (this.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
              this.role = roles.admin;
            }
        }
        next();
    } catch (error) {
        next();
    }
}

exports.normalizeEmail = async function(next){
    try {
        if (this.isNew) {
            // hash password
            const lowerCaseEmail = this.email.toLowerCase();
            this.email = lowerCaseEmail;
        }
        next();
    } catch (error) {
        next();
    }
}

exports.populateUserId = async (next) => {
    this.populate({
        path: 'User',
        select: '_id fullName profilePicture_url'
    })

    next()
}