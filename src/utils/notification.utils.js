import { Resend } from "resend";
import { notification } from "../models/Notification.js";
import { user } from "../models/user.models.js";
import { doc } from "../models/Document.js";
import { signrequest } from "../models/SignatureRequest.js";
import { renderNotificationEmail } from "../emails/renderEmail.jsx";

export const PREFERENCE_DEFAULTS = {
    realtime_document_signed: false,
    realtime_signature_request: false,
    realtime_document_expired: false,
    realtime_security: false,
    email_document_signed: false,
    email_signature_request: false,
    email_document_expired: false,
    email_security: false,
};

const streams = new Map();

export function resolvePreferences(prefs = {}) {
    const source = typeof prefs?.toObject === "function"
        ? prefs.toObject({ minimize: false })
        : (prefs || {});

    return Object.keys(PREFERENCE_DEFAULTS).reduce((resolved, key) => {
        resolved[key] = source[key] === true;
        return resolved;
    }, {});
}

function preferenceOn(account, key) {
    return resolvePreferences(account?.notificationPreferences)[key] === true;
}

export function addStream(userId, res) {
    const key = String(userId);
    if (!streams.has(key)) {
        streams.set(key, new Set());
    }
    streams.get(key).add(res);
}

export function removeStream(userId, res) {
    const key = String(userId);
    const openStreams = streams.get(key);
    if (!openStreams) return;
    openStreams.delete(res);
    if (openStreams.size === 0) {
        streams.delete(key);
    }
}

function pushToUser(userId, record) {
    const openStreams = streams.get(String(userId));
    if (!openStreams || openStreams.size === 0) return;

    const payload = `data: ${JSON.stringify({
        type: "notification",
        notification: record,
    })}\n\n`;

    for (const res of openStreams) {
        try {
            res.write(payload);
        } catch (error) {
            openStreams.delete(res);
        }
    }
}

function escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function findUserByEmail(email) {
    if (!email) return null;

    return user.findOne({
        email: {
            $regex: `^${escapeRegex(String(email).trim())}$`,
            $options: "i",
        },
        deleted: { $ne: true },
    }).select("_id email name notificationPreferences");
}

async function sendNotificationEmail(account, { title, message, link }) {
    if (!process.env.RESEND_API_KEY || !account?.email) return;

    const actionUrl = link
        ? (String(link).startsWith("http")
            ? link
            : `${process.env.FRONTEND_URI || ""}${link}`)
        : (process.env.FRONTEND_URI || "https://sign.nexgn.cloud");

    const html = await renderNotificationEmail({
        recipientName: account.name?.split(" ")[0] || "there",
        title,
        message,
        actionUrl,
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: account.email,
        subject: title,
        html,
    });
}

export async function notifyUser({
    userId,
    type,
    title,
    message,
    link = "",
    refId = null,
}) {
    try {
        if (!userId || !type || !title || !message) return null;

        const account = await user
            .findById(userId)
            .select("email name notificationPreferences notificationPreferencesConfigured");

        if (!account) return null;

        const realtimeOn = preferenceOn(
            account,
            `realtime_${type}`
        );
        const emailOn = preferenceOn(
            account,
            `email_${type}`
        );

        if (!realtimeOn && !emailOn) return null;

        let record;
        try {
            record = await notification.create({
                receiverId: account._id,
                type,
                title,
                message,
                link,
                refId: refId || null,
                deliverRealtime: realtimeOn,
                isRead: false,
            });
        } catch (error) {
            if (error?.code === 11000) return null;
            throw error;
        }

        const payload = record.toObject();

        if (realtimeOn) {
            pushToUser(account._id, payload);
        }

        if (emailOn) {
            try {
                await sendNotificationEmail(account, { title, message, link });
            } catch (error) {
                console.error("Notification email failed:", error?.message);
            }
        }

        return payload;
    } catch (error) {
        console.error("Notification failed:", error?.message);
        return null;
    }
}

export async function markRequestExpired(request) {
    if (!request?._id) return;

    if (request.overallStatus !== "Expired") {
        request.overallStatus = "Expired";
        await request.save();
    }

    let title = request.documentId?.title;
    if (!title && request.documentId) {
        const documentId = request.documentId._id || request.documentId;
        const document = await doc.findById(documentId).select("title");
        title = document?.title;
    }

    const senderId = request.senderId?._id || request.senderId;
    if (!senderId) return;

    await notifyUser({
        userId: senderId,
        type: "document_expired",
        title: "Document expired",
        message: `"${title || "A document"}" passed its signing deadline before it was completed.`,
        link: "/documents",
        refId: request._id,
    });
}

export async function sweepExpiredRequests() {
    const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const due = await signrequest.find({
        overallStatus: { $in: ["pending", "Viewed"] },
        expiresat: { $ne: null, $lte: new Date(), $gte: windowStart },
        senderId: { $ne: null },
    })
        .populate("documentId", "title")
        .limit(50);

    for (const request of due) {
        await markRequestExpired(request);
    }
}
