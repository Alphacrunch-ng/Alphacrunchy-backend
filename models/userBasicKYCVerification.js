const mongoose = require('mongoose');

const userBasicKYCVerificationSchema = new mongoose.Schema({
  Source: { type: String, required: true },
  Actions: {
    Liveness_Check: { type: String, required: true },
    Register_Selfie: { type: String, required: true },
    Selfie_Provided: { type: String, required: true },
    Verify_ID_Number: { type: String, required: true },
    Human_Review_Compare: { type: String, required: true },
    Return_Personal_Info: { type: String, required: true },
    Selfie_To_ID_Card_Compare: { type: String, required: true },
    Human_Review_Update_Selfie: { type: String, required: true },
    Human_Review_Liveness_Check: { type: String, required: true },
    Selfie_To_ID_Authority_Compare: { type: String, required: true },
    Update_Registered_Selfie_On_File: { type: String, required: true },
    Selfie_To_Registered_Selfie_Compare: { type: String, required: true },
  },
  ResultCode: { type: String, required: true },
  ResultText: { type: String, required: true },
  SmileJobID: { type: String, required: true },
  PartnerParams: {
    job_id: { type: String, required: true },
    user_id: { type: String, required: true },
    job_type: { type: String, required: true },
  },
  ConfidenceValue: { type: String, required: true },
  ImageLinks: {
    selfie_image: { type: String, required: true },
  },
  signature: { type: String, required: true },
  timestamp: { type: Date, required: true },
});

const UserBasicKYCVerification = mongoose.model('UserKYCVerification', userBasicKYCVerificationSchema);

module.exports = UserBasicKYCVerification;
