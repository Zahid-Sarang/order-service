import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import customerRouter from "./customer/customerRouter";
import couponRoute from "./coupon/couponRoute";
import orderRouter from "./order/orderRouter";
import paymentRouter from "./payment/paymentRouter";
const app = express();
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
