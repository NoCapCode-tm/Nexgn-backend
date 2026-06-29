import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true
    },

    driveFileId:{
        type:String,
        default:null
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
    }

},{timestamps:true});

export const doc = mongoose.model(
    "doc",
    DocumentSchema
);