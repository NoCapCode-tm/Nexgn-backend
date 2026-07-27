import {Router} from "express"
import { addcontact, adminsignup, declineInvitation, deleteAdmin, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, updateAdmin } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const adminrouter = Router();


adminrouter.post("/signup", adminsignup);
adminrouter.post("/login", loginAdmin);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/delete",deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.get("/getsubadmin",getsubadmin);
adminrouter.get(
    "/decline/:email",
    declineInvitation
);
adminrouter.put(
  "/update",
  verifyjwt,
  upload.single("profile_picture"),
  updateAdmin
);
adminrouter.post("/addcontact",verifyjwt,addcontact);
adminrouter.get("/getuser",getuser);