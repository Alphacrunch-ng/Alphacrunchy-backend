const GiftCardTransaction = require("../giftcardTransactionModel");

exports.updateGiftCardTransactionPaidAmount = async (transaction_number, amount) => {
    try {
        const giftCardTransaction = await GiftCardTransaction.findOne({
            transaction_number: transaction_number,
        });
        if (!giftCardTransaction) {
            throw new Error("Gift card transaction not found");
        }
        giftCardTransaction.total_amount_paid = amount;
        await giftCardTransaction.save();
    } catch (error) {
        throw error;
    }
}