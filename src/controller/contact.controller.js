import { activitylog } from "../models/ActivityLog"
import { Contacts } from "../models/contact.model"
import { Apierror } from "../utils/Apierror.utils"
import { Apiresponse } from "../utils/Apiresponse.utils"
import { asynchandler } from "../utils/Asynchandler.utils"

export const addcontact = asynchandler(async(req,res)=>{
  const {name,email,contact,gender} = req.body
  const admin = req.user

  if(!admin){
    throw new Apierror(401,"User not Authorized")
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Add contact Failed",
             status:"Failure"
         })
  }

  if(!name || !email){
    throw new Apiresponse(400,"Please fill all the required fields")
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Add contact Failed",
             status:"Failure"
         })
  }
   const existinguser = await Contacts.findOne({
        $or:[{email}]
    })
    if(existinguser){
       throw new Apierror(409,"User already exists")
       const activity = await activitylog.create({
             userId:admin._id,
             action:"Add contact Failed",
             status:"Failure"
         })
    }
  const contact1 = await Contacts.create({
    name:name,
    email:email,
    phone_no:contact,
    gender:gender,
    teamid:admin.teamid
  })

  const activity = await activitylog.create({
            userId:admin._id,
            refId:contact1._id,
            refModel: "user",
            action:"Member Added Successfully",
            status:"Success"
        })

  res.status(200)
  .json(200,"User Added to Contactbook",contact1)

})


export const getContact = asynchandler(async(req,res)=>{
    const contact = await Contacts.find({teamid:req.user.teamid})

    if(!contact){
        throw new Apierror(404,"Contact Not Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Contact Fetched Successfully",contact))
})

export const deletecontact = asynchandler(async(req,res)=>{
    const {id} = req.params
     if(!id){
        throw new Apierror(400,"Id is required")
    }

    await Contacts.findOneAndDelete({_id:id,teamid:req.user.teamid})

   
    res.status(200)
    .json(new Apiresponse(200,"Contact Deleted Successfully",[]))
})