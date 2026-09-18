
import { renderResetPasswordEmail, renderSubAdminInviteEmail, renderTwoFAemail, renderVerifyEmail, renderWaitlistEmail } from "../emails/renderEmail.jsx";
import crypto from "crypto";
import { activitylog } from "../models/ActivityLog.js";
import { notified } from "../models/notified.models.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Resend } from 'resend';
import { generateSecret,generateURI,verify} from "otplib";
import QRCode from "qrcode";
import { team} from "../models/team.model.js";
import { Contacts } from "../models/contact.model.js";



export const adminsignup = asynchandler(async (req, res) => {
    const {
        name,
        email,
        password,
        companyname,
        industry,
        team_size
    } = req.body;

    if (!name || !email || !password) {
        throw new Apierror(400, "Something went wrong");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existinguser = await user.findOne({
        email: normalizedEmail
    });

    if (existinguser) {
        throw new Apierror(400, "User already exists");
    }

    const orgid = `NGX-${companyname.split(" ")[0]}`;

    const admin = await user.create({
        name,
        email: normalizedEmail,
        password,
        role: "Admin",
        status: "Not-Active"
    });

    const team1 = await team.create({
        company_name: companyname,
        industry,
        org_id: orgid,
        team_size,
        owner: admin._id
    });

    admin.teamid = team1._id;

    // Generate secure verification token
    const verificationToken = crypto
        .randomBytes(32)
        .toString("hex");

    // Store only the hash in MongoDB
    const hashedVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    admin.resetpasswordtoken = {
        token: hashedVerificationToken,
        expiresin: new Date(
            Date.now() + 30 * 60 * 1000
        )
    };

    await admin.save();

    await activitylog.create({
        userId: admin._id,
        action: "Account & Team Created Successfully",
        status: "Success"
    });

    const resend = new Resend(
        process.env.RESEND_API_KEY
    );

    const html = await renderVerifyEmail({
        recipientName: admin.name,
        verifyUrl: `${process.env.FRONTEND_URI}/verify/${verificationToken}`,
    });

    await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: admin.email,
        subject: "Action Required: Verify your Nexgn account",
        html
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            {
                userId: admin._id,
                email: admin.email
            },
            "Admin signed up successfully. Please verify your email."
        )
    );
});

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

         if(loginuser.twoFAenabled===true){
            res.status(200)
            .json(new Apiresponse(200,"Login successfull",loginuser))
         }else{
            res.status(200)
            .cookie("token",token,options)
            .json(new Apiresponse(200,"Login successfull",loginuser))
         }
 
    
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
  secure: true,    
  sameSite:"None" ,
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
    gender,
    status
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
  if(status !== undefined) admin.status = status
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



export const getuser = asynchandler(async(req,res)=>{
    const admin = req.user
  const getuser = await user.find({teamid:admin.teamid});

  if(!getuser){
    throw new Apierror(400,"User not found")
  }
//   const filtereduser = getuser.filter((g)=>g.addedby === admin._id)

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
    role:"Sub-Admin",
    teamid:admin1.teamid
  })

  const team1 = await team.findById(admin.teamid)

  const resend = new Resend(process.env.RESEND_API_KEY);

const html = await renderSubAdminInviteEmail({
    recipientName: name,
    inviterFirstName: admin1.name,
    organizationName:team1.company_name ,
    email: email
});

const response = await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: email,
    subject: `You've been invited to join ${team1.company_name} on Nexgn`,
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

export const getsubadmin = asynchandler(async (req, res) => {
  const admin = req.user;
  
   const teammates = await user.find({
  teamid: admin.teamid,
  role: {
    $in: ["Admin", "Sub-Admin"]
  },
  deleted: false
});

  res.status(200).json(
    new Apiresponse(
      200,
      "Teammates fetched successfully",
      teammates
    )
  );
});

