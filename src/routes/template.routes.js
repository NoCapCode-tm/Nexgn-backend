import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { archivetemplate, createtemplate, deletetemplate, getexternalTemplatePdf, getsingletemplate, gettemplate, getTemplatePdf, restorefrombin } from "../controller/Template.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { checkpermission } from "../middleware/permission.middleware.js";

export const templaterouter = Router();

//post apis
templaterouter.post("/create",verifyjwt,checkpermission("Templates-Create"),upload.single("file"),createtemplate);//secured

//delete apis
templaterouter.route("/deletetemplate/:id").delete(verifyjwt,checkpermission("Templates-Delete"),deletetemplate)//secured
templaterouter.route("/archivetemplate/:id").post(verifyjwt,checkpermission("Templates-Archive"),archivetemplate)//secured
templaterouter.route("/restore/:id").get(verifyjwt,checkpermission("Templates-Restore"),restorefrombin)//secured

//get apis
templaterouter.route("/template/:id").get(verifyjwt,getsingletemplate)//secured
templaterouter.route("/gettemplate").get(verifyjwt,checkpermission("Templates-View"),gettemplate)//secured
templaterouter.get("/template/:id/pdf", verifyjwt,getTemplatePdf);//secured
templaterouter.get("/external/:id/pdf",getexternalTemplatePdf);//secured