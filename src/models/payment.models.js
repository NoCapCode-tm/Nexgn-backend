import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },

        subscriptionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subscription",
            required: true,
            index: true
        },

        razorpayPaymentId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        razorpaySubscriptionId: {
            type: String,
            required: true,
            index: true
        },

        razorpayInvoiceId: {
            type: String,
            default: null,
            index: true
        },

        razorpayOrderId: {
            type: String,
            default: null
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        status: {
            type: String,
            enum: [
                "created",
                "authorized",
                "captured",
                "failed",
                "refunded"
            ],
            required: true
        },

        method: {
            type: String,
            default: null
        },

        email: {
            type: String,
            default: null
        },

        contact: {
            type: String,
            default: null
        },

        paidAt: {
            type: Date,
            default: null
        },

        receiptUrl: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const payment = mongoose.model(
    "payment",
    PaymentSchema
);