import {Router} from "express"
import { adminsignup, deleteAdmin, getAdmin, loginAdmin, logout } from "../controller/admin.controller";
import { verifyjwt } from "../middleware/auth.middleware";

export const adminrouter = Router();


adminrouter.post("/signup", adminsignup);
adminrouter.post("/login", loginAdmin);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/delete/:id",deleteAdmin);