import couponModel from "../coupon/couponModel";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import orderModel from "./orderModel";
import idempotencyMode from "../idempotency/idempotencyMode";
import { PaymentStatus } from "./orderTypes";
import mongoose from "mongoose";
export class OrderService {
  constructor() {}

  // product pricing from productCacheModel
  async getProductsPricings(productIds: string[]) {
    return await productCacheModel.find({
      productId: {
        $in: productIds,
      },
    });
  }

  // topping pricing from toppingCacheModel
  async getToppingsPricing(cartToppingIds: string[]) {
    return await toppingCacheModel.find({
      toppingId: {
        $in: cartToppingIds,
      },
    });
  }

  // coupon model
  async getCouponCode(couponCode: string, tenantId: string) {
    return await couponModel.findOne({
      code: couponCode,
      tenantId: tenantId,
    });
  }

  // create an order

  async createOrder(
    {
      cart,
      address,
      comment,
      customerId,
      tenantId,
      paymentMode,
      total,
      discount,
      deliveryCharges,
      orderStatus,
      paymentStatus,
      taxes,
    },
    session,
  ) {
    return await orderModel.create(
      [
        {
          cart,
          address,
          comment,
          customerId,
          tenantId,
          paymentMode,
          total,
          discount,
          deliveryCharges,
          orderStatus,
          paymentStatus,
          taxes,
        },
      ],
      { session: session },
    );
  }

  async createIdempotency(idempotencyKey: string, response, session) {
    return await idempotencyMode.create(
      [{ key: idempotencyKey, response: response }],
      { session },
    );
  }

  async updateOrder(orderId: string, isPaymentSuccess: boolean) {
    return await orderModel.findOneAndUpdate(
      {
        _id: orderId,
      },
      {
        paymentStatus: isPaymentSuccess
          ? PaymentStatus.PAID
          : PaymentStatus.FAILED,
      },
      { new: true },
    );
  }

  async getCustomerOrder(customerId: mongoose.Types.ObjectId) {
    // todo:implement pagination
    return await orderModel.find({ customerId: customerId }, { cart: 0 });
  }

  async getOrderInfo(orderId: string, projection) {
    return await orderModel.findOne({ _id: orderId }, projection);
  }
}
