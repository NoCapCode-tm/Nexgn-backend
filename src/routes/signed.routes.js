import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller.js";
import { disapprove, getrequest, getsignature, requestcancel, requestdelete, signrequests, statuschange, submitdoc } from "../controller/signed.controller.js";
import { checkpermission } from "../middleware/permission.middleware.js";

export const signrouter = Router();

//post apis
signrouter.route("/statuschange").post(statuschange)//secured
signrouter.route("/requestsubmit").post(submitdoc)//secured

//get apis
signrouter.route("/getrequest/:id").get(getrequest)//secured
signrouter.route("/getrequests").get(verifyjwt,signrequests)//already secured
signrouter.route("/getsignature").get(verifyjwt,getsignature)//alreay scured
signrouter.route("/reject/:id").get(disapprove)//sexured
signrouter.route("/requestcancel/:id").get(verifyjwt,checkpermission("Documents-Cancel Requests"),requestcancel)//secured
signrouter.route("/requestdelete/:id").get(verifyjwt,requestdelete)//secured


