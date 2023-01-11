
const bcrypt = require('bcrypt');
const { roles } = require('../utils/constants');

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


exports.encryptPasswordSetRole = async function(next){
    try {
        if (this.isNew) {
            // hash password
            const hashedPassword = await bcrypt.hash(this.password, 13);
            console.log(this.password);
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
