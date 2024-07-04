import express, { Request, Response } from "express";
import cors from "cors";
import config from "config";
import cookieParser from "cookie-parser";

import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import customerRouter from "./customer/customerRouter";
import couponRoute from "./coupon/couponRoute";
import orderRouter from "./order/orderRouter";
import paymentRouter from "./payment/paymentRouter";

const app = express();

const ALLOWED_DOMAINS = [
  config.get<string>("frontend.clientUI"),
  config.get<string>("frontend.adminUI"),
];

app.use(
  cors({
    origin: ALLOWED_DOMAINS,
  }),
);

console.log(ALLOWED_DOMAINS);

app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from order service service!" });
});

app.use("/customers", customerRouter);
app.use("/coupons", couponRoute);
app.use("/orders", orderRouter);
app.use("/payments", paymentRouter);
app.use(globalErrorHandler);

export default app;
