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
        required:true,
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
        enum:["Admin","Sub-Admin"],
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
    
    gender:{
        type:String
    },
    job_title:{
      type:String
    },
    emergency_contact:{
      type:Number
    },
    address:{
        type:String
    },
    deleted:{
        type:Boolean,
        default:false
    },
    status:{
        type:String,
        enum:["Active","Not-Active","Declined"],
        default:"Not-Active"
    },
    // addedby:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"user",
    //     default:null
    // },
    teamid:{
        type:mongoose.Schema.Types.ObjectId,
         ref:"team",
         default:null

    },
    twoFAenabled:{
        type:Boolean,
        default:false
    },
    twoFAsecret:{
        type:String,
    },
    twoFAFailedAttempts: {
  type: Number,
  default: 0,
},

twoFABlockedUntil: {
  type: Date,
  default: null,
},
    permissions:[String],
    resetpasswordtoken:{
        token:{
            type:String,
            default:null,
        },
        expiresin:{
          type:Date,
          default:null
        }
    }

},{timestamps:true})

UserSchema.index({
    teamid: 1,
    deleted: 1,
    role: 1
});

UserSchema.index({
    "resetpasswordtoken.token": 1,
    "resetpasswordtoken.expiresin": 1
});

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
        _id:this.id,
        role:this.role,
        teamid:this.teamid,
        name:this.name

    },
    process.env.TOKEN,
    {
    expiresIn:process.env.EXPIRES_IN
    })
}
export const user = new mongoose.model("user",UserSchema)