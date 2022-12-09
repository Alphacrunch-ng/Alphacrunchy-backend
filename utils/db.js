// Database connection function
const mongoose = require('mongoose')
require('dotenv').config()
const DB = process.env.DATABASE_URL
// 
const mongodb = async ()=> { 
 
    try {
       await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true
            });
        console.log(`Database connection successful!`)    
    } catch (err) {
        console.log(err); 
    }
    }
    
module.exports = mongodb;