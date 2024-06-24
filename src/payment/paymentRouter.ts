import express from "express";
import { asyncWrapper } from "../utils";
import { PaymentController } from "./paymentController";
import { StripeGateWay } from "./stripe";
import { OrderService } from "../order/orderService";
import logger from "../config/logger";
import { createMessageBroker } from "../common/factories/brokerFactory";

const router = express.Router();

// todo: move this instaction to factory
const paymentGateway = new StripeGateWay();
const orderService = new OrderService();
const broker = createMessageBroker();
const paymentController = new PaymentController(
  paymentGateway,
  orderService,
  logger,
  broker,
);
router.post("/webhook", asyncWrapper(paymentController.handleWebHook));

export default router;
