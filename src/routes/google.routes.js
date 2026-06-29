import express from "express";
import { AuthCallback, getAuthurl } from "../controller/google.drive.js";

const router = express.Router();

router.get(
  "/auth-url",
  getAuthurl
);

router.get(
  "/callback",
  AuthCallback
);

export default router;