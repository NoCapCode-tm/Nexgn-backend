import mongoose from "mongoose";

const NotifiedSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true,
   },
   email:{
    type:String,
    required:true,
   },
   interest:{
    type:String
   }
},{timestamps:true});
export const notified = new mongoose.model("notified",NotifiedSchema)