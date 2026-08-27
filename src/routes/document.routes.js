import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller.js";
import { createdocument, deletedocument, getdocument, getsingledocument } from "../controller/document.controller.js";
import { getdocumentwidgets } from "../controller/signed.controller.js";

export const documentrouter = Router();

//post apis
documentrouter.route("/create").post(verifyjwt,createdocument)

//delete apis
documentrouter.route("/deletedocument/:id").delete(verifyjwt,deletedocument)

//get apis
documentrouter.route("/document/:id").get(getsingledocument)
documentrouter.route("/getdocument").get(verifyjwt,getdocument)
documentrouter.route("/widgets/:id").get(getdocumentwidgets)