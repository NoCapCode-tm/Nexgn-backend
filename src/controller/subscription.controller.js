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

const markBillingSeen = async (userId) => {
    if (!userId) return;
    await user.findByIdAndUpdate(userId, {
        hasSeenBilling: true
    });
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


        // --------------------------------------------------
        // FREE PLAN
        // --------------------------------------------------

        if (
            plan.slug === "free" ||
            plan.billingPeriod === "free" ||
            plan.amount === 0
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


        // --------------------------------------------------
        // CHECK FOR EXISTING ACTIVE SUBSCRIPTION
        //
        // IMPORTANT:
        // We DO NOT block the user here.
        //
        // If the user already has Starter and chooses
        // Business, Business payment must be allowed.
        //
        // The old subscription will only be cancelled
        // AFTER Business payment succeeds.
        // --------------------------------------------------

        const currentSubscription =
            await subscription.findOne({
                userId: admin._id,
                status: {
                    $in: [
                        "authenticated",
                        "active"
                    ]
                }
            });


        // --------------------------------------------------
        // CHECK FOR EXISTING CREATED CHECKOUT
        // --------------------------------------------------

        const existingCreatedSubscription =
            await subscription.findOne({
                userId: admin._id,
                status: "created"
            });


        if (existingCreatedSubscription) {

            const samePlan =
                existingCreatedSubscription.planId.toString() ===
                plan._id.toString();


            // --------------------------------------------------
            // SAME PLAN
            //
            // Reuse existing checkout for 30 minutes.
            // --------------------------------------------------

            if (samePlan) {

                const createdAt =
                    existingCreatedSubscription.createdAt;

                const expiryTime =
                    new Date(
                        createdAt.getTime() +
                        30 * 60 * 1000
                    );


                if (new Date() < expiryTime) {

                    return res.status(200).json(
                        new Apiresponse(
                            200,
                            "Existing checkout subscription found",
                            {
                                key:
                                    process.env.RAZORPAY_KEY_ID,

                                subscriptionId:
                                    existingCreatedSubscription
                                        .razorpaySubscriptionId,

                                plan,

                                user: {
                                    name:
                                        admin.name,

                                    email:
                                        admin.email
                                },

                                localSubscription:
                                    existingCreatedSubscription
                            }
                        )
                    );
                }


                // --------------------------------------------------
                // SAME PLAN BUT CHECKOUT EXPIRED
                // --------------------------------------------------

                try {

                    if (
                        existingCreatedSubscription
                            .razorpaySubscriptionId
                    ) {

                        await razorpay.subscriptions.cancel(
                            existingCreatedSubscription
                                .razorpaySubscriptionId,
                            false
                        );
                    }

                } catch (error) {

                    console.error(
                        "Failed to cancel expired Razorpay subscription:",
                        error?.message
                    );
                }


                existingCreatedSubscription.status =
                    "cancelled";

                await existingCreatedSubscription.save();
            }


            // --------------------------------------------------
            // DIFFERENT PLAN
            //
            // Example:
            //
            // Starter checkout abandoned
            // User now selects Business
            //
            // Cancel the old created checkout.
            // --------------------------------------------------

            else {

                try {

                    if (
                        existingCreatedSubscription
                            .razorpaySubscriptionId
                    ) {

                        await razorpay.subscriptions.cancel(
                            existingCreatedSubscription
                                .razorpaySubscriptionId,
                            false
                        );
                    }

                } catch (error) {

                    console.error(
                        "Failed to cancel previous Razorpay checkout:",
                        error?.message
                    );
                }


                existingCreatedSubscription.status =
                    "cancelled";

                await existingCreatedSubscription.save();
            }
        }


        // --------------------------------------------------
        // CREATE NEW RAZORPAY SUBSCRIPTION
        // --------------------------------------------------

        const totalCount =
            plan.billingPeriod === "monthly"
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
                        plan.billingPeriod,

                    previousSubscriptionId:
                        currentSubscription
                            ? currentSubscription._id.toString()
                            : null
                }
            });


        // --------------------------------------------------
        // CREATE LOCAL PENDING SUBSCRIPTION
        //
        // IMPORTANT:
        // The old active subscription is NOT cancelled here.
        // --------------------------------------------------

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


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

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


        // --------------------------------------------------
        // VALIDATE RAZORPAY RESPONSE
        // --------------------------------------------------

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


        // --------------------------------------------------
        // VERIFY SIGNATURE
        // --------------------------------------------------

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


        // --------------------------------------------------
        // FIND NEW SUBSCRIPTION
        // --------------------------------------------------

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


        // --------------------------------------------------
        // PAYMENT SUCCESSFUL
        // --------------------------------------------------

        localSubscription.lastPaymentId =
            razorpay_payment_id;

        localSubscription.status =
            "authenticated";

        await localSubscription.save();


        // --------------------------------------------------
        // FIND OLD ACTIVE SUBSCRIPTION
        // --------------------------------------------------
        //
        // This is the important part.
        //
        // We only look for another active subscription.
        // The NEW subscription is excluded.
        // --------------------------------------------------

        const previousSubscription =
            await subscription.findOne({
                userId: admin._id,

                _id: {
                    $ne:
                        localSubscription._id
                },

                status: {
                    $in: [
                        "authenticated",
                        "active"
                    ]
                }
            });


        // --------------------------------------------------
        // CANCEL OLD SUBSCRIPTION
        // --------------------------------------------------

        if (previousSubscription) {

            // ----------------------------------------------
            // Cancel old Razorpay subscription
            // ----------------------------------------------

            if (
                previousSubscription
                    .razorpaySubscriptionId
            ) {

                try {

                    await razorpay.subscriptions.cancel(
                        previousSubscription
                            .razorpaySubscriptionId,
                        false
                    );

                } catch (error) {

                    console.error(
                        "Failed to cancel old Razorpay subscription:",
                        error?.message
                    );

                    // IMPORTANT:
                    // Do not silently mark Mongo as cancelled
                    // if Razorpay cancellation failed.
                    //
                    // This prevents MongoDB and Razorpay from
                    // getting out of sync.
                    throw new Apierror(
                        500,
                        "New payment succeeded, but previous subscription could not be cancelled. Please contact support."
                    );
                }
            }


            // ----------------------------------------------
            // Cancel old Mongo subscription
            // ----------------------------------------------

            previousSubscription.status =
                "cancelled";

            previousSubscription.endDate =
                new Date();

            previousSubscription.currentPeriodEnd =
                new Date();

            await previousSubscription.save();
        }

        await markBillingSeen(admin._id);


        // --------------------------------------------------
        // PAYMENT COMPLETE
        // --------------------------------------------------

        return res.status(200).json(
            new Apiresponse(
                200,
                "Payment verified and subscription upgraded successfully",
                {
                    verified: true,

                    subscription:
                        localSubscription
                }
            )
        );
    });

