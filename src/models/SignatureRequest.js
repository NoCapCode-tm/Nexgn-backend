import mongoose from "mongoose";

const SignatureRequestSchema = new mongoose.Schema({

    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"doc"
    },

    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    senderip:{
        type:String,
    },
    expiresat:{
        type:Date
    },

    recipient:{

        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        signedAt:{
            type:Date,
            default:null
       },
    },

    overallStatus:{
        type:String,
        enum:[
            "pending",
            "Viewed",
            "Expired",
            "completed",
            "cancelled"
        ],
        default:"pending"
    }

},{timestamps:true});
export const signrequest = new mongoose.model("signrequest",SignatureRequestSchema)