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
   file:{
     fileId:{
      type:String,
     },
     fileName:{
      type:String,
     },
      webViewLink:{
       type:String
     },
     downloadLink:{
      type:String,
     },
    
   },
   htmlcontent:{
    type:String,
    default:null
   },
   note:{
      type:String,
   },
   createdby:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
   }
},{timestamps:true});

export const template = new mongoose.model("template",TemplateSchema)