import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { createtemplate, deletetemplate, getsingletemplate, gettemplate } from "../controller/Template.controller.js";
import { createdocument, deletedocument, getdocument, getsingledocument } from "../controller/document.controller.js";

export const documentrouter = Router();

documentrouter.route("/create").post(verifyjwt,createdocument)
documentrouter.route("/getdocument").get(getdocument)
documentrouter.route("/deletedocument/:id").delete(deletedocument)
documentrouter.route("/document/:id").get(getsingledocument)