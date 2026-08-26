import "dotenv/config";
import mongoose from "mongoose";

import { razorpay } from "../config/razorpay.js";
import {
    subscriptionPlan
} from "../models/subscriptionPlan.models.js";


const plans = [
    {
        name: "Starter",
        slug: "starter",
        billingPeriod: "monthly",
        amount: 100, // ₹1
        currency: "INR",
        description:
            "Built for freelancers and small businesses.",
        features: [
            "100 documents per month",
            "Professional signing tools",
            "Templates and reminders",
            "SETU integration",
            "Basic automation support"
        ]
    },

    {
        name: "Starter",
        slug: "starter",
        billingPeriod: "yearly",
        amount: 1200, // ₹12
        currency: "INR",
        description:
            "Built for freelancers and small businesses.",
        features: [
            "100 documents per month",
            "Professional signing tools",
            "Templates and reminders",
            "SETU integration",
            "Basic automation support"
        ]
    },

    {
        name: "Business",
        slug: "business",
        billingPeriod: "monthly",
        amount: 200, // ₹2
        currency: "INR",
        description:
            "Designed for growing teams.",
        features: [
            "Unlimited documents",
            "Bulk sending",
            "Team collaboration",
            "API access",
            "Aadhaar verification credits",
            "Custom branding",
            "Priority support"
        ]
    },

    {
        name: "Business",
        slug: "business",
        billingPeriod: "yearly",
        amount: 2400, // ₹24
        currency: "INR",
        description:
            "Designed for growing teams.",
        features: [
            "Unlimited documents",
            "Bulk sending",
            "Team collaboration",
            "API access",
            "Aadhaar verification credits",
            "Custom branding",
            "Priority support"
        ]
    }
];


const seedPlans = async () => {

    try {

        console.log("Connecting to MongoDB...");

        await mongoose.connect(
            process.env.DB_URI
        );

        console.log(
            "MongoDB connected successfully."
        );


        if (
            !process.env.RAZORPAY_KEY_ID?.startsWith(
                "rzp_test_"
            )
        ) {
            throw new Error(
                "Please use Razorpay TEST credentials."
            );
        }


        for (const plan of plans) {

            console.log(
                `\nCreating ${plan.name} - ${plan.billingPeriod}`
            );


            /*
             * Create Razorpay Test Plan
             */
            const razorpayPlan =
                await razorpay.plans.create({

                    period:
                        plan.billingPeriod ===
                        "monthly"
                            ? "monthly"
                            : "yearly",

                    interval: 1,

                    item: {
                        name:
                            `${plan.name} - ${plan.billingPeriod}`,

                        amount:
                            plan.amount,

                        currency:
                            plan.currency,

                        description:
                            plan.description
                    }
                });


            console.log(
                "Razorpay Plan Created:",
                razorpayPlan.id
            );


            /*
             * Create MongoDB Plan
             */
            const mongoPlan =
                await subscriptionPlan.create({

                    ...plan,

                    razorpayPlanId:
                        razorpayPlan.id,

                    active: true
                });


            console.log(
                "MongoDB Plan Created:",
                mongoPlan._id
            );


            console.log({
                name:
                    mongoPlan.name,

                billingPeriod:
                    mongoPlan.billingPeriod,

                amount:
                    mongoPlan.amount,

                displayAmount:
                    `₹${(
                        mongoPlan.amount / 100
                    ).toFixed(2)}`,

                razorpayPlanId:
                    mongoPlan.razorpayPlanId
            });
        }


        console.log(
            "\n===================================="
        );

        console.log(
            "ALL TEST PLANS CREATED SUCCESSFULLY"
        );

        console.log(
            "===================================="
        );


        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "\n===================================="
        );

        console.error(
            "PLAN SEEDING FAILED"
        );

        console.error(
            "===================================="
        );


        console.error(
            "Message:",
            error?.message
        );


        console.error(
            "Razorpay error:",
            error?.error
                ? JSON.stringify(
                    error.error,
                    null,
                    2
                )
                : "N/A"
        );


        console.error(
            "Full error:",
            JSON.stringify(
                error,
                null,
                2
            )
        );


        try {
            await mongoose.disconnect();
        } catch {}


        process.exit(1);
    }
};


seedPlans();