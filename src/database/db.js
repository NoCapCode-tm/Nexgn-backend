import mongoose from "mongoose";


const connectdb = async()=>{
   try {
    const connectioninstance = await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`)
    console.log(`DATABASE CONNECTED \n db host : ${connectioninstance.connection.host}`)
} catch (error) {
    console.log("CANNOT CONNECT TO DATABASE")
}
}

export {connectdb}
