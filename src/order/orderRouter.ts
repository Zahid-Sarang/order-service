import express from "express";
import logger from "../config/logger";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";
import { OrderService } from "./orderService";

import { StripeGateWay } from "../payment/stripe";
import { createMessageBroker } from "../common/factories/brokerFactory";
import { CustomerService } from "../customer/customerService";

const orderRouter = express.Router();
const orderService = new OrderService();
const broker = createMessageBroker();
const paymentGateway = new StripeGateWay();
const customerService = new CustomerService();
const orderController = new OrderController(
  orderService,
  logger,
  paymentGateway,
  broker,
  customerService,
);

orderRouter.post("/", authenticate, asyncWrapper(orderController.create));
orderRouter.get("/mine", authenticate, asyncWrapper(orderController.getMine));

export default orderRouter;
