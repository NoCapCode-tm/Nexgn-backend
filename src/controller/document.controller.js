import { Resend } from "resend";
import { doc } from "../models/Document.js";
import { documentfield } from "../models/DocumentField.js";
import { signrequest } from "../models/SignatureRequest.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { activitylog } from "../models/ActivityLog.js";
import { team } from "../models/team.model.js";
import crypto from "crypto"
import { uploadFileToDrive } from "../utils/uploadfiletodrive.utils.js";
import { googledrive } from "../models/GoogleDrive.js";
import { google } from "googleapis";
import { signature } from "../models/Signature.js";
import { certificate } from "../models/Certificate.models.js";
import { template } from "../models/Template.js";
import { renderdocEmail } from "../emails/renderEmail.jsx";



export const createdocument = asynchandler(async (req, res) => {
    const {
        title,
        templateid,
        applicants,
        documentwidgets,
        expiry,
        note,
        senderip,
        pathname
    } = req.body;

    let documentwidget;
    let applicant;

    if (typeof applicants === "string") {
        try {
            applicant = JSON.parse(applicants);
        } catch (error) {
            throw new Apierror(400, "Invalid applicants format");
        }
    } else {
        applicant = applicants;
    }

    if (typeof documentwidgets === "string") {
        try {
            documentwidget = JSON.parse(documentwidgets);
        } catch (error) {
            throw new Apierror(400, "Invalid document widgets format");
        }
    }

    let driveuser;

    if (req.user.role === "Admin") {
        driveuser = req.user._id;
    } else {
        const team1 = await team.findById(req.user.teamid);

        if (!team1) {
            throw new Apierror(404, "Team not found");
        }

        driveuser = team1.owner;
    }

    if (!title || !applicants || !senderip || !pathname) {
        throw new Apierror(400, "Please fill all the required fields");
    }

    let document;
    let viewURL;

    if (req.file) {
        const uploadedFile = await uploadFileToDrive(
            driveuser,
            req.file
        );
        viewURL = uploadedFile.webViewLink;

        document = await doc.create({
            title,
            driveFileId: uploadedFile,
            createdBy: req.user._id,
            teamid: req.user.teamid,
            status: "draft",
            assignedto: applicant,
            note
        });

        await documentfield.create({
            documentId: document._id,
            widget: documentwidget
        });
    } else {
        const temple = await template.findById(templateid)
        viewURL=temple.file.webViewLink
        document = await doc.create({
            title,
            templateId: templateid,
            createdBy: req.user._id,
            teamid: req.user.teamid,
            status: "draft",
            assignedto: applicant,
            note
        });
    }

    let expiresAt = null;

    if (pathname === "/request-signature") {
        if (!expiry) {
            throw new Apierror(
                400,
                "Expiry is required for request signature"
            );
        }

        expiresAt = new Date();

        expiresAt.setDate(
            expiresAt.getDate() + Number(expiry)
        );
    }

    let respons;

    const tasks = applicant.map(async (signee) => {
        let member = await user.findOne({
            email: signee.email
        });

        if (!member) {
            member = await user.create({
                name: signee.name,
                email: signee.email,
                role: "Member",
                teamid: req.user.teamid,
                password: `Nexgn-${signee.name}-${signee.email}`
            });
        }

        const signerToken = crypto
            .randomBytes(32)
            .toString("hex");

        const hashedSignerToken = crypto
            .createHash("sha256")
            .update(signerToken)
            .digest("hex");

        const signature = await signrequest.create({
            documentId: document._id,
            senderId: document.createdBy,
            senderip,
            expiresat: expiresAt,
            signerToken: hashedSignerToken,
            recipient: {
                userId: member._id
            },
            overallStatus: "pending"
        });

        if (pathname === "/sign-yourself") {
            respons = signature._id;
        } else {
            respons = document;
        }
    const formattedDeadline = signature.expiresat
    ? new Date(signature.expiresat).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    })
    : "No expiry";

     const html = await renderdocEmail({
            senderName: req.user.name,
            documentName:title,
            deadlineDate:formattedDeadline,
            viewUrl:viewURL
        });
        
            const resend = new Resend(
                process.env.RESEND_API_KEY
            );
    
        await resend.emails.send({
            from: `Nexgn <${process.env.SMTP_USER}>`,
            to: admin.email,
            subject: "Your Signed Document",
            html
        });
    });

    await Promise.all(tasks);

    document.status = "sent";

    await document.save();

    await activitylog.create({
        userId: req.user._id,
        refId: document._id,
        refModel: "doc",
        action: "Document Created Successfully",
        status: "Success"
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            respons,
            "Document Created Successfully"
        )
    );
});

export const getdocument = asynchandler(async(req,res)=>{
  const admin = req.user 

    const documents = await doc.find({teamid:req.user.teamid})
  .populate("createdBy")
  .populate("templateId");

    if(!documents){
      throw new Apierror(404,"No Documents Found")
    }

//     const filtereddoc = documents.filter(
//   (d) =>
//     (
//       d.createdBy?._id?.toString() === admin?._id?.toString() ||
//       d.createdBy?._id?.toString() === admin?.addedby?.toString()
//     ) &&
//     d.isDeleted !== true
// );

    res.status(200)
    .json(new Apiresponse(200,"Documents Fetched Successfully",documents))
})

