import app from "./app.js"
import dotenv from "dotenv"
import mongoose from "mongoose";
import { connectdb } from "./database/db.js";
import { sweepExpiredRequests } from "./utils/notification.utils.js";

dotenv.config(
    {
        path:"./.env"
    }
);

const PORT = process.env.PORT



connectdb()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`App is listening on pOrt ${PORT}`)
    })

    const runExpirySweep = () => {
        if (mongoose.connection.readyState !== 1) {
            console.error("Expired document sweep skipped: database is not connected");
            return;
        }

        sweepExpiredRequests().catch((error) => {
            console.error("Expired document sweep failed:", error?.message);
        });
    };

    runExpirySweep();
    setInterval(runExpirySweep, 60 * 1000);
}).catch((error)=>{
   console.log("Something went wrong")
})
