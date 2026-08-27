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

//post apis
subscriptionrouter.post("/create",verifyjwt,createSubscription);
subscriptionrouter.post("/verify",verifyjwt,verifySubscriptionPayment);

//get apis
subscriptionrouter.get("/plans",verifyjwt,getSubscriptionPlans);
subscriptionrouter.get("/mysubscription",verifyjwt,getMySubscription);
subscriptionrouter.get("/mypayments",verifyjwt,getMyPayments);

export default subscriptionrouter;