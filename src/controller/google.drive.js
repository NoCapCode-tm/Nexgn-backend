
import oauth2client from "../config/drive.config.js";
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

const { tokens } = await oauth2client.getToken(code);

await googledrive.findOneAndUpdate(

    {
        userId: state
    },

    {
        refreshToken: tokens.refresh_token,
        connected: true
    },

    {
        upsert: true,
        new: true
    }

);
    
        res.status(200)
        .redirect("http://localhost:5174/settings?drive=connected");
    } catch (error) {
        console.log("Something went wrong",error.message)
    }
})

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

    res.json(

        new Apiresponse(

            200,

            "Disconnected"

        )

    );

});

