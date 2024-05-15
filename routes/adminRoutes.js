import { Router } from "express";
import adminController from "../controller/adminController.js";
import { uploadConfig } from "../middleware/uploadImage.js";
import auth from "../middleware/authMiddleware.js";
import { resizeImages } from "../middleware/uploadImage.js";
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
	"/booking",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getBooking
);
router.get(
	"/booking/route/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getBookingRoute
);
router.get(
	"/booking/route/schedule/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getBookingRouteSchedule
);
router.get(
	"/booking/route/schedule/view/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getUserBookingDetails
);
router.post(
	"/booking/route/schedule/edit/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postUserEditBookingDetails
);

router.post(
	"/booking/route/schedule/cancel/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.cancelBooking
);

router.post(
	"/booking/route/schedule/paid/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.paidBooking
);

router.post(
	"/booking/route/schedule/download/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.downloadBooking
);

router.get(
	"/route-schedule",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getRouteSchedule
);

router.post(
	"/route-schedule/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRouteScheduleAdd
);

router.get(
	"/route-schedule/walkin/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getRouteScheduleWalkIn
);

router.post(
	"/route-schedule/walkin/",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRouteScheduleWalkIn
);

router.get(
	"/routes",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getRoutes
);

router.post(
	"/routes/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRoutesAdd
);

router.post(
	"/routes/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRoutesEdit
);

router.delete(
	"/routes/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteRoute
);
router.get(
	"/routes/subroutes/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getRouteSub
);

router.post(
	"/routes/subroutes/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRoutesSubAdd
);

router.post(
	"/routes/subroutes/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postRoutesSubEdit
);

router.delete(
	"/routes/subroutes/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteRouteSub
);

router.get(
	"/transaction-history",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getTransaction
);

router.get(
	"/transaction-history/search",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getTransactionSearch
);

router.get(
	"/bus",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getBus
);

router.post(
	"/bus/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postBusAdd
);

router.post(
	"/bus/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postBusEdit
);

router.delete(
	"/bus/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteBus
);

router.get(
	"/inspector",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getInspector
);

router.post(
	"/inspector/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postInspectorAdd
);

router.post(
	"/inspector/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postInspectorEdit
);

router.delete(
	"/inspector/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteInspector
);

router.get(
	"/inspector/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getInspectorReport
);

router.get(
	"/conductor",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getConductor
);

router.post(
	"/conductor/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postConductorAdd
);

router.post(
	"/conductor/edit",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.postConductorEdit
);

router.delete(
	"/conductor/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.deleteConductor
);

router.get(
	"/conductor/:id",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getConductorReport
);

router.get(
	"/download-ticket/:id/:user",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getTicket
);

router.get(
	"/announcement",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getAnnouncement
);

router.post(
	"/announcement/add",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	uploadConfig, // Apply the uploadConfig middleware here as well
	resizeImages, // Apply the resizeImages middleware to process the uploaded images
	adminController.postAnnouncement
);

router.delete(
	"/announcement/delete",
	auth.requireAuth,
	auth.checkRole(["admin"]),

	adminController.deleteAnnouncement
);

router.get(
	"/logout",
	auth.requireAuth,
	auth.checkRole(["admin"]),
	adminController.getLogout
);

export default router;
