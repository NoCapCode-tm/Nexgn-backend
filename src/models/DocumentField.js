import mongoose from "mongoose";

const DocumentFieldSchema = new mongoose.Schema({

    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document"
    },
   
     widget:[{
     widgetname:{
    type:String,
    enum:["signature","text","number","date","name","email"]
   },
   page:{
    type:Number
   },
   x:{
    type:Number
   },
   y:{
    type:Number
   },
   height:{
    type:Number
   },
   width:{
    type:Number
   }
   }]

},{timestamps:true});

export const documentfield = new mongoose.model("documentfield",DocumentFieldSchema)