
import oauth2client from "../config/drive.config.js";
import { activitylog } from "../models/ActivityLog.js";
import { googledrive } from "../models/GoogleDrive.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";


export const getAuthurl = asynchandler(async (req, res) => {

    const url = oauth2client.generateAuthUrl({

        access_type: "offline",

        prompt: "consent",

        state: req.user._id.toString(),

        scope: [
            "https://www.googleapis.com/auth/drive.file"
        ]

    });

    res.json(new Apiresponse(200,"URL GENERATED",url));

});

export const AuthCallback = asynchandler(async (req, res) => {
  try {
    const { code, state } = req.query;
    const user = req.user;

    const { tokens } = await oauth2client.getToken(code);

    const drive = await googledrive.findOneAndUpdate(
      { userId: user._id },
      {
        refreshToken: tokens.refresh_token,
        connected: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (drive.connected === true) {
      await activitylog.create({
        userId: user._id,
        action: "Google Drive Connected",
        status: "Success",
      });
    } else {
      await activitylog.create({
        userId: user._id,
        action: "Google Drive Connection Failed",
        status: "Failure",
      });
    }

    return res
      .status(200)
      .json(new Apiresponse(200, "Google Drive Connected Successfully", drive));
  } catch (error) {
    console.error("Google Drive Auth Callback Error:", error.message);
    throw new Apierror(500, error.message || "Failed to authenticate Google Drive");
  }
});

export const driveStatus = asynchandler(async(req,res)=>{

     let driveuser;
   if(req.user.role==="Admin"){
    driveuser = req.user._id
   }else{
    driveuser = req.user.addedby
   }
    const drive = await googledrive.findOne({

        userId:driveuser

    });

    res.json(

        new Apiresponse(

            200,

            "Status",

            {

                connected: !!drive?.connected

            }

        )

    );

});

export const disconnectDrive = asynchandler(async(req,res)=>{

    await googledrive.deleteOne({

        userId:req.user._id

    });

    const activity = await activitylog.create({
             userId:req.user._id,
             action:"Google Drive Disconnected",
             status:"Success"
         })

    res.json(

        new Apiresponse(

            200,

            "Disconnected"

        )

    );

});

