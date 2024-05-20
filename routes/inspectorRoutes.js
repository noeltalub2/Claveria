import { Router } from "express";
import inspectorController from "../controller/inspectorController.js";
import auth from "../middleware/authMiddleware.js";
const router = Router();

router.get("/login", auth.forwardAuth, inspectorController.getLogin);
router.post("/login", auth.forwardAuth, inspectorController.postLogin);

router.get(
	"/",
	auth.requireAuth,
	auth.checkRole(["inspector"]),
	inspectorController.getRoutes
);

router.get(
	"/schedule/:id",
	auth.requireAuth,
	auth.checkRole(["inspector"]),
	inspectorController.getSchedule
);

router.post(
	"/add",
	auth.requireAuth,
	auth.checkRole(["inspector"]),
	inspectorController.postAddReport
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["inspector"]),
	inspectorController.getLogout
);

export default router;
