import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document"
    },

    action:String,

},{timestamps:true});

export const activitylog = new mongoose.model("activitylog",ActivityLogSchema)