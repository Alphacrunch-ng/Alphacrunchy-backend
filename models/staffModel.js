const mongoose = require('mongoose');
const userSchema = require('./userModel');
const { roles } = require('../utils/constants');


const staffSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  employmentDate: {
    type: Date,
    required: true,
  },
  employmentId: {
    type: String,
    unique: true,
  },
  supervisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
  },
  salary: {
    type: Number,
  },
  status: {
    type: String,
    enum: ["active", "leave", "terminated", "resigned", "suspended", "inactive"],
    default: "active",
  }
});

const StaffSchema = userSchema.clone().add(staffSchema.obj);

StaffSchema.pre('save', function(next){
  this.role = roles.staff;
  next();
});

const Staff = mongoose.model('Staff', StaffSchema);

module.exports = Staff;