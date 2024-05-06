import { Router } from "express";
import userController from "../controller/userController.js";
import { uploadConfig } from "../middleware/uploadImage.js";
import auth from "../middleware/authMiddleware.js";
import { resizeImages } from "../middleware/uploadImage.js"; // Ensure you import the resizeImages middleware

const router = Router();

router.get("/signin", auth.forwardAuth, userController.getSignIn);
router.post("/signin", auth.forwardAuth, userController.postSignIn);

router.get("/signup", auth.forwardAuth, userController.getSignUp);
router.post(
	"/signup",
	auth.forwardAuth,
	userController.postSignUp
);
router.get(
	"/home",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getHome
);
router.get(
	"/gatepass",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getGatepass
);
router.get(
	"/api/gatepass",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getGatepassApi
);

router.get(
	"/profile/account",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getProfileDetails
);
router.post(
	"/profile/account",
	auth.requireAuth,
	auth.checkRole(["user"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	userController.postProfileDetails
);

router.get(
	"/profile/vehicle",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getProfileVehicle
);

router.post(
	"/profile/vehicle",
	auth.requireAuth,
	auth.checkRole(["user"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	userController.postProfileVehicle
);

router.get(
	"/profile/password",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getProfileChangePass
);

router.post(
	"/profile/password",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.postProfileChangePass
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["user"]),
	userController.getLogout
);

export default router;
