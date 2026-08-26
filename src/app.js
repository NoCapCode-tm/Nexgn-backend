import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route Imports
import googleRoutes from "./routes/google.routes.js";
import { adminrouter } from "./routes/auth.routes.js";
import { templaterouter } from "./routes/template.routes.js";
import { signrouter } from "./routes/signed.routes.js";
import { documentrouter } from "./routes/document.routes.js";
import { activityrouter } from "./routes/Activitylog.routes.js";
import {
    razorpayWebhook
} from "./controller/razorpayWebhook.controller.js";
import subscriptionrouter from "./routes/subscription.routes.js";


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://prod.nexgn.cloud",
  "https://sign.nexgn.cloud",
  "https://nexgn.cloud"
];

// Updated CORS Configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.post(
    "/api/v1/razorpay/webhook",
    express.raw({
        type: "application/json"
    }),
    razorpayWebhook
);

// Standard Middlewares
app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "16mb" }));
app.use(express.static("public"));
app.use(cookieParser());


app.use("/api/v1/google", googleRoutes);
app.use("/api/v1/subscription", subscriptionrouter);
app.use("/api/v1/admin", adminrouter);
app.use("/api/v1/template", templaterouter);
app.use("/api/v1/document", documentrouter);
app.use("/api/v1/sign", signrouter);
app.use("/api/v1/activity", activityrouter);

export default app;