
const bcrypt = require('bcrypt');
const { roles, Status } = require('../utils/constants');
const { createWalletNumber } = require('../utils/services');
const { hashPassword } = require('../utils/crypto/hash');

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
    try {
        await this.populate('card_rate_id');
        
        // Now cards will be populated
        const cards = this.cards;
        
        // Calculate total cards
        this.total_cards = cards.length;
        
        let totalAmountExpected = 0;
        let totalAmount = 0;
        // Assuming this.card_rate_id.rate is populated
        const rate = this.card_rate_id.rate;
        
        cards.forEach(card => {
            
            totalAmountExpected += card.amount * rate;
            if (card.state === Status.approved) {
                totalAmount += card.amount;
            }
        });
        this.total_amount_expected = totalAmountExpected;
        next();
    } catch (error) {
        next();
    }
}


// exports.sum = async function(next){
//     const cards = this.cards.populate('rate');
//     this.total_cards = cards.length
//     let totalAmountExpected = 0;
//     let totalAmount = 0;
//     try {
//         cards.forEach(card => {
//             totalAmountExpected += card.amount * card.rate.rate;
//             if (card.state === Status.approved) {
//                 totalAmount += card.amount;
//             }

//         });
//         next();
//     } catch (error) {
//         next();
//     }
// }

exports.setWalletNumber = async function(next){
    try {
        if (this.isNew) {
            this.wallet_number = createWalletNumber(8);
        }
        next();
    } catch (error) {
        console.log('Error in setWalletNumber', err)
        next();
    }
}

exports.set2FA = async function(next){
    try{
        if (this.isNew) {
            this.twoFactorAuth.email = this.email
            this.twoFactorAuth.phoneNumber = this.phoneNumber
            this.twoFactorAuth.secret = '',
            this.twoFactorAuth.enabled = false
        }
        next();
    }catch(error){
        console.log('Error in setTwoFa', err)
        next()
    }
}

exports.setTransactionNumber = async function(next){
    try {
        if (this.isNew && !this.transaction_number) {
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
            const hashedPassword = await hashPassword(this.password);
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
            const lowerCaseEmail = this.email.toLowerCase();
            let normalizedEmail = lowerCaseEmail.replace(/[^\w\s@.]/gi, '');
            this.email = normalizedEmail;
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

exports.updateGiftcardTransactionStatus = async function (next) {
    // Check if all cards are approved
    const allCardsApproved = this.cards.every((card) => card.state === Status.approved);
    const allCardsFailed = this.cards.every((card) => card.state === Status.failed);
    
    // Set the status to approved if all cards are approved
    if (allCardsApproved) {
      this.status = Status.approved;
    }
    else if (allCardsFailed) {
        this.status = Status.failed;
    }
  
    // Continue with the save operation
    next();
  }

exports.checkAndUpdateGiftcardTransactionStatus = async function(next){
    // Check if the update includes changes to card statuses
    const updatedCards = this._update.$set && this._update.$set.cards;
    if (updatedCards) {
        const allCardsApproved = updatedCards.every((card) => card.state === Status.approved);
        const allCardsFailed = updatedCards.every((card) => card.state === Status.failed);
        // Set the status to approved if all cards are approved
        if (allCardsApproved) {
            this._update.$set.status = Status.approved;
        } else if (allCardsFailed) {
            this._update.$set.status = Status.failed;
        }
    }

    // Continue with the update operation
    next();
}