export const getMySubscription =
    asynchandler(async (req, res) => {

        const admin = req.user;

        const activeSubscription =
            await subscription.findOne({

                userId: admin._id,

                status: {
                    $in: [
                        "active",
                        "authenticated"
                    ]
                }

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

   export const activateFreeSubscription =
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


        // --------------------------------------------------
        // FIND FREE PLAN
        // --------------------------------------------------

        const plan =
            await subscriptionPlan.findOne({

                _id: planId,

                slug: "free",

                billingPeriod: "free",

                active: true
            });


        if (!plan) {
            throw new Apierror(
                404,
                "Free plan not found"
            );
        }


        // --------------------------------------------------
        // CHECK EXISTING ACTIVE SUBSCRIPTION
        // --------------------------------------------------

        const activeSubscription =
            await subscription.findOne({

                userId: admin._id,

                status: {
                    $in: [
                        "authenticated",
                        "active"
                    ]
                }
            });


        // --------------------------------------------------
        // IF ALREADY ON FREE
        // --------------------------------------------------

        if (
            activeSubscription &&
            activeSubscription.planId.toString() ===
                plan._id.toString()
        ) {
            await markBillingSeen(admin._id);

            return res.status(200).json(
                new Apiresponse(
                    200,
                    "You are already on the Free plan",
                    {
                        subscription:
                            activeSubscription
                    }
                )
            );
        }


        // --------------------------------------------------
        // CANCEL ANY ABANDONED RAZORPAY CHECKOUT
        // --------------------------------------------------

        const createdSubscription =
            await subscription.findOne({

                userId: admin._id,

                status: "created"
            });


        if (createdSubscription) {

            if (
                createdSubscription
                    .razorpaySubscriptionId
            ) {

                try {

                    await razorpay.subscriptions.cancel(
                        createdSubscription
                            .razorpaySubscriptionId,
                        false
                    );

                } catch (error) {

                    console.error(
                        "Failed to cancel abandoned Razorpay subscription:",
                        error?.message
                    );
                }
            }


            createdSubscription.status =
                "cancelled";

            await createdSubscription.save();
        }


        // --------------------------------------------------
        // CREATE FREE SUBSCRIPTION
        // --------------------------------------------------

        const now = new Date();

        const endDate =
            new Date(now);

        endDate.setMonth(
            endDate.getMonth() + 1
        );


        const localSubscription =
            await subscription.create({

                userId:
                    admin._id,

                planId:
                    plan._id,

                razorpaySubscriptionId:
                    null,

                razorpayPlanId:
                    null,

                status:
                    "active",

                startDate:
                    now,

                endDate:
                    endDate,

                currentPeriodStart:
                    now,

                currentPeriodEnd:
                    endDate,

                chargeAt:
                    null,

                totalCount:
                    19,

                paidCount:
                    0,

                remainingCount:
                    19,

                lastPaymentId:
                    null,

                lastInvoiceId:
                    null
            });


        // --------------------------------------------------
        // CANCEL OLD PAID SUBSCRIPTION
        // --------------------------------------------------

        if (
            activeSubscription &&
            activeSubscription._id.toString() !==
                localSubscription._id.toString()
        ) {

            if (
                activeSubscription
                    .razorpaySubscriptionId
            ) {

                try {

                    await razorpay.subscriptions.cancel(
                        activeSubscription
                            .razorpaySubscriptionId,
                        false
                    );

                } catch (error) {

                    console.error(
                        "Failed to cancel old Razorpay subscription:",
                        error?.message
                    );

                    // Since Free has already been created,
                    // we should NOT pretend everything is fine.
                    //
                    // Log this for manual reconciliation.
                }
            }


            activeSubscription.status =
                "cancelled";

            activeSubscription.endDate =
                new Date();

            activeSubscription.currentPeriodEnd =
                new Date();

            await activeSubscription.save();
        }

        await markBillingSeen(admin._id);


        // --------------------------------------------------
        // RESPONSE
        // --------------------------------------------------

        return res.status(201).json(
            new Apiresponse(
                201,
                localSubscription,
                "Free plan activated successfully"
            )
        );
    });