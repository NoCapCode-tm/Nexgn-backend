import mongoose from "mongoose";

const GoogleDriveSchema = new mongoose.Schema({
   userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },

  provider:{
    type:String,
    default:"google-drive"
  },

  refreshToken:{
    type:String,
    required:true
  },

  folderId:{
    type:String
  },

  connected:{
    type:Boolean,
    default:true
  }

},{timestamps:true});
export const googledrive = new mongoose.model("googledrive",GoogleDriveSchema)