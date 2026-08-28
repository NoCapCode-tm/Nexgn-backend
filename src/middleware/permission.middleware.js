import { user } from "../models/user.models";
import { asynchandler } from "../utils/Asynchandler.utils";


export const checkpermission = asynchandler(async(req,res,next)=>{
    const admin = await user.findById(req.user._id)

    if(!admin){
        throw new Apierror(401,"User Not Authorized")
    }

    if(admin.permissions.includes("Templates-View")){
        next()
    }else{
        return ;
    }
})