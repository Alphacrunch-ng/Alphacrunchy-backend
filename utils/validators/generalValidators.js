exports.isValidAmount = (amount) => {
    return !isNaN(parseFloat(amount)) && isFinite(amount);
  }