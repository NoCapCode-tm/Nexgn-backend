import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller.js";
import { disapprove, getrequest, signrequests, statuschange, submitdoc } from "../controller/signed.controller.js";

export const signrouter = Router();

//post apis
signrouter.route("/statuschange").post(statuschange)
signrouter.route("/requestsubmit").post(submitdoc)

//get apis
signrouter.route("/getrequest/:id").get(getrequest)
signrouter.route("/getrequests").get(verifyjwt,signrequests)
signrouter.route("/reject/:id").get(disapprove)
