exports.roles = {
    admin: 'ADMIN',
    staff:  'STAFF',
    client: 'CLIENT'
}

exports.operations = {
    changedPassword: 'Changed Password',
    requestResetPassword: 'Request Reset Password',
    debit: 'Debit',
    credit: 'Credit',
    transfer: 'Transfer'
}

exports.product_name = 'Cambio';

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