export const declineInvitation = asynchandler(async (req, res) => {

    const {email} = req.params;

    const invitedUser = await user.findOne({
        $or:[{email}]
    });

    if (!invitedUser) {
        throw new Apierror(404, "User not found");
    }

    invitedUser.status = "Declined";
    invitedUser.teamid=null
    invitedUser.deleted = true;

    await invitedUser.save();
    //  const activity = await activitylog.create({
    //         userId:admin._id,
    //         refId:invitedUser._id,
    //         action:"Sub-Admin Declined Invitation",
    //         status:"Success"
    //     })

    res.status(200)
    .json(new Apiresponse(201,"Invite declined successfully"))
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
    subad.status = "Active"

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
    subject: "You're officially on the Nexgn waitlist",
    html
});

      res.status(200)
      .json(new Apiresponse(200,"Notification saved successfully",notified1))



})


export const resetpassword = asynchandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new Apierror(400, "Email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const loginuser = await user.findOne({
        email: normalizedEmail
    });

    if (!loginuser) {
        return res.status(200).json(
            new Apiresponse(
                200,
                null,
                "If an account exists with this email, a reset link has been sent."
            )
        );
    }

    
    const resetToken = crypto.randomBytes(32).toString("hex");

    
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    loginuser.resetpasswordtoken = {
        token: hashedToken,
        expiresin: new Date(Date.now() + 15 * 60 * 1000)
    };

    await loginuser.save();

    const resend = new Resend(process.env.RESEND_API_KEY);

    const html = await renderResetPasswordEmail({
        resetUrl: `${process.env.FRONTEND_URI}/reset/${resetToken}`,
    });

    await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: normalizedEmail,
        subject: "Action Required: Reset your Nexgn password",
        html
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "If an account exists with this email, a reset link has been sent."
        )
    );
});

export const changestatus = asynchandler(async (req, res) => {
    const { id } = req.body;

    if (!id) {
        throw new Apierror(400, "Verification token is required");
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");

    const admin1 = await user.findOne({
        "resetpasswordtoken.token": hashedToken,
        "resetpasswordtoken.expiresin": {
            $gt: new Date()
        }
    });

    if (!admin1) {
        throw new Apierror(
            400,
            "Invalid or expired verification token"
        );
    }

    if (admin1.status === "Active") {
        throw new Apierror(
            400,
            "Email is already verified"
        );
    }

    admin1.status = "Active";

    admin1.emailverificationtoken = {
        token: null,
        expiresAt: null
    };

    await admin1.save();

    await activitylog.create({
        userId: admin1._id,
        action: "Email Verified Successfully",
        status: "Success"
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "Email verified successfully"
        )
    );
});

export const resetpass = asynchandler(async (req, res) => {
    const { id, password } = req.body;

    if (!id || !password) {
        throw new Apierror(
            400,
            "Token and password are required"
        );
    }

    // if (password.length < 8) {
    //     throw new Apierror(
    //         400,
    //         "Password must be at least 8 characters"
    //     );
    // }

    
    const hashedToken = crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");

    const loginuser = await user.findOne({
        "resetpasswordtoken.token": hashedToken,
        "resetpasswordtoken.expiresin": {
            $gt: new Date()
        }
    });

    if (!loginuser) {
        throw new Apierror(
            400,
            "Invalid or expired reset token"
        );
    }

    
    loginuser.password = password;

    loginuser.resetpasswordtoken = {
        token: null,
        expiresAt: null
    };

    await loginuser.save();

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "Password changed successfully"
        )
    );
});

export const twofaenable = asynchandler(async(req,res)=>{
   
    const admin= await user.findById(req.user._id)
    if(!admin){
        throw new Apierror(401,"User not Authorized")
    }
    const secret = await generateSecret()
    if(!secret){
        throw new Apierror(404,"Secret not generated")
    }

   const otpauth = generateURI({
    issuer: "Nexgn Inc.",
    label: admin.email,
    secret: secret,
    algorithm: "sha1",
    digits: 6,
    period: 30
});

const qrCode = await QRCode.toDataURL(otpauth);

        admin.twoFAsecret=secret
        admin.save()


        res.status(200)
        .json(new Apiresponse(200,"2 FA Enabled",{qrCode,secret}))
})

