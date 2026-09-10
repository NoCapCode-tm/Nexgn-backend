import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { archivetemplate, createtemplate, deletetemplate, getsingletemplate, gettemplate, getTemplatePdf, restorefrombin } from "../controller/Template.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { checkpermission } from "../middleware/permission.middleware.js";

export const templaterouter = Router();

//post apis
templaterouter.post("/create",verifyjwt,checkpermission("Templates-Create"),upload.single("file"),createtemplate);

//delete apis
templaterouter.route("/deletetemplate/:id").delete(verifyjwt,checkpermission("Templates-Delete"),deletetemplate)
templaterouter.route("/archivetemplate/:id").post(verifyjwt,checkpermission("Templates-Archive"),archivetemplate)
templaterouter.route("/restore/:id").get(verifyjwt,checkpermission("Templates-Restore"),restorefrombin)

//get apis
templaterouter.route("/template/:id").get(getsingletemplate)
templaterouter.route("/gettemplate").get(verifyjwt,checkpermission("Templates-View"),gettemplate)
templaterouter.get("/template/:id/pdf", getTemplatePdf);