export const deletedocument = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new Apierror(400, "Id not Found");
    }

    const document = await doc.findOneAndDelete({
        _id: id,
        teamid: req.user.teamid
    });

    if (!document) {
        throw new Apierror(404, "Document not found");
    }

    const requests = await signrequest.find({
        documentId: document._id
    });

    const requestIds = requests.map((request) => request._id);

    const signatures = await signature.find({
        requestId: { $in: requestIds }
    });

    const certificateIds = signatures
        .map((item) => item.certificateId)
        .filter(Boolean);

    if (requestIds.length > 0) {
        await signature.deleteMany({
            requestId: { $in: requestIds }
        });

        await signrequest.deleteMany({
            documentId: document._id
        });
    }

    if (certificateIds.length > 0) {
        await certificate.deleteMany({
            _id: { $in: certificateIds }
        });
    }

    await documentfield.deleteMany({
        documentId: document._id
    });

    await activitylog.create({
        userId: req.user._id,
        refId: document._id,
        refModel: "doc",
        action: "Document deleted Successfully",
        status: "Success"
    });

    return res.status(200).json(
        new Apiresponse(
            200,
            "Document deleted successfully",
            null
        )
    );
});

export const getsingledocument = asynchandler(async(req,res)=>{
     const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false,teamid:req.user.teamid}).populate("templateId")
    if(!document){
        throw new Apierror(404,"Document not Found")
    }
    

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",document))
})

export const movetobin = asynchandler(async(req,res)=>{
   const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false,teamid:req.user.teamid})
    if(!document){
        throw new Apierror(404,"Document not Found")
    }

    document.isDeleted = true
    await document.save()
    

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",document))
})
export const restorefrombin = asynchandler(async(req,res)=>{
   const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,teamid:req.user.teamid})
    if(!document){
        throw new Apierror(404,"Document not Found")
    }

    document.isDeleted = false
    await document.save()
    

    res.status(200)
    .json(new Apiresponse(200,"Document Restored Successfully",document))
})

export const cancelrequest = asynchandler(async(req,res)=>{
   const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false,teamid:req.user.teamid})
    if(!document){
        throw new Apierror(404,"Document not Found")
    }

    const requests = await signrequest.find({documentId:id})

   const task =  requests.map(async(request)=>{
    request.overallStatus="cancelled"
    await request.save()
   })
   await Promise.all(task);

   res.status(200)
   .json(new Apiresponse(200,"Requests Cancelled Successfully"))
})

export const getdocPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
        if (!id) {
            throw new Apierror(
                400,
                "Signer token is required"
            );
        }
    
        const hashedToken = crypto
            .createHash("sha256")
            .update(id)
            .digest("hex");

            console.log(hashedToken)
    
        const request = await signrequest
            .findOne({
                signerToken: hashedToken
            })
    
        if (!request) {
            throw new Apierror(
                404,
                "Invalid signing request"
            );
        }
    const document = await doc.findById(request.documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.driveFileId?.fileId) {
      return res.status(404).json({
        success: false,
        message: "Drive file not found for this document",
      });
    }

    const created = await user.findById(document.createdBy);

    if (!created || created.deleted === true) {
      return res.status(404).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    let driveuser;

    if (created.role === "Admin") {
      driveuser = created._id;
    } else {
      const team1 = await team.findById(created.teamid);

      if (!team1) {
        return res.status(404).json({
          success: false,
          message: "Team not found",
        });
      }

      driveuser = team1.owner;
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
        fileId: document.driveFileId.fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.driveFileId.fileName || "document.pdf"}"`
    );

    response.data.on("error", (err) => {
      console.error("Google Drive stream error:", err);
    });

    response.data.pipe(res);

  } catch (err) {
    console.error("getdocPdf error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};
export const getinternaldocPdf = async (req, res) => {
  try {
    const { id } = req.params;
    
        if (!id) {
            throw new Apierror(
                400,
                "Document id is required"
            );
        }
    const document = await doc.findOne({_id:id,teamid:req.user.teamid});

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.driveFileId?.fileId) {
      return res.status(404).json({
        success: false,
        message: "Drive file not found for this document",
      });
    }

    const created = await user.findById(document.createdBy);

    if (!created || created.deleted === true) {
      return res.status(404).json({
        success: false,
        message: "User not found or deleted",
      });
    }

    let driveuser;

    if (created.role === "Admin") {
      driveuser = created._id;
    } else {
      const team1 = await team.findById(created.teamid);

      if (!team1) {
        return res.status(404).json({
          success: false,
          message: "Team not found",
        });
      }

      driveuser = team1.owner;
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
        fileId: document.driveFileId.fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${document.driveFileId.fileName || "document.pdf"}"`
    );

    response.data.on("error", (err) => {
      console.error("Google Drive stream error:", err);
    });

    response.data.pipe(res);

  } catch (err) {
    console.error("getdocPdf error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
};