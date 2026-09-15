import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const ContactSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        required:true,
    },
    phone_no:{
        type:Number,
        default:null,
    },
     gender:{
        type:String
    },
    teamid:{
            type:mongoose.Schema.Types.ObjectId,
             ref:"team",
             default:null
    
        },
},{timestamps:true})

export const Contacts = new mongoose.model("Contacts",ContactSchema)