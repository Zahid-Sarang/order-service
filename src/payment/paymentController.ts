import { Response, Request } from "express";
import config from "config";
import { Logger } from "winston";
import { PaymentGateway } from "./paymentTypes";
import { OrderService } from "../order/orderService";
import { MessageBroker } from "../types/broker";
import { OrderEvents } from "../order/orderTypes";
import { CustomerService } from "../customer/customerService";

export class PaymentController {
  constructor(
    private paymentGateway: PaymentGateway,
    private OrderService: OrderService,
    private customerService: CustomerService,
    private logger: Logger,
    private broker: MessageBroker,
  ) {}
  handleWebHook = async (req: Request, res: Response) => {
    const webhookBody = req.body;
    if (webhookBody.type === "checkout.session.completed") {
      const verifiedSession = await this.paymentGateway.getSession(
        webhookBody.data.object.id,
      );

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

      const customer = await this.customerService.getCustomerById(
        updatedOrder.customerId,
      );

      const brokerMessage = {
        event_type: OrderEvents.PAYMENT_STATUS_UPDATE,
        data: { ...updatedOrder.toObject(), customerId: customer },
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
