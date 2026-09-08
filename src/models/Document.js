import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    driveFileId:{
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
    assignedto:[{
        name:{
            type:String,
            required:true,
        },
        email:{
            type:String,
            required:true
        }
    }],

    templateId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"template",
        default:null
    },

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    teamid:{
            type:mongoose.Schema.Types.ObjectId,
             ref:"team",
             default:null
    
        },
     note:{
      type:String,
   },

    status:{
        type:String,
        enum:[
            "draft",
            "sent",
            "partially_signed",
            "completed",
            "cancelled"
        ],
        default:"draft"
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

},{timestamps:true});
export const doc = mongoose.model(
    "doc",
    DocumentSchema
);