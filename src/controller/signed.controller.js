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
    ipv6,
  } = req.body;



  if (!sign || !ipv4 || !ipv6 || !Array.isArray(widget)) {
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


  const request = await signrequest.findById(sign);

  if (!request) {
    throw new Apierror(
      404,
      "No Request Found"
    );
  }


  if (request.overallStatus === "completed") {
    throw new Apierror(
      400,
      "Already signed"
    );
  }



  const document = await doc.findById(
    request.documentId
  );

  if (!document) {
    throw new Apierror(
      404,
      "No Document Found"
    );
  }


  const sender = await user.findById(
    request.senderId
  );

  if (!sender) {
    throw new Apierror(
      404,
      "Document sender not found"
    );
  }



  const receiver = await user.findById(
    request.recipient.userId
  );

  if (!receiver) {
    throw new Apierror(
      404,
      "Signer not found"
    );
  }



  request.overallStatus = "completed";
  request.recipient.signedAt = new Date();

  await request.save();


  // ----------------------------------------
  // 7. Get all requests for document
  // ----------------------------------------

  const requests = await signrequest.find({
    documentId: request.documentId,
  });

  if (requests.length === 0) {
    throw new Apierror(
      404,
      "No Requests Found"
    );
  }


  // ----------------------------------------
  // 8. Update document status
  // ----------------------------------------

  const total = requests.length;

  const complete = requests.filter(
    (rs) =>
      rs.overallStatus === "completed"
  ).length;


  if (complete === total) {
    document.status = "completed";
  } else if (complete > 0) {
    document.status = "partially_signed";
  } else {
    document.status = "sent";
  }

  await document.save();



  const generatedCertificateId =
    `NXG-CERT-${Date.now()}`;



  const certificateRecord =
    await certificate.create({
      certificateId:
        generatedCertificateId,

      documentId:
        document._id,

      documentName:
        document.title,

      generatedAt:
        new Date(),
    });



  const signed =
    await signature.create({
      requestId: sign,

      certificateId:
        certificateRecord._id,

      ipv4,

      ipv6,

      widget,
    });


  const signatureWidget =
    widget.find(
      (item) =>
        item.widgetname === "signature"
    );


  const signatureImage =
    signatureWidget?.value || null;



  const html =
    certificateTemplate({

      certificateId:
        generatedCertificateId,

      documentId:
        document._id.toString(),

      documentName:
        document.title,

      documentHash:
        "YOUR_SHA256_HASH",

      organizationName:
        sender?.professional_details?.company_name ||
        "Nexgn",

      createdOn:
        formatDate(document.createdAt),

      completedOn:
        formatDate(
          request.recipient.signedAt
        ),

      totalSigners: 1,

      originatorName:
        sender?.name || "N/A",

      originatorEmail:
        sender?.email || "N/A",

      originatorIp:
        request.senderip || "N/A",

      signers: [
        {
          name:
            receiver?.name || "N/A",

          email:
            receiver?.email || "N/A",

          signedAt:
            formatDate(
              request.recipient.signedAt
            ),

          ipv4:
            ipv4 || "N/A",

          ipv6:
            ipv6 || "N/A",

          signatureImage,
        },
      ],
    });



  const pdfBuffer =
    await generateCertificatePDF(html);



  const driveUpload =
    await uploadCertificateToDrive(
      request.senderId,
      pdfBuffer,
      `${generatedCertificateId}.pdf`
    );

  if (!driveUpload) {
    throw new Apierror(
      400,
      "Sender has not connected Google Drive"
    );
  }

  certificateRecord.pdfUrl =
    driveUpload.downloadLink;

  certificateRecord.documentHash =
    "HASH";

  await certificateRecord.save();

  const resend =
    new Resend(
      process.env.RESEND_API_KEY
    );


  const emailhtml =
    await renderSignature({

      recipientName:
        receiver?.name,

      documentName:
        document.title,

      signers: [
        {
          name:
            receiver?.name,
        },
      ],

      downloadCertificateUrl:
        driveUpload.downloadLink,

      certificateId:
        generatedCertificateId,

      signedAt:
        formatDate(
          request.recipient.signedAt
        ),

      documentHash:
        "HASH",
    });

  await resend.emails.send({

    from:
      `Nexgn <${process.env.SMTP_USER}>`,

    to:
      receiver.email,

    subject:
      "Your document has been signed and certified",

    html:
      emailhtml,
  });

  return res
    .status(200)
    .json(
      new Apiresponse(
        200,
        "Document Signed Successfully",
        signed
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