import { Router } from "express";
import adminController from "../controller/adminController.js";
import auth from "../middleware/authMiddleware.js";
const router = Router();

router.get("/login", auth.forwardAuth, adminController.getLogin);
router.post("/login", auth.forwardAuth, adminController.postLogin);

router.get(
	"/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getDashboard
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getLogout
);

export default router;
