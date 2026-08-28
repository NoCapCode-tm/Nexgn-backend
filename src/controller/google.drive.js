
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

export const AuthCallback = asynchandler(async(req,res)=>{
    try {
        const { code, state } = req.query;
        // 'state' contains the user's _id that we passed during getAuthurl

        const { tokens } = await oauth2client.getToken(code);

        const drive = await googledrive.findOneAndUpdate(
            { userId: state },
            {
                refreshToken: tokens.refresh_token,
                connected: true
            },
            {
                upsert: true,
                new: true
            }
        );

        if(drive.connected === true){
            await activitylog.create({
                userId: state, // Use 'state' here instead of user._id
                action: "Google Drive Connected",
                status: "Success"
            });
        } else {
            await activitylog.create({
                userId: state, // Use 'state' here instead of user._id
                action: "Google Drive Connection Failed",
                status: "Failure"
            });
        }
    
        res.status(200).redirect("https://sign.nexgn.cloud/settings?drive=connected");
        
    } catch (error) {
        console.log("OAuth Callback Error:", error.message);
        res.status(500).send("Internal Server Error during Google Auth");
    }
});


export const driveStatus = asynchandler(async(req,res)=>{

    const drive = await googledrive.findOne({

        userId:req.user._id

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

