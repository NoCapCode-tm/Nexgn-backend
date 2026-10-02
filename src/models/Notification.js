import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({

    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },

    type:{
        type:String,
        enum:[
            "document_signed",
            "signature_request",
            "document_expired",
            "security"
        ],
        required:true
    },

    title:{
        type:String,
        required:true
    },

    message:{
        type:String,
        required:true
    },

    link:{
        type:String,
        default:""
    },

    refId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },

    deliverRealtime:{
        type:Boolean,
        default:true
    },

    isRead:{
        type:Boolean,
        default:false
    }

},{timestamps:true});

NotificationSchema.index({ receiverId: 1, createdAt: -1 });

NotificationSchema.index(
    { receiverId: 1, type: 1, refId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            refId: { $exists: true, $type: "objectId" }
        }
    }
);

export const notification = new mongoose.model("notification",NotificationSchema)
