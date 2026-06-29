import { user } from "../models/user.models";
import { Apierror } from "../utils/Apierror.utils";
import { Apiresponse } from "../utils/Apiresponse.utils";
import { asynchandler } from "../utils/Asynchandler.utils";



 export const adminsignup = asynchandler(async(req,res)=>{
    const {name,email,password,companyname,team_size} =req.body

    if(!name ||!email || !password){
        throw new Apierror(400,"Something went wrong")
    }

    const existinguser = await user.findOne({
        $or:[{email}]
    })
    if(existinguser){
       throw new Apierror(400,"User already exists")
    }
   let orgid = `NGX-${companyname.split(" ")[0]}`
    const admin = await user.create({
        name,
        email,
        password,
        companyname,
        org_id:orgid,
        team_size,
        role:"Admin"
    })

    res.status(200)
    .json(new Apiresponse(200,"Admin signed up successfully",admin))

})

export const loginAdmin = asynchandler(async(req,res)=>{
    const{email,password}=req.body

    if(!email || !password){
        throw new Apierror(400,"Please fill all the necessary field")
    }

    const loginuser = await user.findOne({
        $or:[{email}]
    })

    if(!loginuser){
        throw new Apierror(404,"Admin not found")
    }

    const checkpassword = await loginuser.isPasswordcorrect()
    if(!checkpassword){
        throw new Apierror(401,"Incorrect Password")
    }

    const token = await loginuser.AccessToken()
    if(!token){
        throw new Apierror(400,"Token not generated")
    }

     const options = {
    httpOnly:true,
    secure:false,
    sameSite:"lax",
    maxAge:9*60*60*1000
  }

    res.status(200)
    .json(new Apiresponse(200,"Login successfull",loginuser))
    .cookie("token",token,options)
})

export const getAdmin = asynchandler(async(req,res)=>{
     const id = req.user._id

     const user = await user.findById(id)
     if(!user){
        throw new Apierror(400,"User not Authorized")
     }

     res.status(200)
     .json(new Apiresponse(200,"User fetched Successfully",user))
})

export const deleteAdmin = asynchandler(async(req,res)=>{
    const {id} = req.params
    if(!id){
        throw new Apierror(400,"Id not found")
    }
     const user = await user.findByIdAndDelete(id)
     if(!user){
        throw new Apierror(400,"User not Authorized")
     }
      res.status(200)
     .json(new Apiresponse(200,"User deleted Successfully",user))
})

export const logout = asynchandler(async(req,res)=>{
    const options = {
  httpOnly: true,
  secure: true,    
  sameSite:"None" ,
  maxAge:9*60*60*1000,
}
   return  res.status(200)
    .clearCookie("token",options)
    .json(new Apiresponse(200,"User loggedout successfully",{}))
 
})