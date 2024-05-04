const mongoose = require("mongoose");
const { Status, transactionTypes } = require("../utils/constants");

const TransactionApprovalSchema = new mongoose.Schema(
    {
        transaction_type: {
            type: String,
            enum: {
                values: Object.values(transactionTypes),
                message: "transaction type can either be 'wallet', 'giftcard', or 'crypto'",
            },
            required: true,
        },
        transaction_number: {
            type: String,
            required: true,
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: {
                values: Object.values(Status),
                message: "status can either be "+ Object.values(Status).join(" or "),
            },
            required: true,
        },
        comment: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
);
const transactionApproval = mongoose.model("TransactionApproval", TransactionApprovalSchema);
module.exports = transactionApproval;

