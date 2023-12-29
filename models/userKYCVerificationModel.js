const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userKYCVerificationSchema = new Schema({
  DOB: String,
  Photo: String,
  Gender: String,
  IDType: String,
  Actions: {
    Verify_ID_Number: String,
    Return_Personal_Info: String
  },
  Address: String,
  Country: String,
  Document: String,
  FullData: {
    age: Number,
    dob: String,
    gender: String,
    haIdno: String,
    IDPhoto: String,
    message: String,
    success: Boolean,
    surname: String,
    idNumber: String,
    idBlocked: String,
    idCardInd: String,
    inputIdno: String,
    firstNames: String,
    idCardDate: String,
    citizenship: String,
    deceasedDate: String,
    marriageDate: String,
    maritalStatus: String,
    countryofBirth: String,
    deceasedStatus: String,
    idnoMatchStatus: String,
    haIdBookIssuedDate: String,
    identityDocumentType: String
  },
  FullName: String,
  IDNumber: String,
  ResultCode: String,
  ResultText: String,
  SmileJobID: String,
  PhoneNumber: String,
  PhoneNumber2: String,
  PartnerParams: {
    job_id: String,
    user_id: String,
    job_type: String
  },
  ExpirationDate: String,
  IDNumberPreviouslyRegistered: Boolean,
  UserIDsOfPreviousRegistrants: [String],
  ImageLinks: {
    selfie_image: String
  },
  KYCReceipt: String,
  signature: String,
  timestamp: Date
});

const UserKYCVerification = mongoose.model('UserKYCVerification', userKYCVerificationSchema);

module.exports = UserKYCVerification;
