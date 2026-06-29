import { template } from "../models/Template";
import { templatewidget } from "../models/TemplateWidgets";
import { Apierror } from "../utils/Apierror.utils";
import { Apiresponse } from "../utils/Apiresponse.utils";
import { asynchandler } from "../utils/Asynchandler.utils";


export const createtemplate = asynchandler(async(req,res)=>{
    const{title ,content, drivelink , role,widget} = req.body

    if(!title || !role ||!widget || widget.length === 0){
        throw new Apierror(400,"Please fill all the required fields")
    }

    let temple;
    if(drivelink){
        temple = await template.create({
          name:title,
          fileid:drivelink,
          createdby:req.user._id
    })
    }else{
        temple = await template.create({
          name:title,
          htmlcontent:content,
          createdby:req.user._id
    })
    }

    const templatewidgets = await templatewidget.create({
        role,
        templateid:temple._id,
        widget
    })

    res.status(200)
    .json(new Apiresponse(200,"Template created Successfully",temple))

})

export const gettemplate = asynchandler(async(req,res)=>{
    const temple = await template.find();

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