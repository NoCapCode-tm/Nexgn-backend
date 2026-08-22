import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate, getTemplatePdf } from "../controller/Template.controller.js";
import { upload } from "../middleware/multer.middleware.js";

export const templaterouter = Router();

templaterouter.post(
  "/create",
  verifyjwt,
  upload.single("file"),
  createtemplate
);
templaterouter.route("/gettemplate").get(verifyjwt,gettemplate)
templaterouter.get("/template/:id/pdf", getTemplatePdf);
templaterouter.route("/deletetemplate/:id").delete(verifyjwt,deletetemplate)
templaterouter.route("/template/:id").get(getsingletemplate)