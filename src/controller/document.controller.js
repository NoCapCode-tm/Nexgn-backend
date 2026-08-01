import { Resend } from "resend";
import { doc } from "../models/Document.js";
import { documentfield } from "../models/DocumentField.js";
import { signrequest } from "../models/SignatureRequest.js";
import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";



export const createdocument = asynchandler(async(req,res)=>{
    const { title, drivefileid , templateid , applicants , documentwidgets ,expiry} = req.body

    if(!title || !applicants){
        throw new Apierror(400,"Please fill all the required fields")
    }

      let document;
        if(drivefileid){
            document = await doc.create({
              title,
              driveFileId:drivefileid,
              createdBy:req.user._id,
              status:"draft",
              assignedto:applicants
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
              assignedto:applicants
           })
        }
       
        
        const tasks = applicants.map(async (signee) => {

    let member = await user.findOne({
        email: signee.email
    });

    if (!member) {
        member = await user.create({
            name: signee.name,
            email: signee.email,
            role: "Member",
            password: `Nexgn-${signee.name}-${signee.email}`
        });
    }

    const signature = await signrequest.create({
        documentId: document._id,
        senderId: document.createdBy,
        expiresat: expiry,
        recipient: {
            userId: member._id
        },
        overallStatus: "pending"
    });

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: `Nexgn <${process.env.SMTP_USER}>`,
        to: [member.email],
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
                  Hi ${member.name},
                </p>

                <p class="body-text">
                  We are glad to have you on board. Nexgn is built to make digital document signing simple, secure, and reliable for your business.
                </p>

                <p class="body-text">
                  To get started, please use the button below to continue:
                </p>

                <div class="cta-wrap">
                  <a class="cta" href="http://localhost:5173/document/${signature._id}" target="_blank">Sign Doc</a>
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

        res.status(200)
        .json(new Apiresponse(200,"Document Created Successfully",document))
})

export const getdocument = asynchandler(async(req,res)=>{
    const documents = await doc.find()
  .populate("createdBy")
  .populate("templateId");

    if(!documents){
      throw new Apierror(404,"No Template Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Templates Fetched Successfully",documents))
})

export const deletedocument = asynchandler(async(req,res)=>{
    const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }

    await doc.findByIdAndDelete(id)

    res.status(200)
    .json(new Apiresponse(200,"Template Deleted Successfully",[]))
})

export const getsingledocument = asynchandler(async(req,res)=>{
     const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }
    const document = await doc.findById(id)
    if(!document){
        throw new Apierror(404,"Template not Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Template Fetched Successfully",document))
})