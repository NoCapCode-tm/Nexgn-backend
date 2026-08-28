import { Readable } from "stream";
import { google } from "googleapis";
import { googledrive } from "../models/GoogleDrive.js";
import { Apierror } from "./Apierror.utils.js";

export const uploadFileToDrive = async (userId, file) => {
  const driveAccount = await googledrive.findOne({
    userId,
    connected: true,
  });

  // if (!driveAccount) {
  //   throw new Error("Google Drive is not connected.");
  // }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: driveAccount.refreshToken,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // optional
    },
    media: {
  mimeType: file.mimetype,
  body: Readable.from(file.buffer),
},
    fields: "id,name,webViewLink,webContentLink",
  });

  // Public access (optional)
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  

  return {
    fileId: response.data.id,
    fileName: response.data.name,
    webViewLink: `https://drive.google.com/file/d/${response.data.id}/preview`,
    downloadLink: `https://drive.google.com/uc?export=download&id=${response.data.id}`,
  };
};


export const uploadCertificateToDrive = async (
  userId,
  pdfBuffer,
  fileName
) => {
  const driveAccount = await googledrive.findOne({
    userId,
    connected: true,
  });

  if (!driveAccount) {
    throw new Apierror(404,"User drive not connected")
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    refresh_token: driveAccount.refreshToken,
  });

  const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: driveAccount.folderId
        ? [driveAccount.folderId]
        : undefined,
    },

    media: {
      mimeType: "application/pdf",
      body: Readable.from([pdfBuffer]),
    },

    fields: "id,name,webViewLink,webContentLink",
  });

  await drive.permissions.create({
    fileId: response.data.id,

    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: response.data.id,

    fileName: response.data.name,

    webViewLink:
      `https://drive.google.com/file/d/${response.data.id}/preview`,

    downloadLink:
      `https://drive.google.com/uc?export=download&id=${response.data.id}`,
  };
};