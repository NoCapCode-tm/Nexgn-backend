import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },

     refId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "refModel",
    default: null,
  },

  refModel: {
    type: String,
    enum: ["doc", "template", "user"],
    default: null,
  },

    action:String,
    status:{
        type:String
    }

},{timestamps:true});

export const activitylog = new mongoose.model("activitylog",ActivityLogSchema)