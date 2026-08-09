import {Router} from "express"
import { verifyjwt } from "../middleware/auth.middleware.js";
import { deleteactivity, getAuditlog } from "../controller/Activitylog.controller.js";

export const activityrouter = Router();

activityrouter.route("/getactivity").get(verifyjwt,getAuditlog)
activityrouter.route("/deleteactivity").delete(verifyjwt,deleteactivity)


