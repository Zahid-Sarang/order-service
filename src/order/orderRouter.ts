import express from "express";
import authenticate from "../common/middleware/authenticate";
import { asyncWrapper } from "../utils";
import { OrderController } from "./orderController";

const orderRouter = express.Router();
const orderController = new OrderController();

orderRouter.post("/", authenticate, asyncWrapper(orderController.create));

export default orderRouter;
