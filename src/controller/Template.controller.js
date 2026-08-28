import { google } from "googleapis";
import { googledrive } from "../models/GoogleDrive.js";
import { template } from "../models/Template.js";
import { templatewidget } from "../models/TemplateWidgets.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { uploadFileToDrive } from "../utils/uploadfiletodrive.utils.js";
import { activitylog } from "../models/ActivityLog.js";
import { user } from "../models/user.models.js";


export const createtemplate = asynchandler(async(req,res)=>{
   const body = req.body || {};
   const user = req.user

   let driveuser;
   if(req.user.role==="Admin"){
    driveuser = req.user._id
   }else{
    driveuser = req.user.addedby
   }

const {
  title,
  content,
  role,
  widget,
  note
} = body;

    if( !role ||!widget || widget.length === 0){
        throw new Apierror(400,"Please fill all the required fields")
         const activity = await activitylog.create({
             userId:user._id,
             action:"Template Creation Failed",
             status:"Failure"
         })
    }

    let temple;
    let driveLink = null;
    if(req.file){
        const uploadedFile = await uploadFileToDrive(driveuser,req.file); // ya uploadedFile.webViewLink
        temple = await template.create({
          name:title,
          file:uploadedFile,
          note,
          createdby:req.user._id
    })
    }else{
        temple = await template.create({
          name:title,
          htmlcontent:content,
          createdby:req.user._id
    })
    }
    const widget1 =
  typeof req.body.widget === "string"
    ? JSON.parse(req.body.widget)
    : req.body.widget;

    const templatewidgets = await templatewidget.create({
        role,
        templateid:temple._id,
        widget:widget1
    })

    const activity = await activitylog.create({
             userId:user._id,
             refId:temple._id,
             refModel: "template",
             action:"Template Created Successfully",
             status:"Success"
         })

    res.status(200)
    .json(new Apiresponse(200,"Template created Successfully",temple))

})

export const gettemplate = asynchandler(async (req, res) => {

  const admin = req.user;

  if (!admin) {
    throw new Apierror(401, "User not authorized");
  }

  const templates = await templatewidget
    .find()
    .populate({
      path: "templateid",
      populate: {
        path: "createdby",
        select: "_id name",
      },
    });

  const filteredtemp = templates.filter(
    (d) =>
      d.templateid?.createdby?._id?.toString() ===
      admin._id.toString() ||d.templateid?.createdby?._id?.toString() ===
      admin.addedby.toString()
  );

  return res.status(200).json(
    new Apiresponse(
      200,
      "Templates Fetched Successfully",
      filteredtemp
    )
  );
});

export const getTemplatePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const temple = await template.findById(id);

    const created = await user.findById(temple.createdby)
    if(!created|| created.deleted === true){
      throw new Apierror(404,"User Not found or Deleted")
    }

    if (!temple) {
      return res.status(404).json({
        success: false,
        message: "Template not found",
      });
    }
    let driveuser ; 
    if(created.role==="Admin"){
      driveuser = created._id
    }else{
      driveuser=created.createdby
    }

    const driveAccount = await googledrive.findOne({
      userId: driveuser,
      connected: true,
    });

    if (!driveAccount) {
      return res.status(400).json({
        success: false,
        message: "Google Drive not connected",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: driveAccount.refreshToken,
    });

    const drive = google.drive({
      version: "v3",
      auth: oauth2Client,
    });

    const response = await drive.files.get(
      {
        fileId: temple.file.fileId, // <-- adjust according to your schema
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${temple.file.fileName}"`
    );

    response.data.pipe(res);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const deletetemplate = asynchandler(async(req,res)=>{
    const {id}= req.params
    const user = req.user

    if(!id){
        throw new Apierror(400,"Id not Found")
        const activity = await activitylog.create({
             userId:user._id,
             refId:id,
             refModel: "template",
             action:"Template Deletion Failed",
             status:"Failure"
         })
    }

    await template.findByIdAndDelete(id)
    const activity = await activitylog.create({
             userId:user._id,
             refId:id,
             refModel: "template",
             action:"Template Deleted Successfully",
             status:"Success"
         })

    res.status(200)
    .json(new Apiresponse(200,"Template Deleted Successfully",[]))
})

export const getsingletemplate = asynchandler(async(req,res)=>{
     const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const temple = await template.findById(id)
    if(!temple){
        throw new Apierror(404,"Template not Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",temple))
})