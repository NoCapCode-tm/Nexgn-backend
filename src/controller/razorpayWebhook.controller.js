import crypto from "crypto";
import { subscription } from "../models/subscription.models.js";
import { payment } from "../models/payment.models.js";
import { webhookEvent } from "../models/webhookEvent.models.js";


const toDate = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp * 1000);
};


const updateSubscriptionFromRazorpay =
    async (razorpaySub) => {

        if (!razorpaySub?.id) {
            return null;
        }

        const localSub =
            await subscription.findOne({
                razorpaySubscriptionId:
                    razorpaySub.id
            });

        if (!localSub) {
            console.error(
                "Local subscription not found:",
                razorpaySub.id
            );

            return null;
        }

        localSub.status =
            razorpaySub.status ||
            localSub.status;

        localSub.razorpayPlanId =
            razorpaySub.plan_id ||
            localSub.razorpayPlanId;

        localSub.razorpayCustomerId =
            razorpaySub.customer_id ||
            localSub.razorpayCustomerId;

        localSub.startDate =
            toDate(
                razorpaySub.start_at
            ) ||
            localSub.startDate;

        localSub.endDate =
            toDate(
                razorpaySub.end_at
            ) ||
            localSub.endDate;

        localSub.currentPeriodStart =
            toDate(
                razorpaySub.current_start
            );

        localSub.currentPeriodEnd =
            toDate(
                razorpaySub.current_end
            );

        localSub.chargeAt =
            toDate(
                razorpaySub.charge_at
            );

        localSub.totalCount =
            razorpaySub.total_count;

        localSub.paidCount =
            razorpaySub.paid_count;

        localSub.remainingCount =
            razorpaySub.remaining_count;

        await localSub.save();

        return localSub;
    };


const createOrUpdatePayment =
    async ({
        paymentEntity,
        localSubscription
    }) => {

        if (
            !paymentEntity?.id ||
            !localSubscription
        ) {
            return null;
        }

        const existing =
            await payment.findOne({
                razorpayPaymentId:
                    paymentEntity.id
            });

        if (existing) {

            existing.status =
                paymentEntity.status;

            existing.paidAt =
                toDate(
                    paymentEntity.created_at
                ) ||
                existing.paidAt;

            existing.razorpayInvoiceId =
                paymentEntity.invoice_id ||
                existing.razorpayInvoiceId;

            existing.method =
                paymentEntity.method ||
                existing.method;

            await existing.save();

            return existing;
        }

        return await payment.create({
            userId:
                localSubscription.userId,

            subscriptionId:
                localSubscription._id,

            razorpayPaymentId:
                paymentEntity.id,

            razorpaySubscriptionId:
                localSubscription
                    .razorpaySubscriptionId,

            razorpayInvoiceId:
                paymentEntity.invoice_id ||
                null,

            razorpayOrderId:
                paymentEntity.order_id ||
                null,

            amount:
                paymentEntity.amount,

            currency:
                paymentEntity.currency,

            status:
                paymentEntity.status,

            method:
                paymentEntity.method ||
                null,

            email:
                paymentEntity.email ||
                null,

            contact:
                paymentEntity.contact ||
                null,

            paidAt:
                toDate(
                    paymentEntity.created_at
                )
        });
    };


export const razorpayWebhook =
    async (req, res) => {

        try {

            const signature =
                req.headers[
                    "x-razorpay-signature"
                ];

            const eventId =
                req.headers[
                    "x-razorpay-event-id"
                ];

            if (!signature) {
                return res
                    .status(400)
                    .send(
                        "Missing Razorpay signature"
                    );
            }

            const expectedSignature =
                crypto
                    .createHmac(
                        "sha256",
                        process.env
                            .RAZORPAY_WEBHOOK_SECRET
                    )
                    .update(req.body)
                    .digest("hex");

            if (
                expectedSignature !==
                signature
            ) {
                return res
                    .status(400)
                    .send(
                        "Invalid webhook signature"
                    );
            }

            /*
             * Acknowledge duplicate/already-processed
             * webhook safely.
             */
            if (eventId) {

                const alreadyProcessed =
                    await webhookEvent.findOne({
                        eventId
                    });

                if (alreadyProcessed) {
                    return res.status(200).json({
                        received: true,
                        duplicate: true
                    });
                }
            }

            /*
             * Parse only AFTER signature verification.
             */
            const event =
                JSON.parse(
                    req.body.toString("utf8")
                );

            if (eventId) {

                await webhookEvent.create({
                    eventId,
                    event: event.event
                });
            }

            const razorpaySub =
                event?.payload
                    ?.subscription
                    ?.entity;

            const razorpayPayment =
                event?.payload
                    ?.payment
                    ?.entity;

            let localSub = null;

            switch (event.event) {

                case "subscription.authenticated": {

                    localSub =
                        await updateSubscriptionFromRazorpay(
                            razorpaySub
                        );

                    break;
                }

                case "subscription.activated": {

                    localSub =
                        await updateSubscriptionFromRazorpay(
                            razorpaySub
                        );

                    break;
                }

                case "subscription.charged": {

                    localSub =
                        await updateSubscriptionFromRazorpay(
                            razorpaySub
                        );

                    await createOrUpdatePayment({
                        paymentEntity:
                            razorpayPayment,

                        localSubscription:
                            localSub
                    });

                    if (
                        localSub &&
                        razorpayPayment?.id
                    ) {
                        localSub.lastPaymentId =
                            razorpayPayment.id;

                        localSub.lastInvoiceId =
                            razorpayPayment
                                .invoice_id ||
                            null;

                        await localSub.save();
                    }

                    break;
                }

                case "subscription.completed": {

                    localSub =
                        await updateSubscriptionFromRazorpay(
                            razorpaySub
                        );

                    await createOrUpdatePayment({
                        paymentEntity:
                            razorpayPayment,

                        localSubscription:
                            localSub
                    });

                    break;
                }

                case "subscription.pending": {

                    await updateSubscriptionFromRazorpay(
                        razorpaySub
                    );

                    break;
                }

                case "subscription.halted": {

                    await updateSubscriptionFromRazorpay(
                        razorpaySub
                    );

                    break;
                }

                case "subscription.paused": {

                    await updateSubscriptionFromRazorpay(
                        razorpaySub
                    );

                    break;
                }

                case "subscription.resumed": {

                    await updateSubscriptionFromRazorpay(
                        razorpaySub
                    );

                    break;
                }

                case "subscription.cancelled": {

                    await updateSubscriptionFromRazorpay(
                        razorpaySub
                    );

                    break;
                }

                default:

                    console.log(
                        "Unhandled Razorpay event:",
                        event.event
                    );
            }

            /*
             * Return success quickly.
             */
            return res.status(200).json({
                received: true
            });

        } catch (error) {

            console.error(
                "Razorpay webhook error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Webhook processing failed"
                });
        }
    };