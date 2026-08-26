import mongoose from "mongoose";

const WebhookEventSchema = new mongoose.Schema(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        event: {
            type: String,
            required: true
        },

        processedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

export const webhookEvent = mongoose.model(
    "webhookEvent",
    WebhookEventSchema
);