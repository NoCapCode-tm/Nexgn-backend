import { user } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.utils.js";
import { Apiresponse } from "../utils/Apiresponse.utils.js";
import { asynchandler } from "../utils/Asynchandler.utils.js";

export const checkpermission = (requiredPermission) =>
    asynchandler(async (req, res, next) => {

        const admin = await user.findById(req.user._id);

        if (!admin) {
            throw new Apierror(
                401,
                "User Not Authorized"
            );
        }

        const hasPermission =
            admin.permissions?.includes(
                requiredPermission
            );

        if (!hasPermission) {
            throw new Apiresponse(
                403,
                "You do not have permission to perform this action",[]
            );
        }

        return next();
    });