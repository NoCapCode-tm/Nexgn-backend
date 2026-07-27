import { doc } from "../models/Document.js";
import { signature } from "../models/Signature.js";
import { signrequest } from "../models/SignatureRequest.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";




export const submitdoc = asynchandler(async(req,res)=>{
    const {sign,widget,ip} = req.body;

    if(!sign || !ip || !widget){
        throw new Apierror(400,"Please fill all the required fields")
    }

    const request = await signrequest.findById(sign)
    if(!request){
        throw new Apierror(400,"No Request Find")
    }
    
    if(request.status==="completed"){
    throw new Apierror(400,"Already signed");
}
    request.status = "completed"
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
    let complete=0
    let incomplete=0
    for(let rs of requests){
        if(rs.status === "completed"){
             complete++;
        }else{
          incomplete++;
        }
    }

    const percent = (complete / total)*100;
    if(percent === 100){
       document.status = "signed"
    }else if(percent > 0){
        document.status="partially_signed"
    }else{
        document.status="sent"
    }
    await document.save();

    const signed = await signature.create({
        ip :req.ip,
        widget,
        requestId:sign
    })

    res.status(200)
    .json(new Apiresponse(200,"Document Signed Successfully",signed))
})

export const getrequest = asynchandler(async(req,res)=>{
    const {id}= req.params
    if(!id){
        throw new Apierror(400,"Please fill the requestid")
    }

    const request = await signrequest.findById(id)
    if(!request){
        throw new Apierror(400,"No Request Find")
    }

    request.status = "Viewed"
    await request.save()

    res.status(200)
    .json(new Apiresponse(200,"Request Fetched Successfully",request))


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

    request.status = "cancelled"
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