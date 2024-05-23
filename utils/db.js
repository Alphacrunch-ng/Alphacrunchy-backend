// Database connection function
const mongoose = require('mongoose');
require('dotenv').config();
let DB = process.env.DATABASE_URL;
if (process.env.NODE_ENV === 'development') {
  DB = "mongodb://localhost:27017/alphacrunch";
}

const mongodb = async () => {

  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Database connection successful!`);
  } catch (err) {
    console.log(err);
  }
}

module.exports = mongodb;