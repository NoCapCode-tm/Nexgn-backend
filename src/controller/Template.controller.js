import { template } from "../models/Template.js";
import { templatewidget } from "../models/TemplateWidgets.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";
import { uploadFileToDrive } from "../utils/uploadfiletodrive.utils.js";


export const createtemplate = asynchandler(async(req,res)=>{
   const body = req.body || {};

const {
  title,
  content,
  role,
  widget,
  note
} = body;

    if( !role ||!widget || widget.length === 0){
        throw new Apierror(400,"Please fill all the required fields")
    }

    let temple;
    let driveLink = null;
    if(req.file){
        const uploadedFile = await uploadFileToDrive(req.user._id,req.file);
        driveLink = uploadedFile.fileId; // ya uploadedFile.webViewLink
        temple = await template.create({
          name:title,
          fileid:driveLink,
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

    res.status(200)
    .json(new Apiresponse(200,"Template created Successfully",temple))

})

export const gettemplate = asynchandler(async(req,res)=>{
    const temple = await templatewidget.find().populate({
    path: "templateid",
    populate: {
      path: "createdby",
      select: "name", // choose the fields you want
    },
  });;

    if(!temple){
      throw new Apierror(404,"No Template Found")
    }

    res.status(200)
    .json(new Apiresponse(200,"Templates Fetched Successfully",temple))
})

export const deletetemplate = asynchandler(async(req,res)=>{
    const {id}= req.params

    if(!id){
        throw new Apierror(400,"Id not Found")
    }

    await template.findByIdAndDelete(id)

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