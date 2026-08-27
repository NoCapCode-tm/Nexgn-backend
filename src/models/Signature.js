import mongoose from "mongoose";

const SignatureSchema = new mongoose.Schema({

    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"signrequest"
    },
     certificateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Certificate",
      default: null,
    },

    ipv4:{
        type:String
    },
    ipv6:{
        type:String
    },
    widget: [{
    index: {
        type: Number
    },

    widgetname: {
        type: String,
        enum: [
            "signature",
            "text",
            "number",
            "date",
            "name",
            "email"
        ]
    },

    page: {
        type: Number
    },

    x: {
        type: Number
    },

    y: {
        type: Number
    },

    width: {
        type: Number
    },

    height: {
        type: Number
    },

    value: {
        type: String
    }
}]

},{timestamps:true});
export const signature = new mongoose.model("signature",SignatureSchema)