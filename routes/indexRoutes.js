import { Router } from "express";
import indexController from "../controller/indexController.js";

const router = Router();

router.get("/", indexController.getIndex);
router.get("/booking", indexController.getBooking);
router.post("/getBookingDetails", indexController.getBookingDetails);
router.post("/postBookingDetails", indexController.postBookingDetails);
router.get("/unauthorized", indexController.getError403);
router.use("/", indexController.getError404);

export default router;
