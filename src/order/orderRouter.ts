import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";
import { OrderService } from "./orderService";
import logger from "../config/logger";

const orderRouter = express.Router();
const orderService = new OrderService();
const orderController = new OrderController(orderService, logger);

orderRouter.post("/", authenticate, asyncWrapper(orderController.create));

export default orderRouter;
