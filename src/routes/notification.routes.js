import { Router } from "express";
import { verifyjwt } from "../middleware/auth.middleware.js";
import {
    getNotifications,
    getPreferences,
    updatePreferences,
    markRead,
    markAllRead,
    streamNotifications,
} from "../controller/notification.controller.js";

export const notificationrouter = Router();

notificationrouter.get("/stream", verifyjwt, streamNotifications);
notificationrouter.get("/preferences", verifyjwt, getPreferences);
notificationrouter.put("/preferences", verifyjwt, updatePreferences);
notificationrouter.patch("/read-all", verifyjwt, markAllRead);
notificationrouter.get("/", verifyjwt, getNotifications);
notificationrouter.patch("/:id/read", verifyjwt, markRead);
