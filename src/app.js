import cookieParser from "cookie-parser"
import express from "express"
import cors from "cors"


const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://prod.nexgn.cloud",
  "https://sign.nexgn.cloud",
  "https://nexgn.cloud"


];




app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman / server calls

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


app.use(express.json({limit:"16mb"}))
app.use(express.urlencoded({extended:true,limit:"16mb"}))
app.use(express.static("public"))
app.use(cookieParser())
import googleRoutes
from "./routes/google.routes.js";
import { adminrouter } from "./routes/auth.routes.js"
import { templaterouter } from "./routes/template.routes.js"
import { signrouter } from "./routes/signed.routes.js"
import { documentrouter } from "./routes/document.routes.js"
import { activityrouter } from "./routes/Activitylog.routes.js";
app.use(
  "/api/v1/google",
  googleRoutes
);

app.use("/api/v1/admin",adminrouter)
app.use("/api/v1/template",templaterouter)
app.use("/api/v1/document",documentrouter)
app.use("/api/v1/sign",signrouter)
app.use("/api/v1/activity",activityrouter)


export default app;