import {Router} from "express"
import { addcontact, adminsignup, changestatus, declineInvitation, deleteAdmin, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, notified0, resetpass, resetpassword, setpass, updateAdmin } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const adminrouter = Router();


adminrouter.post("/signup", adminsignup);
adminrouter.post("/verify", changestatus);
adminrouter.post("/notified", notified0);
adminrouter.post("/resetpassword", resetpass);
adminrouter.post("/login", loginAdmin);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/forgot-password",resetpassword);
adminrouter.post("/delete",deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.get("/getsubadmin",verifyjwt,getsubadmin);
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
adminrouter.get("/getuser",verifyjwt,getuser);