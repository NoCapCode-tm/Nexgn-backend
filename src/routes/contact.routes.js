import {Router} from "express"
import { verifyjwt } from "../middleware/auth.middleware";
import { checkpermission } from "../middleware/permission.middleware";

import { addcontact, deletecontact, getContact, updatecontact } from "../controller/contact.controller";
export const contactrouter = Router();


contactrouter.post("/addcontact",verifyjwt,checkpermission("Contact Books-Add"),addcontact);
contactrouter.get("/getcontact",verifyjwt,getContact);
contactrouter.put("/updatecontact/:id", verifyjwt, updatecontact);
// contactrouter.post("/addcontact",verifyjwt,checkpermission("Contact Books-Add"),addcontact);
contactrouter.delete("/deletecontact/:id",verifyjwt,deletecontact);