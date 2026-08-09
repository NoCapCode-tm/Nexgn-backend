import { activitylog } from "../models/ActivityLog.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";



export const getAuditlog = asynchandler(async(req,res)=>{
    const user = req.user

    const activity = await activitylog
  .find({ userId: user._id })
  .populate("userId")
  .populate("refId");

    if(!activity){
        throw new Apierror(404,"No Activity Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Activity log Fetched",activity))

})

export const deleteactivity = asynchandler(async(req,res)=>{
   const{id}=req.body

   if(!id){
    throw new Apierror(400,"Please fill all the required fields")
   }

   await activitylog.findByIdAndDelete(id)
     res.status(200)
    .json(new Apiresponse(200,"Activity deleted",[]))
})