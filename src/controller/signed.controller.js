import { Resend } from "resend";
import { doc } from "../models/Document.js";
import { documentfield } from "../models/DocumentField.js";
import { signature } from "../models/Signature.js";
import { signrequest } from "../models/SignatureRequest.js";
import { templatewidget } from "../models/TemplateWidgets.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { renderSignature } from "../emails/renderEmail.jsx";
import { certificate } from "../models/Certificate.models.js";
import { user } from "../models/user.models.js";
import { generateCertificatePDF } from "../utils/generateCertificatePDF.js";
import { uploadCertificateToDrive } from "../utils/uploadfiletodrive.utils.js";
import { certificateTemplate } from "../emails/certificateTemplate.js";
import { generateSignedDocumentPDF } from "../utils/generateSignedDocumentPDF.js.js";
import crypto from "crypto";
import { downloadFileFromDrive } from "../utils/downloadFileFromDrive.js";



export const statuschange = asynchandler(async(req,res)=>{
    const {id} = req.body

    if(!id){
        throw new Apierror(400,"Please fill all the reuired fields")
    }

    const request = await signrequest.findById(id)

    if(!request){
        throw new Apierror(404,"Request not found")
    }

    request.overallStatus = "Viewed"
    request.save()

    res.status(200)
    .json(new Apiresponse(200,"Status changes Successfully",[]))
})

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};


