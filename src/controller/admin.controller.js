
import { renderResetPasswordEmail, renderSubAdminInviteEmail, renderVerifyEmail, renderWaitlistEmail } from "../emails/renderEmail.jsx";

import { activitylog } from "../models/ActivityLog.js";
import { notified } from "../models/notified.models.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Resend } from 'resend';



 export const adminsignup = asynchandler(async(req,res)=>{
    try {
        const {name,email,password,companyname,industry,team_size} =req.body
    
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
            professional_details:{
               company_name:companyname,
               industry,
               org_id:orgid,
               team_size,
            },
            role:"Admin",
        })

        const activity = await activitylog.create({
            userId:admin._id,
            action:"Account Created Successfully",
            status:"Success"
        })
      
        const resend = new Resend(process.env.RESEND_API_KEY);
        const html = await renderVerifyEmail({
    recipientName: admin.name,
    verifyUrl: "https://sign.nexgn.cloud/",
    createdAt: admin.createdAt
});

await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: admin.email,
    subject: "Verify your Nexgn email",
    html
});
    
        res.status(200)
        .json(new Apiresponse(200,"Admin signed up successfully",admin))
    } catch (error) {
        console.log("Something went wrong in Signing up")
    }

})

export const loginAdmin = asynchandler(async(req,res)=>{
   try {
     const{email,password}=req.body
 
     if(!email || !password){
         throw new Apierror(400,"Please fill all the necessary field")
     }
 
     const loginuser = await user.findOne({
         $or:[{email}]
     })
 
     if(!loginuser){
         throw new Apierror(404,"Admin not found")
         const activity = await activitylog.create({
             userId:loginuser._id,
             action:"Login Failure",
             status:"Failure"
         })
     }
 
     const checkpassword = await loginuser.isPasswordcorrect(password)
     if(!checkpassword){
         throw new Apierror(401,"Incorrect Password")
         
     }
 
     const token = await loginuser.AccessToken()
     if(!token){
         throw new Apierror(400,"Token not generated")
     }
 
      const options = {
     httpOnly:true,
     secure:true,
     sameSite:"None",
     maxAge:9*60*60*1000
   }
 
    const activity = await activitylog.create({
             userId:loginuser._id,
             action:"Login Successfull",
             status:"Success"
         })
 
     res.status(200)
     .cookie("token",token,options)
     .json(new Apiresponse(200,"Login successfull",loginuser))
   } catch (error) {
      console.log("Something went wrong")
   }
    
})

export const getAdmin = asynchandler(async(req,res)=>{
     const id = req.user._id

     const loginuser = await user.findById(id)
     if(!loginuser){
        throw new Apierror(400,"User not Authorized")
     }

     res.status(200)
     .json(new Apiresponse(200,"User fetched Successfully",loginuser))
})

export const deleteAdmin = asynchandler(async(req,res)=>{
    const {id} = req.body
    if(!id){
        throw new Apierror(400,"Id not found")
    }
     const loguser = await user.findByIdAndDelete(id)
     if(!loguser){
        throw new Apierror(400,"User not Authorized")
        // const activity = await activitylog.create({
        //      userId:loguser._id,
        //      action:"Account deletion Failure",
        //      status:"Failure"
        //  })
     }

      const activity = await activitylog.create({
            userId:loguser._id,
            action:"Account Deletion Successfully",
            status:"Success"
        })
      res.status(200)
     .json(new Apiresponse(200,"User deleted Successfully",loguser))
})

export const logout = asynchandler(async(req,res)=>{
    const options = {
  httpOnly: true,
  secure: false,    
  sameSite:"lax" ,
  maxAge:9*60*60*1000,
}
 
   return  res.status(200)
    .clearCookie("token",options)
    .json(new Apiresponse(200,"User loggedout successfully",{}))
 
})

export const updateAdmin = asynchandler(async (req, res) => {
  const id = req.user._id;
  console.log("called")
  const {
    name,
    phone_no,
    profile_picture,
    time_zone,
    language,
   currentpass,
   updatepass,
    companyname,
    teamsize,
    address,
    emergency,
    gender
  } = req.body;

  const admin = await user.findById(id);

  if (!admin) {
    throw new Apierror(404, "User not found");
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Account Updation Failure",
             status:"Failure"
         })
  }

  if (name !== undefined) admin.name = name;
  if (phone_no !== undefined) admin.phone_no = phone_no;
 if (req.file) {
  const uploaded = await uploadToCloudinary(
    req.file.buffer,
    "profile-pictures",
    `${admin._id}-${Date.now()}`
  );

  admin.profile_picture = uploaded.secure_url;
}
  if (time_zone !== undefined) admin.time_zone = time_zone;
  if (language !== undefined) admin.language = language;
  if (companyname !== undefined) admin.professional_details.company_name = companyname;
  if (teamsize !== undefined) admin.professional_details.team_size = teamsize;
  if(address !== undefined) admin.address = address;
  if(emergency !==undefined) admin.emergency_contact = emergency;
  if(gender !==undefined) admin.gender = gender;
  if (
  currentpass?.trim() &&
  updatepass?.trim()
) {
  const correctpass = await admin.isPasswordcorrect(currentpass);

  if (!correctpass) {
    throw new Apierror(400, "Wrong current password");
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Account Updation Failure",
             status:"Failure"
         })
  }

  admin.password = updatepass;
}

  await admin.save();

  const activity = await activitylog.create({
            userId:admin._id,
            action:"Account Updated Successfully",
            status:"Success"
        })

  res.status(200).json(
    new Apiresponse(200, "Profile updated successfully", admin)
  );
});

