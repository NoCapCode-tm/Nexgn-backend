import {Router} from "express"
import { addcontact, adminsignup, changestatus, declineInvitation, deleteAdmin, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, notified0, resetpass, resetpassword, setpass, twofaenable, updateAdmin, verifyotp } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

export const adminrouter = Router();

//post apis
adminrouter.post("/signup", adminsignup);
adminrouter.post("/twofaverify", verifyjwt,verifyotp);
adminrouter.post("/verify", changestatus);
adminrouter.post("/notified", notified0);
adminrouter.post("/resetpassword", resetpass);
adminrouter.post("/login", loginAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/forgot-password",resetpassword);
adminrouter.post("/delete",deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.post("/addcontact",verifyjwt,addcontact);
adminrouter.post("/setpassword",setpass);

//put apsi
adminrouter.put(
  "/update",
  verifyjwt,
  upload.single("profile_picture"),
  updateAdmin
);

//get apis
adminrouter.get("/getuser",verifyjwt,getuser);
adminrouter.get("/twofa", verifyjwt,twofaenable);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.get("/getsubadmin",verifyjwt,getsubadmin);
adminrouter.get(
    "/decline/:email",
    declineInvitation
);