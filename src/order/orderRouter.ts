import express from "express";
import logger from "../config/logger";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";
import { OrderService } from "./orderService";

import { StripeGateWay } from "../payment/stripe";

const orderRouter = express.Router();
const orderService = new OrderService();
const paymentGateway = new StripeGateWay();
const orderController = new OrderController(
  orderService,
  logger,
  paymentGateway,
);

orderRouter.post("/", authenticate, asyncWrapper(orderController.create));

export default orderRouter;
