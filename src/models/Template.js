import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema({
   name:{
    type:String,
    required:true
   },
   description:{
    type:String,
    default:null
   },
   fileid:{
    type:String,
    default:null,
   },
   htmlcontent:{
    type:String,
    default:null
   },
   createdby:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
   }
},{timestamps:true});

export const template = new mongoose.model("template",TemplateSchema)