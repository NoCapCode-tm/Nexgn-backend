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
import { team } from "../models/team.model.js";
import { request } from "http";



export const statuschange = asynchandler(async (req, res) => {
    const { id, token } = req.body;

    if (!id || !token) {
        throw new Apierror(
            400,
            "Request ID and signer token are required"
        );
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const request = await signrequest.findOne({
        _id: id,
        signerToken: hashedToken
    });

    if (!request) {
        throw new Apierror(404, "Request not found");
    }

    if (
        request.expiresat &&
        Date.now() >= request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";
        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (
        request.overallStatus === "completed" ||
        request.overallStatus === "cancelled" ||
        request.overallStatus === "Expired"
    ) {
        throw new Apierror(
            400,
            `Request is already ${request.overallStatus}`
        );
    }

    if (request.overallStatus === "pending") {
        request.overallStatus = "Viewed";
        request.viewcount += 1;
    } else if (request.overallStatus === "Viewed") {
        request.viewcount += 1;
    }

    await request.save();

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "Status changed successfully"
        )
    );
});

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

    const hashedToken = crypto
        .createHash("sha256")
        .update(sign)
        .digest("hex");

    const request = await signrequest
        .findOne({
            signerToken: hashedToken
        })
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
            "Invalid signing request"
        );
    }

    if (
        request.expiresat &&
        Date.now() >= request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";
        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (request.overallStatus === "completed") {
        throw new Apierror(
            400,
            "Already signed"
        );
    }

    if (request.overallStatus === "Expired") {
        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (request.overallStatus === "cancelled") {
        throw new Apierror(
            400,
            "Signature Request has been cancelled"
        );
    }

    const document = await doc
        .findById(request.documentId._id)
        .populate("templateId");

    if (!document) {
        throw new Apierror(
            404,
            "No Document Found"
        );
    }

    const sender = request.senderId;

    if (!sender) {
        throw new Apierror(
            404,
            "Document sender not found"
        );
    }

    const receiver = request.recipient.userId;

    if (!receiver) {
        throw new Apierror(
            404,
            "Signer not found"
        );
    }

    const widgetDefinitions =
        document.templateId === null
            ? (
                await documentfield.findOne({
                    documentId: document._id
                }).lean()
            )?.widget || []
            : (
                await templatewidget.findOne({
                    templateid: document.templateId._id
                }).lean()
            )?.widget || [];

    if (widgetDefinitions.length === 0) {
        throw new Apierror(
            400,
            "No document widgets found"
        );
    }

    const signedWidgets = widgetDefinitions.map(
        (definition, index) => {
            const submitted = widget.find(
                item => item.index === index
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
            requestId: request._id
        });

    if (existingSignature) {
        throw new Apierror(
            400,
            "Signature already submitted"
        );
    }

    const signatureRecord =
        await signature.create({
            requestId: request._id,

            ipv4,
            ipv6,

            widget:
                signedWidgets
        });

    const driveFileId =
        document.driveFileId?.fileId ||
        document.templateId?.file?.fileId;

    if (!driveFileId) {
        throw new Apierror(
            400,
            "Original PDF not found"
        );
    }

    let driveuser;

    if (request.senderId.role === "Admin") {
        driveuser = request.senderId._id;
    } else {
        const team1 = await team.findById(
            request.senderId.teamid
        );

        if (!team1) {
            throw new Apierror(
                404,
                "Sender team not found"
            );
        }

        driveuser = team1.owner;
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

    await document.save();

    const signedAt =
        new Date();

    request.overallStatus =
        "completed";

    request.recipient.signedAt =
        signedAt;

    request.signerToken =
        null;

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

    signatureRecord.certificateId =
        certificateRecord._id;

    await signatureRecord.save();

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

    certificateRecord.signeddoc =
        signedDriveUpload.downloadLink;

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

    request.signerToken = null;
    await request.save()

    await document.save();

    return res
        .status(200)
        .json(
            new Apiresponse(
                200,
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
                },
                "Document Signed Successfully"
            )
        );
});

export const getrequest = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new Apierror(
            400,
            "Request ID and signer token are required"
        );
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");

    const request = await signrequest
        .findOne({
            signerToken: hashedToken
        })
        .populate([
            {
                path: "documentId",
                populate: {
                    path: "templateId"
                }
            },
            {
                path: "senderId",
                select: "-password -twoFAsecret"
            },
            {
                path: "recipient.userId",
                select: "-password -twoFAsecret"
            }
        ]);

    if (!request) {
        throw new Apierror(
            404,
            "Invalid signing request"
        );
    }

    if (
        request.expiresat &&
        Date.now() >= request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";

        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (
        request.overallStatus === "completed" ||
        request.overallStatus === "cancelled" ||
        request.overallStatus === "Expired"
    ) {
        throw new Apierror(
            400,
            `Request is already ${request.overallStatus}`
        );
    }

    if (request.overallStatus === "pending") {
        request.overallStatus = "Viewed";
        request.viewcount += 1;
    } else if (request.overallStatus === "Viewed") {
        request.viewcount += 1;
    }

    await request.save();

    return res.status(200).json(
        new Apiresponse(
            200,
            "Request fetched successfully",
            request
        )
    );
});
export const getdocumentwidgets = asynchandler(async (req, res) => {
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

    const request = await signrequest
        .findOne({
            signerToken: hashedToken
        })
        .populate({
            path: "documentId",
            populate: {
                path: "templateId"
            }
        });

    if (!request) {
        throw new Apierror(
            404,
            "Invalid signing request"
        );
    }


    const document = request.documentId;

    if (!document) {
        throw new Apierror(
            404,
            "Document not found"
        );
    }

    let widgets = [];

    if (document.templateId === null) {
        const field = await documentfield
            .findOne({
                documentId: document._id
            })
            .lean();

        widgets = field?.widget || [];
    } else {
        const tw = await templatewidget
            .findOne({
                templateid: document.templateId._id
            })
            .lean();

        widgets = tw?.widget || [];
    }

    return res.status(200).json(
        new Apiresponse(
            200,
            "Widgets Fetched Successfully",
            {
                document,
                widgets
            },
        )
    );
});
export const getinternaldocumentwidgets = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
        throw new Apierror(
            400,
            "Document id is required"
        );
    }
    
   const document = await doc.findOne({_id:id,teamid:req.user.teamid}).populate("templateId");

    if (!document) {
        throw new Apierror(
            404,
            "Document not found"
        );
    }

    let widgets = [];

    if (document.templateId === null) {
        const field = await documentfield
            .findOne({
                documentId: document._id
            })
            .lean();

        widgets = field?.widget || [];
    } else {
        const tw = await templatewidget
            .findOne({
                templateid: document.templateId._id
            })
            .lean();

        widgets = tw?.widget || [];
    }

    return res.status(200).json(
        new Apiresponse(
            200,
            "Widgets Fetched Successfully",
            {
                document,
                widgets
            },
            
        )
    );
});

