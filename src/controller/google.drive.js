
import oauth2client from "../config/drive.config.js";
import { googledrive } from "../models/GoogleDrive.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";



export const getAuthurl = asynchandler(async(req,res)=>{
    try {
        const url = oauth2client.generateAuthUrl({
            access_type:"offline",
            prompt:"consent",
            scope:[
                 "https://www.googleapis.com/auth/drive.file"
            ]
        })

        res.status(200)
        .json(new Apiresponse(200,"URL GENERATED",url))
    } catch (error) {
        console.log("Something went wrong",error)
    }
})

export const AuthCallback = asynchandler(async(req,res)=>{
    try {
        const {code} = req.query
    
        const {tokens} = await oauth2client.getToken(code)
        await googledrive.findOneAndUpdate(
  {
    userId:req.user._id
  },
  {
    refreshToken:tokens.refresh_token,
    // folderId:folder.data.id,
    connected:true
  },
  {
    upsert:true,
    new:true
  }
);
    
        res.status(200)
        .json(new Apiresponse(200,"Token sent Successfully",tokens))
    } catch (error) {
        console.log("Something went wrong",error.message)
    }
})