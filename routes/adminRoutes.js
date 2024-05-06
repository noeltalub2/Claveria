import { Router } from "express";
import auth from "../middleware/authMiddleware.js";
import adminController from "../controller/adminController.js";

const router = Router();

router.get("/signin", auth.forwardAuth, adminController.getSignIn);
router.post("/signin", auth.forwardAuth, adminController.postSignIn);
router.get(
	"/dashboard",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getDashboard
);

router.get(
	"/users",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUsers
);

router.get(
	"/api/users",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUsersApi
);

router.get(
	"/users/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUsersProfile
);

router.post(
	"/api/update-status",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postUpdateStatus
);
router.post(
	"/api/update-status/card",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postUpdateCardStatus
);

router.post(
	"/api/changepassword",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postChangePassApi
);

router.get(
	"/api/gatepass",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUserGatepassApi
);

router.delete(
	"/api/user/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteUser
);

router.get(
	"/gatepass",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGatepass
);

router.get(
	"/api/all_gatepass",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGatepassApi
);

router.post(
	"/api/auth-status",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postUpdateAuth
);
router.post(
	"/api/auth-status/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postEditAuth
);

router.get(
	"/gates",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGates
);
router.post(
	"/gates/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postAddGate
);
router.get(
	"/gates/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGatesEdit
);

router.post(
	"/gates/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postGateEdit
);

router.delete(
	"/api/gate/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteGate
);

router.get(
	"/gate-access",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGateAccess
);
router.post(
	"/gates/access",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postAddGateAccess
);
router.get(
	"/gate-access/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getGateAccessId
);
router.post(
	"/gate-access/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postGateEditAccess
);


router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getLogout
);

export default router;
