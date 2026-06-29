import app from "./app.js"
import dotenv from "dotenv"
import { connectdb } from "./database/db.js";

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
}).catch((error)=>{
   console.log("Something went wrong")
})