import {Router} from "express"
import { addpermission, adminsignup, changestatus, declineInvitation, deleteAdmin, disabletwofa, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, notified0, resetpass, resetpassword, setpass, twofaenable, updateAdmin, verifyotp, verifyotplogin } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { checkpermission } from "../middleware/permission.middleware.js";
import { authRateLimiter } from "../middleware/rateLimit.middleware.js";

export const adminrouter = Router();

//post apis
adminrouter.post("/signup", adminsignup);//secured
adminrouter.post("/addpermissions", verifyjwt,addpermission);
adminrouter.post("/twofaverify", verifyjwt,verifyotp);
adminrouter.post("/disabletwofa", verifyjwt,disabletwofa);
adminrouter.post("/twofaverifylogin",authRateLimiter,verifyotplogin);
adminrouter.post("/verify", changestatus);//secured
adminrouter.post("/notified", notified0);
adminrouter.post("/resetpassword", resetpass);//secured
adminrouter.post("/login", authRateLimiter,loginAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/forgot-password",authRateLimiter,resetpassword);//secured
adminrouter.post("/delete",verifyjwt,checkpermission("Contact Books-Delete"),deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.post("/setpassword",setpass);

//put apsi
adminrouter.put(
  "/update",
  verifyjwt,
  upload.single("profile_picture"),
  updateAdmin
);

//get apis
adminrouter.get("/getuser",verifyjwt,checkpermission("Contact Books-View"),getuser);
adminrouter.get("/twofa", verifyjwt,twofaenable);
adminrouter.get("/me", verifyjwt,getAdmin);
adminrouter.get("/getsubadmin",verifyjwt,getsubadmin);
adminrouter.get(
    "/decline/:email",
    declineInvitation
);