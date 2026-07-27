import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Resend } from 'resend';



 export const adminsignup = asynchandler(async(req,res)=>{
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

    res.status(200)
    .cookie("token",token,options)
    .json(new Apiresponse(200,"Login successfull",loginuser))
    
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
     }
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
  if(currentpass !==undefined && updatepass!==undefined){
     const correctpass = await admin.isPasswordcorrect(currentpass)
     if(!correctpass){
      throw new Apierror(400,"Wrong current password")
     }
     admin.password = updatepass
  }

  await admin.save();

  res.status(200).json(
    new Apiresponse(200, "Profile updated successfully", admin)
  );
});

export const addcontact = asynchandler(async(req,res)=>{
  const {name,email,contact,emergency,gender,job,language,address} = req.body
  const admin = req.user

  if(!admin){
    throw new Apierror(401,"User not Authorized")
  }

  if(!name || !email){
    throw new Apiresponse(400,"Please fill all the required fields")
  }
   const existinguser = await user.findOne({
        $or:[{email}]
    })
    if(existinguser){
       throw new Apierror(409,"User already exists")
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
  }

  const admin1 = await user.findById(admin._id)

  if(!email || !name){
    throw new Apierror(400,"Please fill all the required fields")
  }

  const existing = await user.findOne({
    $or:[{email}]
  })

  if(existing){
    throw new Apierror(409,"User already exists with this email")
  }

  const subadmin = await user.create({
    name,
    email,
    role:"Sub-Admin"
  })

  const resend = new Resend(process.env.RESEND_API_KEY);
          const response =  await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: email,
        subject:`Your Nexgn workspace is now live.`,
        html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation to join Nexgn - Sub-Admin</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    
    <!-- Google Fonts import for Inter and MuseoModerno -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=MuseoModerno:ital,wght@0,100..300;1,100..300&display=swap" rel="stylesheet">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        museo: ['MuseoModerno', 'sans-serif'],
                    },
                    colors: {
                        nexgn: {
                            red: '#E60000',
                            darkred: '#990000',
                            black: '#050505',
                            gray: '#F9FAFB'
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-100 font-sans antialiased text-gray-800 py-8">

    <!-- Wrapper for centering -->
    <div class="max-w-2xl mx-auto bg-white overflow-hidden sm:rounded-[2rem] shadow-xl border border-gray-100">
        
        <!-- Top Logo Bar -->
        <div class="px-8 py-6 border-b border-gray-100">
            <div class="flex items-center gap-2.5">
                <!-- Abstract Red Logo -->
                <svg width="24" height="24" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 0C20.209 2.09114e-05 21.9998 1.79106 22 4V18C22 18.2443 21.9765 18.4836 21.9346 18.7158L17.1211 14.0068C16.1111 13.0191 14.4825 13.0286 13.4834 14.0273C12.4843 15.0264 12.4931 16.6369 13.5029 17.625L17.9756 22H4C3.87917 22 3.7597 21.9939 3.6416 21.9834L17.0488 8.86816C18.0587 7.88006 18.0674 6.26862 17.0684 5.26953C16.0693 4.27059 14.4407 4.26214 13.4307 5.25L0.0175781 18.3711C0.0063561 18.249 0 18.125 0 18V4.00098L4.85449 8.75098C5.86459 9.73895 7.49406 9.72958 8.49316 8.73047C9.4918 7.73133 9.48246 6.12075 8.47266 5.13281L3.29102 0.0644531C3.5212 0.0232656 3.75797 0 4 0H18Z" fill="#FF0915"/>
                </svg>
                <span class="text-nexgn-red font-bold text-2xl tracking-tight font-museo">Nexgn</span>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="px-8 py-10">
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                You've been invited to join Nexgn.
            </h1>
            
            <p class="text-gray-600 text-base leading-relaxed mb-6">
                Hi <strong>${name}</strong>,<br><br>
                <strong>${admin1.name}</strong> has invited you to join the <strong>[Workspace/Company Name]</strong> workspace on Nexgn. You have been assigned the role of <strong>Sub-Admin</strong>.
            </p>

            <!-- Role Permissions Box -->
            <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8">
                <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Your Permissions Summary</h3>
                <ul class="space-y-3">
                    <li class="flex items-start gap-3">
                        <i class="ph-fill ph-check-circle text-nexgn-red text-xl mt-0.5"></i>
                        <span class="text-sm text-gray-600"><strong>Document Workflows:</strong> Request signatures and execute documents on behalf of the company.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i class="ph-fill ph-check-circle text-nexgn-red text-xl mt-0.5"></i>
                        <span class="text-sm text-gray-600"><strong>Template Management:</strong> Create, edit, and organize reusable contract templates.</span>
                    </li>
                    <li class="flex items-start gap-3">
                        <i class="ph-fill ph-check-circle text-nexgn-red text-xl mt-0.5"></i>
                        <span class="text-sm text-gray-600"><strong>Audit Logs:</strong> View document execution statuses and compliance trails.</span>
                    </li>
                </ul>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col sm:flex-row items-center gap-4 mb-8">
                <!-- Accept CTA (Redirects to password creation) -->
                <a href="http://localhost:5174/mail-invite" class="w-full sm:w-auto bg-nexgn-red hover:bg-nexgn-darkred text-white font-semibold py-3.5 px-8 rounded-xl text-center transition-colors shadow-sm">
                    Accept Invitation
                </a>
                
                <!-- Decline CTA (Logs the decline response) -->
                <a href="http://localhost:5000/api/v1/admin/decline/${email}" class="w-full sm:w-auto bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-8 rounded-xl text-center transition-colors">
                    Decline
                </a>
            </div>

            <p class="text-xs text-gray-400">
                <i class="ph-fill ph-lock-key mr-1"></i> For security and DPDP compliance, this invitation link is tied directly to your email address and will expire in <strong>72 hours</strong>. Upon accepting, you will be prompted to create a secure password and configure 2-Step Verification (2FA).
            </p>
        </div>

        <!-- Footer Section (Matched to Welcome Footer) -->
        <div class="bg-gray-50 px-8 py-8 border-t border-gray-100 text-center">
            
            <!-- Security Badges -->
            <div class="flex justify-center items-center gap-6 sm:gap-10 mb-8 border-b border-gray-200 pb-8">
                <div class="flex flex-col items-center gap-2">
                    <i class="ph ph-shield-check text-2xl text-gray-500"></i>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">SOC 2<br>Type II</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <i class="ph ph-lock-key text-2xl text-gray-500"></i>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">AES-256<br>Encrypted</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <i class="ph ph-file-dashed text-2xl text-gray-500"></i>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">DPDP<br>Compliant</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                    <i class="ph ph-globe text-2xl text-gray-500"></i>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-wider">ISO/IEC<br>27001</span>
                </div>
            </div>

            <div class="flex items-center justify-center gap-2 text-gray-500 text-sm mb-8">
                <div class="border border-nexgn-red text-nexgn-red rounded-full p-2">
                    <i class="ph ph-plant text-xl"></i>
                </div>
                <p>Saving tons of paper, <span class="text-nexgn-red font-bold italic">one signature</span> at a time.</p>
            </div>

            <div class="text-left mb-8">
                <h4 class="text-xs font-bold text-gray-900 tracking-wider mb-2">CONFIDENTIALITY & LEGAL NOTICE</h4>
                <p class="text-[10px] text-gray-500 leading-relaxed text-justify">
                    This communication and its secure links are strictly confidential and intended solely for the designated recipient. Nexgn digital signatures are legally binding and comply with global frameworks including the IT Act 2000, ESIGN Act, and eIDAS. If you received this in error, please notify our security team and delete all copies immediately. Nexgn will never request your password or 2FA credentials via email.
                </p>
            </div>

            <!-- Social Links & Address -->
            <div class="flex justify-center gap-4 mb-6">
                <a href="#" class="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors">
                    <i class="ph-fill ph-linkedin-logo text-lg"></i>
                </a>
                <a href="#" class="w-10 h-10 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:border-gray-300 hover:text-gray-900 transition-colors">
                    <i class="ph ph-x text-lg"></i>
                </a>
            </div>

            <p class="text-[11px] text-gray-500 font-medium">
                &copy; 2026 Nexgn, Inc. All rights reserved.<br>
                <span class="font-normal mt-1 block">New Delhi &bull; India</span>
            </p>
        </div>

    </div>
</body>
</html>`
      });

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

    return res.send(`
        <h2>Invitation Declined</h2>
        <p>You have successfully declined the invitation.</p>
    `);

});