export const addcontact = asynchandler(async(req,res)=>{
  const {name,email,contact,emergency,gender,job,language,address} = req.body
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
   const existinguser = await user.findOne({
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
  const contact1 = await user.create({
    name:name,
    email:email,
    phone_no:contact,
    emergency_contact:emergency,
    gender:gender,
    job_title:job,
    langiage:language,
    address:address,
    role:"Member"
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

export const getuser = asynchandler(async(req,res)=>{
  const getuser = await user.find()

  if(!getuser){
    throw new Apierror(400,"User not found")
  }

  res.status(200)
  .json(new Apiresponse(200,"User fetched Successfully",getuser))
})

export const inviteadmin = asynchandler(async(req,res)=>{
  const {name , email} = req.body

   const admin = req.user

  if(!admin){
    throw new Apierror(401,"User not Authorized")
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Sub-Admin invite Failed",
             status:"Failure"
         })
  }

  const admin1 = await user.findById(admin._id)

  if(!email || !name){
    throw new Apierror(400,"Please fill all the required fields")
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Sub-Admin invite Failed",
             status:"Failure"
         })
  }

  const existing = await user.findOne({
    $or:[{email}]
  })

  if(existing){
    throw new Apierror(409,"User already exists with this email")
    const activity = await activitylog.create({
             userId:admin._id,
             action:"Sub-Admin invite Failed",
             status:"Failure"
         })
  }

  const subadmin = await user.create({
    name,
    email,
    role:"Sub-Admin"
  })

  const resend = new Resend(process.env.RESEND_API_KEY);

const html = await renderSubAdminInviteEmail({
    recipientName: name,
    inviterFirstName: admin1.name,
    organizationName: admin1.professional_details.company_name,
    email: email
});

const response = await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Nexgn workspace is now live.",
    html
});

      const activity = await activitylog.create({
            userId:admin._id,
            refId:subadmin._id,
            refModel: "user",
            action:"Sub-Admin Invited Successfully",
            status:"Success"
        })

      res.status(200)
      .json(new Apiresponse(200,"Invitation sent successfully",subadmin))
})

export const getsubadmin = asynchandler(async(req,res)=>{
  const users = await user.find()

  const subadmin = users.filter((s)=>s.role === "Sub-Admin")

  res.status(200)
  .json(new Apiresponse(200,"Sub admin fetched successfully",subadmin))
})

export const declineInvitation = asynchandler(async (req, res) => {

    const {email} = req.params;

    const invitedUser = await user.findOne({
        $or:[{email}]
    });

    if (!invitedUser) {
        throw new Apierror(404, "User not found");
    }

    invitedUser.invitestatus = "Declined";
    invitedUser.deleted = true;

    await invitedUser.save();
    //  const activity = await activitylog.create({
    //         userId:admin._id,
    //         refId:invitedUser._id,
    //         action:"Sub-Admin Declined Invitation",
    //         status:"Success"
    //     })

    return res.send(`
        <h2>Invitation Declined</h2>
        <p>You have successfully declined the invitation.</p>
    `);

});

export const setpass = asynchandler(async(req,res)=>{
    const {email ,password} = req.body

    if(!email || !password){
        throw new Apierror(400,"Please fill all the required fields")
    }

    const subad = await user.findOne({
        $or:[{email}]
    })

    if(!subad){
        throw new Apierror(404,"No user found with this email")
    }

    subad.password = password
    subad.invitestatus = "Active"

    subad.save()

    res.status(200)
    .json(new Apiresponse(200,"Password set successfully",subad))
})


export const notified0 = asynchandler(async(req,res)=>{
    const{name,email,interest} = req.body
    if(!name || !email){
        throw new Apierror(400,"Please fill all the required fields")
    }

    const notified1 = await notified.create({
        name,
        email,
        interest
    })

    if(!notified1){
        throw new Apierror(404,"Notified not found")
    }

   const resend = new Resend(process.env.RESEND_API_KEY);

const html = await renderWaitlistEmail({
    recipientName: name
});

await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your Nexgn workspace is now live.",
    html
});

      res.status(200)
      .json(new Apiresponse(200,"Notification saved successfully",notified1))



})


export const resetpassword = asynchandler(async(req,res)=>{
    const clicked = Date.now();
    const {email} = req.body

     const resend = new Resend(process.env.RESEND_API_KEY);

const html = await renderResetPasswordEmail({
    resetUrl: "https://sign.nexgn.cloud/",
    createdAt: clicked
});

await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your Nexgn password",
    html
});

})