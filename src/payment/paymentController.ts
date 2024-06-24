import { Response, Request } from "express";
import { PaymentGateway } from "./paymentTypes";

import { OrderService } from "../order/orderService";
import { Logger } from "winston";

export class PaymentController {
  constructor(
    private paymentGateway: PaymentGateway,
    private OrderService: OrderService,
    private logger: Logger,
  ) {}
  handleWebHook = async (req: Request, res: Response) => {
    const webhookBody = req.body;
    if (webhookBody.type === "checkout.session.completed") {
      const verifiedSession = await this.paymentGateway.getSession(
        webhookBody.data.object.id,
      );
      console.log("verified session", verifiedSession);

      const isPaymentSuccess = verifiedSession.paymentStatus === "paid";

      // todo:move to service layer
      await this.OrderService.updateOrder(
        verifiedSession.metadata.orderId,
        isPaymentSuccess,
      );

      this.logger.info(
        `payment session is completed: ${verifiedSession.paymentStatus}`,
        { orderId: verifiedSession.metadata.orderId },
      );

      // todo: send updated to kafka Broker
    }
    res.json({ success: true });
  };
}
