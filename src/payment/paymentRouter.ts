import express from "express";
import { asyncWrapper } from "../utils";
import { PaymentController } from "./paymentController";
import { StripeGateWay } from "./stripe";
import { OrderService } from "../order/orderService";
import logger from "../config/logger";
import { createMessageBroker } from "../common/factories/brokerFactory";
import { CustomerService } from "../customer/customerService";

const router = express.Router();

// todo: move this instaction to factory
const paymentGateway = new StripeGateWay();
const orderService = new OrderService();
const customerService = new CustomerService();
const broker = createMessageBroker();
const paymentController = new PaymentController(
  paymentGateway,
  orderService,
  customerService,
  logger,
  broker,
);
router.post("/webhook", asyncWrapper(paymentController.handleWebHook));

export default router;
