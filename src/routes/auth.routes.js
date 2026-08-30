import {Router} from "express"
import { addcontact, addpermission, adminsignup, changestatus, declineInvitation, deleteAdmin, getAdmin, getsubadmin, getuser, inviteadmin, loginAdmin, logout, notified0, resetpass, resetpassword, setpass, twofaenable, updateAdmin, verifyotp, verifyotplogin } from "../controller/admin.controller.js";
import { verifyjwt } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { checkpermission } from "../middleware/permission.middleware.js";

export const adminrouter = Router();

//post apis
adminrouter.post("/signup", adminsignup);
adminrouter.post("/addpermissions", verifyjwt,addpermission);
adminrouter.post("/twofaverify", verifyjwt,verifyotp);
adminrouter.post("/twofaverifylogin",verifyotplogin);
adminrouter.post("/verify", changestatus);
adminrouter.post("/notified", notified0);
adminrouter.post("/resetpassword", resetpass);
adminrouter.post("/login", loginAdmin);
adminrouter.post("/logout",verifyjwt,logout);
adminrouter.post("/forgot-password",resetpassword);
adminrouter.post("/delete",verifyjwt,checkpermission("Contact Books-Delete"),deleteAdmin);
adminrouter.post("/invite",verifyjwt,inviteadmin);
adminrouter.post("/addcontact",verifyjwt,checkpermission("Contact Books-Add"),addcontact);
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