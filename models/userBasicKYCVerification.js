const mongoose = require('mongoose');

const userBasicKYCVerificationSchema = new mongoose.Schema({
  Actions: {
    Return_Personal_Info: { type: String, required: true },
    Verify_ID_Number: { type: String, required: true },
    Names: { type: String, required: true },
    DOB: { type: String, required: true },
    Gender: { type: String, required: true },
    Phone_Number: { type: String, required: true },
    Secondary_ID_Number: { type: String, required: true },
    ID_Verification: { type: String, required: true }
  },
  ResultCode: { type: String, required: true },
  ResultText: { type: String, required: true },
  ResultType: { type: String},
  SmileJobID: { type: String, required: true },
  PartnerParams: {
    job_id: { type: String, required: true },
    user_id: { type: String, required: true },
    job_type: { type: String, required: true },
  },
  Source: { type: String, required: true },
  signature: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const UserBasicKYCVerification = mongoose.model('UserKYCVerification', userBasicKYCVerificationSchema);

module.exports = UserBasicKYCVerification;