export const submitdoc = asynchandler(async (req, res) => {
    const {
        sign,
        widget,
        ipv4,
        ipv6
    } = req.body;

    if (
        !sign ||
        !ipv4 ||
        !ipv6 ||
        !Array.isArray(widget)
    ) {
        throw new Apierror(
            400,
            "Please fill all the required fields"
        );
    }

    if (widget.length === 0) {
        throw new Apierror(
            400,
            "Please provide document widgets"
        );
    }

    const request = await signrequest
        .findById(sign)
        .populate("documentId")
        .populate({
            path: "senderId",
            select: "-password -twoFAsecret"
        })
        .populate({
            path: "recipient.userId",
            select: "-password -twoFAsecret"
        });

    if (!request) {
        throw new Apierror(
            404,
            "No Request Found"
        );
    }

    if (
        request.overallStatus === "completed"
    ) {
        throw new Apierror(
            400,
            "Already signed"
        );
    }

    if (
        request.overallStatus === "Expired"
    ) {
        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (
        request.expiresat &&
        Date.now() >=
            request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";

        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    const document =
        await doc.findById(
            request.documentId._id
        ).populate("templateId");

    if (!document) {
        throw new Apierror(
            404,
            "No Document Found"
        );
    }

    const sender =
        request.senderId;

    if (!sender) {
        throw new Apierror(
            404,
            "Document sender not found"
        );
    }

    const receiver =
        request.recipient.userId;

    if (!receiver) {
        throw new Apierror(
            404,
            "Signer not found"
        );
    }

    const widgetDefinitions =
        document.driveFileId
            ? (
                await documentfield.findOne({
                    documentId:
                        document._id
                }).lean()
            )?.widget || []
            : (
                await templatewidget.findOne({
                    templateid:
                        document.templateId._id
                }).lean()
            )?.widget || [];

    if (
        widgetDefinitions.length === 0
    ) {
        throw new Apierror(
            400,
            "No document widgets found"
        );
    }

    const signedWidgets =
        widgetDefinitions.map(
            (definition, index) => {

                const submitted =
                    widget.find(
                        item =>
                            item.index === index
                    );

                return {
                    index,

                    widgetname:
                        definition.widgetname,

                    page:
                        definition.page,

                    x:
                        definition.x,

                    y:
                        definition.y,

                    width:
                        definition.width,

                    height:
                        definition.height,

                    value:
                        submitted?.value || ""
                };
            }
        );

    const existingSignature =
        await signature.findOne({
            requestId:
                request._id
        });

    if (existingSignature) {
        throw new Apierror(
            400,
            "Signature already submitted"
        );
    }

    const signatureRecord =
        await signature.create({
            requestId:
                request._id,

            ipv4,

            ipv6,

            widget:
                signedWidgets
        });

    const driveFileId =
        document.driveFileId ||
        document.templateId?.file?.fileId;

    if (!driveFileId) {
        throw new Apierror(
            400,
            "Original PDF not found"
        );
    }
let driveuser;
   if(request.senderId.role==="Admin"){
    driveuser = request.senderId._id
   }else{
    driveuser = request.senderId.addedby
   }
    const originalPdfBuffer =
        await downloadFileFromDrive(
            driveuser,
            driveFileId
        );

    if (!originalPdfBuffer) {
        throw new Apierror(
            400,
            "Unable to download original document"
        );
    }

    const signedPdfBuffer =
        await generateSignedDocumentPDF({
            pdfBuffer:
                originalPdfBuffer,

            widgets:
                signedWidgets
        });

    if (!signedPdfBuffer) {
        throw new Apierror(
            400,
            "Unable to generate signed document"
        );
    }

    const signedDocumentHash =
        crypto
            .createHash("sha256")
            .update(signedPdfBuffer)
            .digest("hex");

    const signedDriveUpload =
        await uploadCertificateToDrive(
            driveuser,
            signedPdfBuffer,
            `${document.title}-signed.pdf`
        );

    if (!signedDriveUpload) {
        throw new Apierror(
            400,
            "Unable to upload signed document"
        );
    }

    document.signedFileId =
        signedDriveUpload.fileId || null;

    document.signedDownloadLink =
        signedDriveUpload.downloadLink ||
        null;

    document.signedWebViewLink =
        signedDriveUpload.webViewLink ||
        null;

    await document.save();

    const signedAt =
        new Date();

    request.overallStatus =
        "completed";

    request.recipient.signedAt =
        signedAt;

    await request.save();

    const generatedCertificateId =
        `NXG-CERT-${Date.now()}`;

    const signatureWidget =
        signedWidgets.find(
            item =>
                item.widgetname ===
                "signature"
        );

    const signatureImage =
        signatureWidget?.value || null;

    const certificateHtml =
        certificateTemplate({
            certificateId:
                generatedCertificateId,

            documentId:
                document._id.toString(),

            documentName:
                document.title,

            documentHash:
                signedDocumentHash,

            organizationName:
                sender
                    ?.professional_details
                    ?.company_name ||
                "Nexgn",

            createdOn:
                formatDate(
                    document.createdAt
                ),

            completedOn:
                formatDate(
                    signedAt
                ),

            totalSigners:
                1,

            originatorName:
                sender?.name ||
                "N/A",

            originatorEmail:
                sender?.email ||
                "N/A",

            originatorIp:
                request.senderip ||
                "N/A",

            signers: [
                {
                    name:
                        receiver?.name ||
                        "N/A",

                    email:
                        receiver?.email ||
                        "N/A",

                    signedAt:
                        formatDate(
                            signedAt
                        ),

                    ipv4:
                        ipv4 ||
                        "N/A",

                    ipv6:
                        ipv6 ||
                        "N/A",

                    signatureImage
                }
            ]
        });

    const certificatePdfBuffer =
        await generateCertificatePDF(
            certificateHtml
        );

    const certificateRecord =
        await certificate.create({
            certificateId:
                generatedCertificateId,

            documentId:
                document._id,

            documentName:
                document.title,

            documentHash:
                signedDocumentHash,

            generatedAt:
                signedAt
        });

    const certificateDriveUpload =
        await uploadCertificateToDrive(
            driveuser,
            certificatePdfBuffer,
            `${generatedCertificateId}.pdf`
        );

    if (!certificateDriveUpload) {
        throw new Apierror(
            400,
            "Unable to upload certificate"
        );
    }

    certificateRecord.pdfUrl =
        certificateDriveUpload.downloadLink;

    await certificateRecord.save();

    const resend =
        new Resend(
            process.env.RESEND_API_KEY
        );

    const emailHtml =
        await renderSignature({
            recipientName:
                receiver.name,

            fileName:
                document.title,

            signers: [
                {
                    name:
                        receiver.name
                }
            ],

            pdfUrl:
                signedDriveUpload.downloadLink,

            certificateUrl:
                certificateDriveUpload.downloadLink,

            certificateId:
                generatedCertificateId,

            signedAt:
                formatDate(
                    signedAt
                ),

            documentHash:
                signedDocumentHash
        });

    await resend.emails.send({
        from:
            `Nexgn <${process.env.SMTP_USER}>`,

        to:
            receiver.email,

        subject:
            "Your document has been signed and certified",

        html:
            emailHtml
    });

    const requests =
        await signrequest.find({
            documentId:
                document._id
        });

    const total =
        requests.length;

    const completed =
        requests.filter(
            item =>
                item.overallStatus ===
                "completed"
        ).length;

    if (completed === total) {
        document.status =
            "completed";
    } else {
        document.status =
            "partially_signed";
    }

    await document.save();

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
                "Document Signed Successfully",
                {
                    signature:
                        signatureRecord,

                    signedDocumentUrl:
                        signedDriveUpload
                            .downloadLink,

                    signedDocumentViewUrl:
                        signedDriveUpload
                            .webViewLink,

                    certificateUrl:
                        certificateDriveUpload
                            .downloadLink,

                    certificateId:
                        generatedCertificateId,

                    documentHash:
                        signedDocumentHash,

                    signedAt
                }
            )
        );
});

