import { Router } from "express";
import conductorController from "../controller/conductorController.js";
import auth from "../middleware/authMiddleware.js";
const router = Router();

router.get("/login", auth.forwardAuth, conductorController.getLogin);
router.post("/login", auth.forwardAuth, conductorController.postLogin);

router.get(
	"/",
	auth.requireAuth,
	auth.checkRole(["conductor"]),
	conductorController.getRoutes
);
router.post(
	"/add",
	auth.requireAuth,
	auth.checkRole(["conductor"]),
	conductorController.postAddPassenger
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["conductor"]),
	conductorController.getLogout
);

export default router;
