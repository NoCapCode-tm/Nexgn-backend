import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate, getTemplatePdf } from "../controller/Template.controller.js";
import { upload } from "../middleware/multer.middleware.js";

export const templaterouter = Router();

//post apis
templaterouter.post("/create",verifyjwt,upload.single("file"),createtemplate);

//delete apis
templaterouter.route("/deletetemplate/:id").delete(verifyjwt,deletetemplate)

//get apis
templaterouter.route("/template/:id").get(getsingletemplate)
templaterouter.route("/gettemplate").get(verifyjwt,gettemplate)
templaterouter.get("/template/:id/pdf", getTemplatePdf);