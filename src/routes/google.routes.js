import express from "express";
import { AuthCallback, disconnectDrive, driveStatus, getAuthurl } from "../controller/google.drive.js";
import { verifyjwt } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get(
  "/auth-url",
  verifyjwt,
  getAuthurl
);

router.get(
  "/status",
  verifyjwt,
  driveStatus
);
router.get(
  "/disconnect",
  verifyjwt,
  disconnectDrive
);

router.get(
  "/callback",
  verifyjwt,
  AuthCallback
);

export default router;