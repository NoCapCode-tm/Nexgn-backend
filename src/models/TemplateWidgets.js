import mongoose from "mongoose";



const TemplateWidgetSchema = new mongoose.Schema({
   role:{
    type:String,
    required:true
   },
   templateid:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"template"
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
   
},{timestamps:true})

export const templatewidget = mongoose.model("templatewidget",TemplateWidgetSchema)