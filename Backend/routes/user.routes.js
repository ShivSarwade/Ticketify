import { Router } from "express";
import {
  Test,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changePassword,
  updateAccountDetails,
  updateUserAvatar,

} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/userAuth.middleware.js";
import {upload} from '../middlewares/multer.middelware.js'

const router = Router();

router.route("/Usertesting").post(Test);

router
  .route("/register")
  .post(registerUser);

router.route("/login").post(loginUser);
router.post("/change-password",verifyJWT,changePassword);
router.post("/update-account-details",verifyJWT,updateAccountDetails);

//secured routes
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", refreshAccessToken);

router.post("/get-current-user", verifyJWT, getCurrentUser);

router.post("/update-avatar", upload.single("avatar"),verifyJWT, updateUserAvatar);

export default router;
