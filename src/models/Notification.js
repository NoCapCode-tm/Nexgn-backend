import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({

    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

    title:String,

    message:String,

    isRead:{
        type:Boolean,
        default:false
    }

},{timestamps:true});
export const notification = new mongoose.model("notification",NotificationSchema)