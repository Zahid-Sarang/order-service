import Stripe from "stripe";
import config from "config";
import {
  CustomeMetaData,
  PaymentGateway,
  PaymentOptions,
  VerifiedSession,
} from "./paymentTypes";

export class StripeGateWay implements PaymentGateway {
  private stripe: Stripe;
  constructor() {
    this.stripe = new Stripe(config.get("stripe.secretKey"));
  }

  async createSession(options: PaymentOptions) {
    const session = await this.stripe.checkout.sessions.create(
      {
        // todo: add customer email
        // customer_email: options.email
        metadata: {
          orderId: options.orderId,
        },

        billing_address_collection: "required",

        // todo: implement in the future , capture structured address from customer
        // payment_intent_data: {
        //   shipping: {
        //     name: "zahid sarang",
        //     address: {
        //       line1: "some line",
        //       city: "some city",
        //       country: "India",
        //       postal_code: "4000612",
        //     },
        //   },
        // },

        line_items: [
          {
            price_data: {
              unit_amount: options.amount * 100,
              product_data: {
                name: "Online Pizza order",
                description: "Total amount to be paid",
                images: [config.get("image.logo")],
              },
              currency: options.currency || "inr",
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${config.get("frontend.clientUI")}/payment?success=true&orderId=${options.orderId}&restaurantId=${options.tenantId}`,
        cancel_url: `${config.get("frontend.clientUI")}/payment?success=false&orderId=${options.orderId}&restaurantId=${options.tenantId}`,
      },
      {
        idempotencyKey: options.idempotencyKey,
      },
    );

    return {
      id: session.id,
      paymentUrl: session.url,
      paymentStatus: session.payment_status,
    };
  }
  async getSession(id: string) {
    const session = await this.stripe.checkout.sessions.retrieve(id);
    const verifiedSession: VerifiedSession = {
      id: session.id,
      paymentStatus: session.payment_status,
      metadata: session.metadata as unknown as CustomeMetaData,
    };

    return verifiedSession;
  }
}
