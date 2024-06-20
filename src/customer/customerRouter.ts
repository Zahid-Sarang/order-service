import express from "express";
import { asyncWrapper } from "../utils";
import { CustomerContoller } from "./cutsomerController";
import authenticate from "../common/middleware/authenticate";

const customerRouter = express.Router();

const customerContoller = new CustomerContoller();

customerRouter.get(
  "/",
  authenticate,
  asyncWrapper(customerContoller.getCustomer),
);

export default customerRouter;
