import { Router } from "express";
import indexController from "../controller/indexController.js";
import auth from "../middleware/authMiddleware.js";
const router = Router();

router.get("/", auth.requireAuth, indexController.getIndex);
router.get("/login", auth.requireAuth, indexController.getLogin);
router.post("/login", auth.requireAuth, indexController.postLogin);

router.get("/register", auth.requireAuth, indexController.getRegister);
router.post("/register", auth.requireAuth, indexController.postRegister);

router.get("/booking", auth.requireAuth, indexController.getBooking);
router.post(
	"/getBookingDetails",
	auth.requireAuth,
	indexController.getBookingDetails
);
router.post(
	"/postBookingDetails",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.postBookingDetails
);
router.get(
	"/account",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.getAccount
);
router.get(
	"/getBooking/:id",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.getUserBookingDetails
);


router.post(
	"/account/edit",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.postUpdateProfile
);

router.post(
	"/cancel-booking",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.cancelBooking
);

router.get(
	"/download-ticket/:id",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.getTicket
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["user"]),
	indexController.getLogout
);

router.get("/unauthorized", indexController.getError403);
router.use("/", indexController.getError404);

export default router;
