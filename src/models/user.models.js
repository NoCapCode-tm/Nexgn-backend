import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"


const UserSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
    },
    phone_no:{
        type:Number,
        default:null,
    },
    role:{
        type:String,
        enum:["Admin","Member","Sub-Admin"],
        required:true
    },
    profile_picture:{
        type:String
    },
    time_zone:{
        type:String,
        default:null
    },
    language:{
        type:String,
        default:null
    },
    professional_details:{
        org_id:{
            type:String,
        },
        company_name:{
            type:String,
        },
        team_size:{
            type:Number,
        },

    }
},{timestamps:true})

UserSchema.pre("save",async function(){
    if(!this.isModified("password"))return null;
    this.password = await bcrypt.hash(this.password,10)
    
})

UserSchema.methods.isPasswordcorrect = async function(password){
    if(!password) return null
    return bcrypt.compare(password,this.password)
}

UserSchema.methods.AccessToken = function(){
    return jwt.sign({
        email:this.email,
        _id:this.id,
        name:this.name
    },
    process.env.TOKEN,
    {
    expiresIn:process.env.EXPIRES_IN
    })
}
export const user = new mongoose.model("user",UserSchema)