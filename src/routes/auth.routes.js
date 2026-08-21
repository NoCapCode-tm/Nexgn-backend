import {Router} from "express"
import { addcontact, adminsignup, declineInvitation, deleteAdmin, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, notified0, resetpassword, setpass, updateAdmin } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const adminrouter = Router();


adminrouter.post("/signup", adminsignup);
adminrouter.post("/notified", notified0);
adminrouter.post("/login", loginAdmin);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/resetpassword",resetpassword);
adminrouter.post("/delete",deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.get("/getsubadmin",getsubadmin);
adminrouter.post("/setpassword",setpass);
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