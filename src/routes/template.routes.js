import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller";
import { verifyjwt } from "../middleware/auth.middleware";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller";

export const templaterouter = Router();

templaterouter.route("/create").post(createtemplate)
templaterouter.route("/gettemplate").get(gettemplate)
templaterouter.route("/deletetemplate/:id").delete(deletetemplate)
templaterouter.route("/template/:id").get(getsingletemplate)