export const getrequest = asynchandler(async(req,res)=>{
    const {id}= req.params
    if(!id){
        throw new Apierror(400,"Please fill the requestid")
    }

    const request = await signrequest.findById(id).populate([
        {
            path: "documentId",
            populate: {
                path: "templateId",
            },
        },
        {
            path: "senderId",
        },
    ])
    if(!request){
        throw new Apierror(400,"No Request Find")
    }

   if (
    request.expiresAt &&
    Date.now() >= request.expiresAt.getTime()
) {
    request.overallStatus = "Expired";

    await request.save();

    throw new Apierror(
        410,
        "Signature Request Expired"
    );
}

    request.status = "Viewed"
    await request.save()

    res.status(200)
    .json(new Apiresponse(200,"Request Fetched Successfully",request))
})
export const getdocumentwidgets = asynchandler(async(req,res)=>{
    const {id} = req.params // documentId

    const document = await doc.findById(id).populate("templateId")
    if(!document){
        throw new Apierror(404,"Document not Found")
    }

    let widgets = []

    if(document.driveFileId){
        const field = await documentfield.findOne({documentId:document._id})
        widgets = field?.widget || []
    }else if(document.templateId){
        const tw = await templatewidget.findOne({templateid:document.templateId._id})
        widgets = tw?.widget || []
    }

    res.status(200)
    .json(new Apiresponse(200,"Widgets Fetched Successfully",{document,widgets}))
})

export const disapprove = asynchandler(async(req,res)=>{
    const {id}= req.params
    if(!id){
        throw new Apierror(400,"Please fill the requestid")
    }

    const request = await signrequest.findById(id)
    if(!request){
        throw new Apierror(400,"No Request Find")
    }

    request.overallStatus = "cancelled"
    await request.save()

    const document = await doc.findById(request.documentId)
    if(!document){
        throw new Apierror(404,"No Document Found")
    }

    const requests = await signrequest.find({documentId :request.documentId})
    if(!requests){
        throw new Apierror(404,"No Requests Found")
    }

     let total = requests.length
     let reject = 0
      for(let rs of requests){
        if(rs.status === "cancelled"){
             reject++;
        }
    }

    if(reject === total){
        document.status = "cancelled"
        await document.save()
    }
     


     res.status(200)
    .json(new Apiresponse(200,"Request Fetched Successfully",request))
})

export const signrequests = asynchandler(async(req,res)=>{
  const admin = await user.findById(req.user._id)

  if(!admin){
    throw new Apierror(401,"User Not Authorized")
  }

  const request = await signrequest.find({senderId:admin._id})
//   if(request.length<1){
//     throw new Apierror(404,"No Request Found")
//   }

  res.status(200)
  .json(new Apiresponse(200,"Requests Fetched Successfully",request))
})