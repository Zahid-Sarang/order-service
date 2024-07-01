import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { CouponController } from "./couponContoller";
import { CouponService } from "./couponService";
import logger from "../config/logger";

const couponRoute = express.Router();
const couponService = new CouponService();
const couponController = new CouponController(couponService, logger);

couponRoute.post("/", authenticate, asyncWrapper(couponController.create));
couponRoute.post(
  "/verify",
  authenticate,
  asyncWrapper(couponController.verify),
);
couponRoute.delete(
  "/coupon/:couponId",
  authenticate,
  asyncWrapper(couponController.destory),
);

export default couponRoute;
