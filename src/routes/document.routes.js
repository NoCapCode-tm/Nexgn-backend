import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller.js";
import { cancelrequest, createdocument, deletedocument, getdocPdf, getdocument, getsingledocument, movetobin, restorefrombin } from "../controller/document.controller.js";
import { getdocumentwidgets } from "../controller/signed.controller.js";
import { checkpermission } from "../middleware/permission.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const documentrouter = Router();

//post apis
documentrouter.route("/create").post(verifyjwt,checkpermission("Documents-Send for Signature"),upload.single("file"),createdocument)//sexured


//delete apis
documentrouter.route("/deletedocument/:id").delete(verifyjwt,checkpermission("Documents-Delete"),deletedocument)

//get apis
documentrouter.route("/document/:id").get(getsingledocument)
documentrouter.route("/archivedocument/:id").get(verifyjwt,checkpermission("Documents-Archive"),movetobin)
documentrouter.route("/restore/:id").get(verifyjwt,checkpermission("Documents-Restore"),restorefrombin)
documentrouter.route("/getdocument").get(verifyjwt,checkpermission("Documents-View"),getdocument)
documentrouter.route("/widgets/:id").get(getdocumentwidgets)
documentrouter.route("/cancelrequest/:id").get(verifyjwt,checkpermission("Documents-Cancel Requests"),cancelrequest)
documentrouter.get("/:id/pdf", getdocPdf);