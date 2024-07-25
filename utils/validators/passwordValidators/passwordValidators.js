const lengthValidator = (password) => password.length > 7;

const uppercaseValidator = (password) => /[A-Z]/.test(password);

const symbolValidator = (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password);

const numberValidator = (password) => /[0-9]/.test(password);

module.exports = {
    lengthValidator,
    uppercaseValidator,
    symbolValidator,
    numberValidator,
};