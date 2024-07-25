
exports.validatePassword = function(password, validators) {
    return validators.every(validator => validator(password));
}