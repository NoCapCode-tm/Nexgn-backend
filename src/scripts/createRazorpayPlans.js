import "dotenv/config";
import mongoose from "mongoose";

import { razorpay } from "../config/razorpay.js";
import { subscriptionPlan } from "../models/subscriptionPlan.models.js";

const plans = [
    {
        name: "Free",
        slug: "free",
        billingPeriod: "free",
        amount: 0,
        currency: "INR",
        description: "Perfect for individuals and early exploration.",
        features: [
            "No Credit Card",
            "19 Monthly Envelopes",
            "Zero Signer Accounts",
            "AES-256 Vault Encryption",
            "Sealed Audit Certificates",
            "Multi-Format Support",
            "Tamper-Evident Delivery",
            "Mobile-Optimized Signing",
            "Instant Status Alerts",
            "Global ESIGN Compliance"
        ]
    },

    {
        name: "Starter",
        slug: "starter",
        billingPeriod: "monthly",
        amount: 90000, // ₹900
        currency: "INR",
        description: "Built for freelancers and small businesses.",
        features: [
            "49 Monthly Envelopes",
            "Multi-Signer Routing",
            "Automated Email Reminders",
            "Reusable Contract Templates",
            "Granular Field Positioning",
            "IP Timestamp Tracking",
            "Custom Link Expiry",
            "Signer Delegation Rules",
            "Shared Team Folders",
            "Standard SLA Support"
        ]
    },

    {
        name: "Starter",
        slug: "starter",
        billingPeriod: "yearly",
        amount: 1080000, // ₹10,800
        currency: "INR",
        description: "Built for freelancers and small businesses.",
        features: [
            "49 Monthly Envelopes",
            "Multi-Signer Routing",
            "Automated Email Reminders",
            "Reusable Contract Templates",
            "Granular Field Positioning",
            "IP Timestamp Tracking",
            "Custom Link Expiry",
            "Signer Delegation Rules",
            "Shared Team Folders",
            "Standard SLA Support"
        ]
    },

    {
        name: "Business",
        slug: "business",
        billingPeriod: "monthly",
        amount: 190000, // ₹1,900
        currency: "INR",
        description: "Designed for growing teams.",
        features: [
            "Unlimited Document Execution",
            "Role-Based Team Workspaces",
            "Full REST APIs",
            "Real-Time Webhooks",
            "Aadhaar Verification Credits",
            "CSV Bulk Dispatch",
            "Custom Brand White-Labeling",
            "Enterprise SSO Integration",
            "Custom Data Residency",
            "Conditional Logic Routing",
            "Advanced Impact Analytics",
            "Dedicated Priority Queue"
        ]
    },

    {
        name: "Business",
        slug: "business",
        billingPeriod: "yearly",
        amount: 2280000, // ₹22,800
        currency: "INR",
        description: "Designed for growing teams.",
        features: [
            "Unlimited Document Execution",
            "Role-Based Team Workspaces",
            "Full REST APIs",
            "Real-Time Webhooks",
            "Aadhaar Verification Credits",
            "CSV Bulk Dispatch",
            "Custom Brand White-Labeling",
            "Enterprise SSO Integration",
            "Custom Data Residency",
            "Conditional Logic Routing",
            "Advanced Impact Analytics",
            "Dedicated Priority Queue"
        ]
    }
];

