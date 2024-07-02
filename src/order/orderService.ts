import couponModel from "../coupon/couponModel";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import orderModel from "./orderModel";
import idempotencyMode from "../idempotency/idempotencyMode";
import { OrderStatus, PaymentStatus } from "./orderTypes";
import mongoose from "mongoose";
import { Filter, PaginateQuery } from "../types";
import { paginationLabels } from "../config/pagination";
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

  async getCustomerOrder(
    customerId: mongoose.Types.ObjectId,
    paginatedQuery: PaginateQuery,
  ) {
    const aggregate = orderModel.aggregate([
      {
        $match: { customerId: customerId },
      },
      { $project: { cart: 0 } },
    ]);
    return orderModel.aggregatePaginate(aggregate, {
      ...paginatedQuery,
      customLabels: paginationLabels,
    });
  }

  async getOrderInfo(orderId: string, projection) {
    return await orderModel
      .findOne({ _id: orderId }, projection)
      .populate("customerId");
  }

  async getTenantOrder(filter: Filter, paginatedQuery: PaginateQuery) {
    const aggregate = orderModel.aggregate([
      {
        $match: filter,
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerId",
        },
      },
      { $unwind: "$customerId" },
    ]);

    return orderModel.aggregatePaginate(aggregate, {
      ...paginatedQuery,
      customLabels: paginationLabels,
    });
  }

  async findOrderById(orderId: string) {
    return await orderModel.findOne({ _id: orderId });
  }

  async updateOrderById(orderId: string, status: OrderStatus) {
    return await orderModel.findOneAndUpdate(
      { _id: orderId },
      { orderStatus: status },
      { new: true },
    );
  }
}
