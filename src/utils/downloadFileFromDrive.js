import { google } from "googleapis";
import oauth2client from "../config/drive.config.js";
import { googledrive } from "../models/GoogleDrive.js";

export const downloadFileFromDrive = async (
    userId,
    fileId
) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    if (!fileId) {
        throw new Error("Google Drive file ID is required");
    }

    const driveRecord =
        await googledrive.findOne({
            userId,
            connected: true
        });

    if (!driveRecord) {
        throw new Error(
            "Google Drive is not connected"
        );
    }

    if (!driveRecord.refreshToken) {
        throw new Error(
            "Google Drive refresh token not found"
        );
    }

    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
        refresh_token:
            driveRecord.refreshToken
    });

    const drive = google.drive({
        version: "v3",
        auth
    });

    const response =
        await drive.files.get(
            {
                fileId,
                alt: "media"
            },
            {
                responseType: "arraybuffer"
            }
        );

    return Buffer.from(
        response.data
    );
};