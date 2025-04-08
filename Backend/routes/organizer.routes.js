import { Router } from "express";
import {
  Test,
  registerOrganizer,
  loginOrganizer,
  logoutOrganizer,
  refreshAccessToken,
  getCurrentOrganizer,
  updateAccountDetails,
  changePassword,
  updateOrganizerAvatar,
} from "../controllers/organizer.controller.js";
import { verifyJWT } from "../middlewares/organizerAuth.middleware.js";
import {upload} from '../middlewares/multer.middelware.js'
const router = Router();

router.route("/Usertesting").post(Test);

router
  .route("/register")
  .post(registerOrganizer);

router.route("/login").post(loginOrganizer);

//secured routes
router.post("/logout", verifyJWT, logoutOrganizer);
router.post("/refresh-token", refreshAccessToken);

router.post("/get-current-organiser", verifyJWT, getCurrentOrganizer);
router.post("/update-account-details", verifyJWT, updateAccountDetails);
router.post("/change-password", verifyJWT, changePassword);
router.post("/update-avatar", upload.single("avatar"),verifyJWT, updateOrganizerAvatar);


export default router;
