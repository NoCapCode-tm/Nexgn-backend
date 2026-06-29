import cookieParser from "cookie-parser"
import express from "express"


const app = express()

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
app.use(
  "/api/v1/google",
  googleRoutes
);

app.use("/api/v1/admin",adminrouter)
app.use("/api/v1/template",templaterouter)
app.use("/api/v1/document",documentrouter)
app.use("/api/v1/sign",signrouter)


export default app;