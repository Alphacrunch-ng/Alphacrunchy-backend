const mongoose = require('mongoose');
const { roles, staffStatuses } = require('../utils/constants');


const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
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
    enum: Object.values(staffStatuses),
    default: staffStatuses.active,
  }
});


staffSchema.pre('save', function (next) {
  this.role = roles.staff;
  next();
});

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;