export const disapprove = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id || !token) {
        throw new Apierror(
            400,
            "Request ID and signer token are required"
        );
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(id)
        .digest("hex");

    const request = await signrequest.findOne({

        signerToken: hashedToken
    });

    if (!request) {
        throw new Apierror(
            404,
            "Invalid signing request"
        );
    }

    if (
        request.expiresat &&
        Date.now() >= request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";
        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (
        request.overallStatus === "completed" ||
        request.overallStatus === "cancelled"
    ) {
        throw new Apierror(
            400,
            "Request cannot be cancelled"
        );
    }

    request.overallStatus = "cancelled";
    request.signerToken = null;

    await request.save();

    const document = await doc.findById(
        request.documentId
    );

    if (!document) {
        throw new Apierror(
            404,
            "No Document Found"
        );
    }

    const requests = await signrequest.find({
        documentId: request.documentId
    });

    const total = requests.length;

    const rejected = requests.filter(
        rs => rs.overallStatus === "cancelled"
    ).length;

    if (rejected === total) {
        document.status = "cancelled";
        await document.save();
    }

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "Request cancelled successfully"
        )
    );
});

export const signrequests = asynchandler(async (req, res) => {

    const admin = await user.findById(req.user._id);

    if (!admin) {
        throw new Apierror(401, "User Not Authorized");
    }

    const request = await signrequest
        .find()
        .populate("documentId")
        .populate({
            path: "senderId",
            select: "-password -twoFAsecret"
        })
        .populate({
            path: "recipient.userId",
            select: "-password -twoFAsecret"
        });

    const filterrequest = request.filter(
        (r) =>
            r.documentId &&
            r.documentId.teamid &&
            r.documentId.teamid.toString() === req.user.teamid.toString()
    );

    return res.status(200).json(
        new Apiresponse(
            200,
            "Requests Fetched Successfully",
            filterrequest
        )
    );
});
export const getsignature = asynchandler(async(req,res)=>{
    const sign = await signature.find().populate("certificateId")

    // if(sign.length===0){
    //     throw new Apierror(404,"No Signature found in database")
    // }

    res.status(200)
    .json(new Apiresponse(200,"Signature fetched Successfully",sign))
})

export const requestcancel = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id ) {
        throw new Apierror(
            400,
            "Request ID  are required"
        );
    }

    const request = await signrequest.findOne({
      _id:id
    });

    if (!request) {
        throw new Apierror(
            404,
            "Invalid signing request"
        );
    }

    if (
        request.expiresat &&
        Date.now() >= request.expiresat.getTime()
    ) {
        request.overallStatus = "Expired";
        await request.save();

        throw new Apierror(
            410,
            "Signature Request Expired"
        );
    }

    if (
        request.overallStatus === "completed" ||
        request.overallStatus === "cancelled"
    ) {
        throw new Apierror(
            400,
            "Request cannot be cancelled"
        );
    }

    request.overallStatus = "cancelled";
    request.signerToken = null;

    await request.save();

    const document = await doc.findById(
        request.documentId
    );

    if (!document) {
        throw new Apierror(
            404,
            "No Document Found"
        );
    }

    const requests = await signrequest.find({
        documentId: request.documentId
    });

    const total = requests.length;

    const rejected = requests.filter(
        rs => rs.overallStatus === "cancelled"
    ).length;

    if (rejected === total) {
        document.status = "cancelled";
        await document.save();
    }

    return res.status(200).json(
        new Apiresponse(
            200,
            null,
            "Request cancelled successfully"
        )
    );
});
export const requestdelete = asynchandler(async (req, res) => {
    const { id } = req.params;

    if (!id ) {
        throw new Apierror(
            400,
            "Request ID  are required"
        );
    }

     await signrequest.findByIdAndDelete(id)

    return res.status(200).json(
        new Apiresponse(
            200,
            "Request deleted successfully",
            null,
        )
    );
});