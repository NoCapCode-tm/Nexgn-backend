import mongoose from "mongoose";
import { notification } from "../models/Notification.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import {
    addStream,
    removeStream,
    resolvePreferences,
    PREFERENCE_DEFAULTS,
} from "../utils/notification.utils.js";

export const getNotifications = asynchandler(async (req, res) => {
    const items = await notification
        .find({
            receiverId: req.user._id,
            deliverRealtime: true,
        })
        .sort({ createdAt: -1 })
        .limit(30);

    return res.status(200).json(
        new Apiresponse(200, "Notifications fetched", items)
    );
});

export const getPreferences = asynchandler(async (req, res) => {
    const account = await user.findById(req.user._id)
        .select("notificationPreferences")
        .lean();

    return res.status(200).json(
        new Apiresponse(
            200,
            "Notification preferences fetched",
            resolvePreferences(account?.notificationPreferences)
        )
    );
});

export const updatePreferences = asynchandler(async (req, res) => {
    const account = await user.findById(req.user._id)
        .select("notificationPreferences");

    if (!account) {
        throw new Apierror(404, "User not found");
    }

    const next = resolvePreferences(account.notificationPreferences);

    for (const key of Object.keys(PREFERENCE_DEFAULTS)) {
        if (typeof req.body?.[key] === "boolean") {
            next[key] = req.body[key];
        }
    }

    account.notificationPreferences = next;
    account.notificationPreferencesConfigured = true;
    account.markModified("notificationPreferences");
    await account.save();

    const saved = await user.findById(req.user._id)
        .select("notificationPreferences")
        .lean();

    return res.status(200).json(
        new Apiresponse(
            200,
            "Notification preferences saved",
            resolvePreferences(saved?.notificationPreferences)
        )
    );
});

export const markRead = asynchandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Apierror(400, "Invalid notification");
    }

    const item = await notification.findOneAndUpdate(
        {
            _id: req.params.id,
            receiverId: req.user._id,
        },
        { $set: { isRead: true } },
        { new: true }
    );

    if (!item) {
        throw new Apierror(404, "Notification not found");
    }

    return res.status(200).json(
        new Apiresponse(200, "Notification marked as read", item)
    );
});

export const markAllRead = asynchandler(async (req, res) => {
    await notification.updateMany(
        {
            receiverId: req.user._id,
            isRead: false,
        },
        { $set: { isRead: true } }
    );

    return res.status(200).json(
        new Apiresponse(200, "Notifications marked as read", {})
    );
});

export const streamNotifications = asynchandler(async (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    req.socket?.setTimeout(0);

    addStream(req.user._id, res);
    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    const heartbeat = setInterval(() => {
        try {
            res.write(": ping\n\n");
        } catch (error) {
            clearInterval(heartbeat);
        }
    }, 25000);

    req.on("close", () => {
        clearInterval(heartbeat);
        removeStream(req.user._id, res);
    });
});
