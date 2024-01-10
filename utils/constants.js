exports.roles = {
    admin: 'ADMIN',
    staff:  'STAFF',
    client: 'CLIENT'
}

exports.transactionTypes = {
    wallet: 'wallet',
    giftcard: 'giftcard',
    crypto: 'crypto'
}

exports.operations = {
    changedWalletPin: 'Changed Wallet Pin',
    changedPassword: 'Changed Password',
    requestResetPassword: 'Request Reset Password',
    debit: 'Debit',
    credit: 'Credit',
    transfer: 'Transfer',
    sellGiftcard: 'Sell Giftcard',
    basicKycSuccess: "Basic KYC Success",
    basicKycFailed: "Basic KYC Failed",
    biometricKycSuccess: "Biometric KYC success",
    biometricKycFailed: "Biometric KYC failed"
}

exports.product_name = 'Cambio';
exports.frontend_link = "https://cambio.ng"
exports.backend_link = "https://aphacrunch-api.onrender.com"
exports.logo_url = "https://res.cloudinary.com/dkgblnkxm/image/upload/v1694926535/w2wnxtjjbydmtjru2gjg.png"

exports.Status = {
    approved: 'approved',
    pending : 'pending',
    failed: 'failed',
    successful: 'successful'
}

exports.CustomEvents = {
    newMessage: 'new_message',
    deleteMessage: 'delete_message',
    debitTransaction: 'debit_transaction',
    creditTransaction: 'credit_transaction',
    newNotification: 'new_notification'
}

exports.CardTypes= {
    physical: "Physical Card",
    eCode: "E-Code"
}

exports.urls = {
    getFormSubmits: "https://formsubmit.co/api/get-submissions/", // api key to be concatenated to this url
    
}