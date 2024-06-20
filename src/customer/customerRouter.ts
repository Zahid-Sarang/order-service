import express from "express";
import { asyncWrapper } from "../utils";
import { CustomerContoller } from "./cutsomerController";
import authenticate from "../common/middleware/authenticate";
import { CustomerService } from "./customerService";
import logger from "../config/logger";

const customerRouter = express.Router();
const customerService = new CustomerService();
const customerContoller = new CustomerContoller(customerService, logger);

customerRouter.get(
  "/",
  authenticate,
  asyncWrapper(customerContoller.getCustomer),
);

customerRouter.patch(
  "/addresses/:id",
  authenticate,
  asyncWrapper(customerContoller.addAddress),
);
export default customerRouter;
