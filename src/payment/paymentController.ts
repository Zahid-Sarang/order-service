import { Response, Request } from "express";
import config from "config";
import { Logger } from "winston";
import { PaymentGateway } from "./paymentTypes";
import { OrderService } from "../order/orderService";
import { MessageBroker } from "../types/broker";
import { OrderEvents } from "../order/orderTypes";

export class PaymentController {
  constructor(
    private paymentGateway: PaymentGateway,
    private OrderService: OrderService,
    private logger: Logger,
    private broker: MessageBroker,
  ) {}
  handleWebHook = async (req: Request, res: Response) => {
    const webhookBody = req.body;
    if (webhookBody.type === "checkout.session.completed") {
      const verifiedSession = await this.paymentGateway.getSession(
        webhookBody.data.object.id,
      );
      console.log("verified session", verifiedSession);

      const isPaymentSuccess = verifiedSession.paymentStatus === "paid";

      const updatedOrder = await this.OrderService.updateOrder(
        verifiedSession.metadata.orderId,
        isPaymentSuccess,
      );

      this.logger.info(
        `payment session is completed: ${verifiedSession.paymentStatus}`,
        { orderId: verifiedSession.metadata.orderId },
      );

      // todo: Think about message broker message fail

      const brokerMessage = {
        event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
        data: updatedOrder,
      };

      await this.broker.sendMessage(
        config.get("topic.orderTopic"),
        JSON.stringify(brokerMessage),
        updatedOrder._id.toString(),
      );
    }
    res.json({ success: true });
  };
}
