import couponModel from "../coupon/couponModel";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import orderModel from "./orderModel";
import idempotencyMode from "../idempotency/idempotencyMode";

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
}
