import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller";
import { verifyjwt } from "../middleware/auth.middleware";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller";
import { disapprove, getrequest, submitdoc } from "../controller/signed.controller";

export const signrouter = Router();

signrouter.route("/requestsubmit").post(submitdoc)
signrouter.route("/getrequest/:id").get(getrequest)
signrouter.route("/reject/:id").get(disapprove)