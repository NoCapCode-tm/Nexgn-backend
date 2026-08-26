import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        billingPeriod: {
            type: String,
            enum: ["free", "monthly", "yearly"],
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        currency: {
            type: String,
            default: "INR"
        },

        razorpayPlanId: {
            type: String,
            default: null
        },

        description: {
            type: String,
            default: ""
        },

        features: {
            type: [String],
            default: []
        },

        active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

SubscriptionPlanSchema.index(
    { slug: 1, billingPeriod: 1 },
    { unique: true }
);

export const subscriptionPlan =
    mongoose.model(
        "subscriptionPlan",
        SubscriptionPlanSchema
    );