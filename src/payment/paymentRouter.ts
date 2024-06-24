import express from "express";
import { asyncWrapper } from "../utils";
import { PaymentController } from "./paymentController";
import { StripeGateWay } from "./stripe";
import { OrderService } from "../order/orderService";
import logger from "../config/logger";

const router = express.Router();

// todo: move this instaction to factory
const paymentGateway = new StripeGateWay();
const orderService = new OrderService();
const paymentController = new PaymentController(
  paymentGateway,
  orderService,
  logger,
);
router.post("/webhook", asyncWrapper(paymentController.handleWebHook));

export default router;
