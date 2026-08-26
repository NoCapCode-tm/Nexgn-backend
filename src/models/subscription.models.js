import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true
        },

        planId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subscriptionPlan",
            required: true
        },

        razorpaySubscriptionId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        razorpayPlanId: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: [
                "created",
                "authenticated",
                "active",
                "pending",
                "halted",
                "paused",
                "resumed",
                "cancelled",
                "completed",
                "expired"
            ],
            default: "created"
        },

        startDate: {
            type: Date,
            default: null
        },

        endDate: {
            type: Date,
            default: null
        },

        currentPeriodStart: {
            type: Date,
            default: null
        },

        currentPeriodEnd: {
            type: Date,
            default: null
        },

        chargeAt: {
            type: Date,
            default: null
        },

        totalCount: {
            type: Number,
            default: null
        },

        paidCount: {
            type: Number,
            default: 0
        },

        remainingCount: {
            type: Number,
            default: null
        },

        razorpayCustomerId: {
            type: String,
            default: null
        },

        lastPaymentId: {
            type: String,
            default: null
        },

        lastInvoiceId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

export const subscription = mongoose.model(
    "subscription",
    SubscriptionSchema
);