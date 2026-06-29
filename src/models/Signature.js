import mongoose from "mongoose";

const SignatureSchema = new mongoose.Schema({

    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SignatureRequest"
    },

    ip:{
        type:String
    },

     widget:[{
     widgetname:{
    type:String,
    enum:["signature","text","number","date","name","email"]
   },
     value:{
        type:String,
     }
   }]

},{timestamps:true});
export const signature = new mongoose.model("signature",SignatureSchema)