export const verifyotp = asynchandler(async(req,res)=>{
    const {token} = req.body
     const admin = await user.findById(req.user._id)
    if(!admin){
        throw new Apierror(401,"User not Authorized")
    }

    if(!token){
        throw new Apierror(400,"Please fill all the required fields")
    }

    const veri = await verify({token,secret:admin.twoFAsecret})
    if(!veri){
        throw new Apierror(401,"User not authorized")
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const name = admin.name.split(" ")[0]
const html = await renderTwoFAemail({
    recipientName:name
});

if(!admin.twoFAenabled){
    admin.twoFAenabled=true
    admin.save()
}

await resend.emails.send({
    from: `Nexgn <${process.env.SMTP_USER}>`,
    to: admin.email,
    subject: "Security Update: Two-Factor Authentication enabled",
    html
});

    res.status(200)
    .json(new Apiresponse(200,"User verified Successfully",admin))
    //checking
})

export const verifyotplogin = asynchandler(async (req, res) => {
  const { token, id } = req.body;

  // Basic validation
  if (!id || !token) {
    throw new Apierror(400, "Verification code is required");
  }

  // OTP should always be exactly 6 digits
  if (!/^\d{6}$/.test(String(token))) {
    throw new Apierror(400, "Invalid authentication code");
  }

  const admin = await user.findById(id);

  if (!admin) {
    throw new Apierror(401, "Invalid authentication request");
  }

  // Make sure 2FA is actually enabled
  if (!admin.twoFAenabled || !admin.twoFAsecret) {
    throw new Apierror(400, "Two-factor authentication is not enabled");
  }

  // Check temporary lock
  if (
    admin.twoFABlockedUntil &&
    admin.twoFABlockedUntil > new Date()
  ) {
    const remainingMs =
      admin.twoFABlockedUntil.getTime() - Date.now();

    const remainingMinutes = Math.ceil(
      remainingMs / (60 * 1000)
    );

    throw new Apierror(
      429,
      `Too many failed attempts. Try again in ${remainingMinutes} minute(s).`
    );
  }

  // Verify OTP
  const isValid = await verify({
    token: String(token),
    secret: admin.twoFAsecret,
  });

  if (!isValid) {
    admin.twoFAFailedAttempts =
      (admin.twoFAFailedAttempts || 0) + 1;

    // Lock after 5 failed attempts
    if (admin.twoFAFailedAttempts >= 5) {
      admin.twoFABlockedUntil = new Date(
        Date.now() + 10 * 60 * 1000
      );

      await admin.save();

      throw new Apierror(
        429,
        "Too many failed attempts. Try again after 10 minutes."
      );
    }

    await admin.save();

    const attemptsLeft =
      5 - admin.twoFAFailedAttempts;

    throw new Apierror(
      401,
      `Invalid authentication code. ${attemptsLeft} attempt(s) remaining.`
    );
  }

  // Successful OTP → reset brute-force counters
  admin.twoFAFailedAttempts = 0;
  admin.twoFABlockedUntil = null;

  await admin.save();

  // Generate final authenticated JWT
  const token1 = await admin.AccessToken();

  if (!token1) {
    throw new Apierror(
      500,
      "Token could not be generated"
    );
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 9 * 60 * 60 * 1000,
  };

  return res
    .status(200)
    .cookie("token", token1, options)
    .json(
      new Apiresponse(
        200,
        "Two-factor authentication successful",
        admin
      )
    )
});

export const addpermission = asynchandler(async(req,res)=>{
    const {id,permissions} = req.body

    if(!permissions){
        throw new Apierror(400,"Please fill all the required fields")
    }

    const subadmin = await user.findById(id)
    if(!subadmin){
        throw new Apierror(401,"User not Authorized")
    }

    subadmin.permissions = permissions
    await subadmin.save()

    res.status(200)
    .json(new Apiresponse(200,"Permissions Added successfully",subadmin))

})

export const disabletwofa = asynchandler(async(req,res)=>{
    const admin = await user.findById(req.user._id)

    if(!admin){
        throw new Apierror(401,"User not Authorized")
    }
     admin.twoFAsecret = null
     admin.twoFAenabled = false
     await admin.save()

     res.status(200)
     .json(new Apiresponse(200,"Two Factor Authentication Disabled",[]))
})
