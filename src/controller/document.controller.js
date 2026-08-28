import { Resend } from "resend";
import { doc } from "../models/Document.js";
import { documentfield } from "../models/DocumentField.js";
import { signrequest } from "../models/SignatureRequest.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { activitylog } from "../models/ActivityLog.js";



export const createdocument = asynchandler(async(req,res)=>{
    const { title, drivefileid , templateid , applicants , documentwidgets ,expiry ,note,senderip} = req.body


  if(!title || !applicants ||!senderip){
        throw new Apierror(400,"Please fill all the required fields")
         const activity = await activitylog.create({
             userId:req.user._id,
             action:"Document Creation Failed",
             status:"Failure"
         })
    }

      let document;
        if(drivefileid){
            document = await doc.create({
              title,
              driveFileId:drivefileid,
              createdBy:req.user._id,
              status:"draft",
              assignedto:applicants,
              note:note,
           })

           const docwidget = await documentfield.create({
             documentId:document._id,
             widget: documentwidgets
           })

        }else{
            document = await doc.create({
              title,
              templateId:templateid,
              createdBy:req.user._id,
              status:"draft",
              assignedto:applicants,
              note:note
           })
        }
        const expiresAt = new Date();

expiresAt.setDate(
    expiresAt.getDate() + Number(expiry)
);
       
        
        const tasks = applicants.map(async (signee) => {

    let member = await user.findOne({
        email: signee.email
    });

    if (!member) {
        member = await user.create({
            name: signee.name,
            email: signee.email,
            role: "Member",
            addedby:req.user._id,
            password: `Nexgn-${signee.name}-${signee.email}`
        });
    }

    const signature = await signrequest.create({
        documentId: document._id,
        senderId: document.createdBy,
        senderip:senderip,
        expiresat: expiresAt,
        recipient: {
            userId: member._id
        },
        overallStatus: "pending"
    });

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    
    await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: signee.email,
        subject: "Your DOC is Ready to be Signed",
        html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>Nexgn</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f7fa;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
      }
      table {
        border-spacing: 0;
        border-collapse: collapse;
      }
      img {
        border: 0;
        display: block;
        max-width: 100%;
      }
      .wrapper {
        width: 100%;
        background-color: #f5f7fa;
        padding: 40px 0;
      }
      .container {
        width: 100%;
        max-width: 640px;
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
      }
      .header {
        padding: 28px 32px 20px;
        text-align: center;
        border-bottom: 1px solid #e5e7eb;
      }
      .logo {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: #16a34a;
      }
      .content {
        padding: 32px;
      }
      .headline {
        font-size: 24px;
        line-height: 1.3;
        font-weight: 700;
        margin: 0 0 16px;
        color: #111827;
      }
      .body-text {
        font-size: 16px;
        line-height: 1.7;
        margin: 0 0 16px;
        color: #374151;
      }
      .cta-wrap {
        padding: 12px 0 8px;
        text-align: center;
      }
      .cta {
        display: inline-block;
        background-color: #16a34a;
        color: #ffffff !important;
        text-decoration: none;
        font-size: 16px;
        font-weight: 700;
        padding: 14px 24px;
        border-radius: 10px;
      }
      .small-note {
        font-size: 13px;
        line-height: 1.6;
        color: #6b7280;
        margin-top: 16px;
      }
      .divider {
        height: 1px;
        background-color: #e5e7eb;
        margin: 24px 0;
      }
      .footer {
        padding: 24px 32px 32px;
        font-size: 13px;
        line-height: 1.6;
        color: #6b7280;
        text-align: center;
        background-color: #fafafa;
      }
      .footer a {
        color: #16a34a;
        text-decoration: none;
      }
      @media screen and (max-width: 640px) {
        .content,
        .header,
        .footer {
          padding-left: 20px !important;
          padding-right: 20px !important;
        }
        .headline {
          font-size: 22px;
        }
        .body-text {
          font-size: 15px;
        }
        .cta {
          display: block;
          width: 100%;
          box-sizing: border-box;
        }
      }
    </style>
  </head>
  <body>
    <table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table class="container" width="640" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td class="header">
                <div class="logo">Nexgn</div>
              </td>
            </tr>

            <tr>
              <td class="content">
                <h1 class="headline">Welcome to Nexgn</h1>

                <p class="body-text">
                  Hi ${signee.name},
                </p>

                <p class="body-text">
                  We are glad to have you on board. Nexgn is built to make digital document signing simple, secure, and reliable for your business.
                </p>

                <p class="body-text">
                  To get started, please use the button below to continue:
                </p>

                <div class="cta-wrap">
                  <a class="cta" href="https://sign.nexgn.cloud/document/${signature._id}" target="_blank">Sign Doc</a>
                </div>

                <div class="divider"></div>

                <p class="small-note">
                  If you have any questions, please reply to this email or contact our support team.
                </p>
              </td>
            </tr>

            <tr>
              <td class="footer">
                <p style="margin:0 0 8px;">NoCapCode | Owner of Nexgn</p>
                <p style="margin:0 0 8px;">
                  <a href="https://nexgn.cloud" target="_blank">nexgn.com</a>
                </p>
                <p style="margin:0;">This is an automated message. Please do not share confidential access links.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
     `
    });

});

await Promise.all(tasks);
        

        document.status = "sent";
        await document.save()

        const activity = await activitylog.create({
                    userId:req.user._id,
                    refId:document._id,
                    refModel: "doc",
                    action:"Document Created Successfully",
                    status:"Success"
                })

        res.status(200)
        .json(new Apiresponse(200,"Document Created Successfully",document))
})

export const getdocument = asynchandler(async(req,res)=>{
  const admin = req.user 

    const documents = await doc.find()
  .populate("createdBy")
  .populate("templateId");

    if(!documents){
      throw new Apierror(404,"No Template Found")
    }

    const filtereddoc = documents.filter(
  (d) => (d.createdBy?._id?.toString() === admin._id.toString() || d.createdBy?._id?.toString() === admin.addedby.toString()) && d.isDeleted === false
);


    res.status(200)
    .json(new Apiresponse(200,"Documents Fetched Successfully",filtereddoc))
})

export const deletedocument = asynchandler(async(req,res)=>{
    const {id}= req.params
    const user = req.user

    if(!id){
        throw new Apierror(400,"Id not Found")
         const activity = await activitylog.create({
             userId:user._id,
             refId:id,
             refModel: "doc",
             action:"Document deletion Failed",
             status:"Failure"
         })
    }

    await doc.findByIdAndDelete(id)

    const activity = await activitylog.create({
                    userId:user._id,
                    refId:id,
                    refModel: "doc",
                    action:"Document deleted Successfully",
                    status:"Success"
                })

    res.status(200)
    .json(new Apiresponse(200,"Template Deleted Successfully",[]))
})

export const getsingledocument = asynchandler(async(req,res)=>{
     const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false})
    if(!document){
        throw new Apierror(404,"Template not Found")
    }
    

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",document))
})

export const movetobin = asynchandler(async(req,res)=>{
   const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false})
    if(!document){
        throw new Apierror(404,"Document not Found")
    }

    document.isDeleted = true
    await document.save()
    

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",document))
})

export const cancelrequest = asynchandler(async(req,res)=>{
   const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findOne({_id:id,isDeleted:false})
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