const seedPlans = async () => {
    try {
        console.log("\n====================================");
        console.log("NEXGN RAZORPAY PLAN SEEDER");
        console.log("====================================\n");

        // --------------------------------------------------
        // 1. Check environment
        // --------------------------------------------------

        const keyId = process.env.RAZORPAY_KEY_ID;

        if (!keyId) {
            throw new Error(
                "RAZORPAY_KEY_ID is missing from environment variables."
            );
        }

        const isLiveMode = keyId.startsWith("rzp_live_");
        const isTestMode = keyId.startsWith("rzp_test_");

        if (!isLiveMode && !isTestMode) {
            throw new Error(
                "Invalid Razorpay Key ID. It must start with rzp_test_ or rzp_live_."
            );
        }

        console.log(
            `Razorpay Mode: ${isLiveMode ? "LIVE" : "TEST"}`
        );

        // --------------------------------------------------
        // 2. Connect MongoDB
        // --------------------------------------------------

        console.log("\nConnecting to MongoDB...");

        await mongoose.connect(process.env.DB_URI);

        console.log("MongoDB connected successfully.");

        // --------------------------------------------------
        // 3. Process plans
        // --------------------------------------------------

        for (const plan of plans) {
            console.log(
                `\n------------------------------------`
            );

            console.log(
                `Processing: ${plan.name} - ${plan.billingPeriod}`
            );

            // --------------------------------------------------
            // FREE PLAN
            // --------------------------------------------------

            if (plan.slug === "free") {
                const freePlan = await subscriptionPlan.findOneAndUpdate(
                    {
                        slug: "free",
                        billingPeriod: "free"
                    },
                    {
                        $set: {
                            ...plan,
                            razorpayPlanId: null,
                            active: true
                        }
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                );

                console.log("\nFREE PLAN READY");

                console.log({
                    mongoId: freePlan._id,
                    name: freePlan.name,
                    billingPeriod: freePlan.billingPeriod,
                    amount: freePlan.amount,
                    razorpayPlanId: null
                });

                continue;
            }

            // --------------------------------------------------
            // FIND EXISTING MONGO PLAN
            // --------------------------------------------------

            let mongoPlan = await subscriptionPlan.findOne({
                slug: plan.slug,
                billingPeriod: plan.billingPeriod
            });

            let razorpayPlanId = mongoPlan?.razorpayPlanId || null;

            // --------------------------------------------------
            // CHECK WHETHER EXISTING RAZORPAY PLAN IS VALID
            // FOR CURRENT ENVIRONMENT
            // --------------------------------------------------

            if (razorpayPlanId) {
                try {
                    console.log(
                        `Checking existing Razorpay plan: ${razorpayPlanId}`
                    );

                    await razorpay.plans.fetch(
                        razorpayPlanId
                    );

                    console.log(
                        "Existing Razorpay plan is valid."
                    );

                } catch (error) {
                    console.log(
                        "Existing Razorpay plan is not available in current Razorpay environment."
                    );

                    console.log(
                        "Creating a new Razorpay plan..."
                    );

                    razorpayPlanId = null;
                }
            }

            // --------------------------------------------------
            // CREATE RAZORPAY PLAN IF NEEDED
            // --------------------------------------------------

            if (!razorpayPlanId) {
                const razorpayPlan =
                    await razorpay.plans.create({
                        period:
                            plan.billingPeriod === "monthly"
                                ? "monthly"
                                : "yearly",

                        interval: 1,

                        item: {
                            name: `${plan.name} - ${plan.billingPeriod}`,

                            amount: plan.amount,

                            currency: plan.currency,

                            description: plan.description
                        }
                    });

                razorpayPlanId = razorpayPlan.id;

                console.log(
                    "New Razorpay plan created:",
                    razorpayPlanId
                );
            }

            // --------------------------------------------------
            // UPDATE / CREATE MONGO PLAN
            // --------------------------------------------------

            mongoPlan =
                await subscriptionPlan.findOneAndUpdate(
                    {
                        slug: plan.slug,
                        billingPeriod: plan.billingPeriod
                    },
                    {
                        $set: {
                            ...plan,
                            razorpayPlanId,
                            active: true
                        }
                    },
                    {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true
                    }
                );

            console.log(
                "\nMongoDB plan ready:"
            );

            console.log({
                mongoId: mongoPlan._id,
                name: mongoPlan.name,
                billingPeriod: mongoPlan.billingPeriod,
                amount: mongoPlan.amount,
                displayAmount:
                    `₹${(
                        mongoPlan.amount / 100
                    ).toFixed(2)}`,
                razorpayPlanId:
                    mongoPlan.razorpayPlanId
            });
        }

        // --------------------------------------------------
        // DONE
        // --------------------------------------------------

        console.log("\n====================================");
        console.log(
            `ALL ${isLiveMode ? "LIVE" : "TEST"} PLANS READY`
        );
        console.log("====================================\n");

        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error("\n====================================");
        console.error("PLAN SEEDING FAILED");
        console.error("====================================");

        console.error(
            "\nMessage:",
            error?.message
        );

        console.error(
            "\nRazorpay error:",
            error?.error
                ? JSON.stringify(
                    error.error,
                    null,
                    2
                )
                : "N/A"
        );

        console.error(
            "\nFull error:",
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