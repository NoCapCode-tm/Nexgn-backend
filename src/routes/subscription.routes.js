import { Router } from "express";

import {
    getSubscriptionPlans,
    createSubscription,
    verifySubscriptionPayment,
    getMySubscription,
    getMyPayments
} from "../controller/subscription.controller.js";

import {
    verifyjwt,
} from "../middleware/auth.middleware.js";

const subscriptionrouter = Router();

subscriptionrouter.get(
    "/plans",
    verifyjwt,
    getSubscriptionPlans
);

subscriptionrouter.post(
    "/create",
    verifyjwt,
    createSubscription
);

subscriptionrouter.post(
    "/verify",
    verifyjwt,
    verifySubscriptionPayment
);

subscriptionrouter.get(
    "/me",
    verifyjwt,
    getMySubscription
);

subscriptionrouter.get(
    "/payments",
    verifyjwt,
    getMyPayments
);

export default subscriptionrouter;