import crypto from "crypto";
import { razorpay } from "../config/razorpay.js";
import { subscriptionPlan } from "../models/subscriptionPlan.models.js";
import { subscription } from "../models/subscription.models.js";
import { payment } from "../models/payment.models.js";
import { webhookEvent } from "../models/webhookEvent.models.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";


const razorpayTimestampToDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000);
};


export const getSubscriptionPlans = asynchandler(async (req, res) => {

        const plans =
            await subscriptionPlan.find({
                active: true
            })
            .sort({
                amount: 1
            })
            .lean();

        return res.status(200).json(
            new Apiresponse(
                200,
                "Plans fetched successfully",
                plans
            )
        );
    });


export const createSubscription =
    asynchandler(async (req, res) => {

        const admin = req.user;

        if (!admin) {
            throw new Apierror(
                401,
                "User not authorized"
            );
        }

        const { planId } = req.body;

        if (!planId) {
            throw new Apierror(
                400,
                "Plan is required"
            );
        }

        const plan =
            await subscriptionPlan.findOne({
                _id: planId,
                active: true
            });

        if (!plan) {
            throw new Apierror(
                404,
                "Plan not found"
            );
        }

        if (
            plan.billingPeriod ===
            "free"
        ) {

            return res.status(200).json(
                new Apiresponse(
                    200,
                    "Free plan selected",
                    {
                        plan
                    }
                )
            );
        }
        const existing =
            await subscription.findOne({

                userId:
                    admin._id,

                status: {
                    $in: [
                        "created",
                        "authenticated",
                        "active",
                        "pending"
                    ]
                }
            });


        if (existing) {

            throw new Apierror(
                409,
                "You already have an active subscription"
            );
        }

        const totalCount =
            plan.billingPeriod ===
            "monthly"
                ? 12
                : 1;


        const razorpaySubscription =
            await razorpay.subscriptions.create({

                plan_id:
                    plan.razorpayPlanId,

                total_count:
                    totalCount,

                quantity: 1,

                customer_notify: true,

                notes: {

                    nexgnUserId:
                        admin._id.toString(),

                    nexgnPlanId:
                        plan._id.toString(),

                    billingPeriod:
                        plan.billingPeriod
                }
            });


        const localSubscription =
            await subscription.create({

                userId:
                    admin._id,

                planId:
                    plan._id,

                razorpaySubscriptionId:
                    razorpaySubscription.id,

                razorpayPlanId:
                    plan.razorpayPlanId,

                status:
                    razorpaySubscription.status,

                startDate:
                    razorpaySubscription.start_at
                        ? new Date(
                            razorpaySubscription.start_at * 1000
                        )
                        : null,

                endDate:
                    razorpaySubscription.end_at
                        ? new Date(
                            razorpaySubscription.end_at * 1000
                        )
                        : null,

                currentPeriodStart:
                    razorpaySubscription.current_start
                        ? new Date(
                            razorpaySubscription.current_start * 1000
                        )
                        : null,

                currentPeriodEnd:
                    razorpaySubscription.current_end
                        ? new Date(
                            razorpaySubscription.current_end * 1000
                        )
                        : null,

                chargeAt:
                    razorpaySubscription.charge_at
                        ? new Date(
                            razorpaySubscription.charge_at * 1000
                        )
                        : null,

                totalCount:
                    razorpaySubscription.total_count,

                paidCount:
                    razorpaySubscription.paid_count,

                remainingCount:
                    razorpaySubscription.remaining_count
            });


        return res.status(201).json(
            new Apiresponse(
                201,
                "Subscription created successfully",
                {
                    key:
                        process.env.RAZORPAY_KEY_ID,

                    subscriptionId:
                        razorpaySubscription.id,

                    plan,

                    user: {
                        name:
                            admin.name,

                        email:
                            admin.email
                    },

                    localSubscription
                }
            )
        );
    });

export const verifySubscriptionPayment =
    asynchandler(async (req, res) => {

        const admin = req.user;

        if (!admin) {
            throw new Apierror(
                401,
                "User not authorized"
            );
        }

        const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_payment_id ||
            !razorpay_subscription_id ||
            !razorpay_signature
        ) {
            throw new Apierror(
                400,
                "Incomplete Razorpay response"
            );
        }

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    `${razorpay_payment_id}|${razorpay_subscription_id}`
                )
                .digest("hex");

        if (
            generatedSignature !==
            razorpay_signature
        ) {
            throw new Apierror(
                400,
                "Invalid Razorpay signature"
            );
        }

        const localSubscription =
            await subscription.findOne({
                userId: admin._id,
                razorpaySubscriptionId:
                    razorpay_subscription_id
            });

        if (!localSubscription) {
            throw new Apierror(
                404,
                "Subscription not found"
            );
        }

        localSubscription.lastPaymentId =
            razorpay_payment_id;

        if (
            localSubscription.status ===
            "created"
        ) {
            localSubscription.status =
                "authenticated";
        }

        await localSubscription.save();

        return res.status(200).json(
            new Apiresponse(
                200,
                "Payment signature verified successfully",
                {
                    verified: true
                }
            )
        );
    });

export const getMySubscription =
    asynchandler(async (req, res) => {

        const admin = req.user;

        const activeSubscription =
            await subscription.findOne({
                userId: admin._id
            })
            .populate("planId")
            .sort({
                createdAt: -1
            });

        return res.status(200).json(
            new Apiresponse(
                200,
                "Subscription fetched successfully",
                activeSubscription
            )
        );
    });

export const getMyPayments =
    asynchandler(async (req, res) => {

        const admin = req.user;

        const payments =
            await payment.find({
                userId: admin._id
            })
            .populate({
                path: "subscriptionId",
                populate: {
                    path: "planId"
                }
            })
            .sort({
                paidAt: -1,
                createdAt: -1
            });

        return res.status(200).json(
            new Apiresponse(
                200,
                "Payments fetched successfully",
                payments
            )
        );
    });