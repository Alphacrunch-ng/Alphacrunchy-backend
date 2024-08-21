const GiftCardTransaction = require("../giftcardTransactionModel");
const GiftCardRate = require("../giftCardRateModel");

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

exports.findGiftCardRateById = async ({ id }) => {
    try {

        const giftcardRate = await GiftCardRate.findById(id);
        if (!giftcardRate){
            throw new Error("GiftCard Rate not found");
        }
        return giftcardRate;
    } catch (error) {
        throw error;
    }
} 