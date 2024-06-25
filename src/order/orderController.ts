import { NextFunction, Request, Response } from "express";
import { Request as AuthRequest } from "express-jwt";
import config from "config";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { Logger } from "winston";
import {
  CartItem,
  ProductPricingCache,
  ROLES,
  Topping,
  ToppingPriceCache,
} from "../types";
import { OrderService } from "./orderService";
import { OrderStatus, PaymentMode, PaymentStatus } from "./orderTypes";
import idempotencyMode from "../idempotency/idempotencyMode";
import { PaymentGateway } from "../payment/paymentTypes";
import { MessageBroker } from "../types/broker";
import { CustomerService } from "../customer/customerService";

export class OrderController {
  constructor(
    private orderService: OrderService,
    private logger: Logger,
    private paymentGateway: PaymentGateway,
    private broker: MessageBroker,
    private customerService: CustomerService,
  ) {}

  private calculateTotal = async (cart: CartItem[]) => {
    const productIds = cart.map((item) => item._id);

    // todo: proper error handling for productIds
    const productPricings =
      await this.orderService.getProductsPricings(productIds);

    // todo: what will happen if product does not exist in the cache
    // 1. call catelog service
    // 2. Use price from cart <- BAD approach

    const cartToppingIds = cart.reduce((acc, item) => {
      return [
        ...acc,
        ...item.chosenConfiguration.selectedToppings.map(
          (topping) => topping._id,
        ),
      ];
    }, []);

    const toppingPricings =
      await this.orderService.getToppingsPricing(cartToppingIds);

    // todo: what will happen if toppings does not exist in the cache
    // 1. call catelog service
    // 2. Use price from cart <- BAD approach

    const totalPrice = cart.reduce((acc, curr) => {
      const cachedProductPrice = productPricings.find(
        (product) => product.productId === curr._id,
      );

      return (
        acc +
        curr.qty * this.getItemTotal(curr, cachedProductPrice, toppingPricings)
      );
    }, 0);

    return totalPrice;
  };

  private getItemTotal = (
    item: CartItem,
    cachedProductPrice: ProductPricingCache,
    toppingsPricings: ToppingPriceCache[],
  ) => {
    const toppingsTotal = item.chosenConfiguration.selectedToppings.reduce(
      (acc, curr) => {
        return acc + this.getCurrentToppingPrice(curr, toppingsPricings);
      },
      0,
    );

    const productTotal = Object.entries(
      item.chosenConfiguration.priceConfiguration,
    ).reduce((acc, [key, value]) => {
      const price =
        cachedProductPrice.priceConfiguration[key].availableOptions[value];

      return acc + price;
    }, 0);

    return productTotal + toppingsTotal;
  };

  private getCurrentToppingPrice = (
    topping: Topping,
    toppingPricings: ToppingPriceCache[],
  ) => {
    const currentTopping = toppingPricings.find(
      (current) => topping._id === current.toppingId,
    );

    if (!currentTopping) {
      // todo: make sure the item is in the cache else , may be call catalog service

      return topping.price;
    }

    return currentTopping.price;
  };

  private getDiscounPercentage = async (
    couponCode: string,
    tenantId: string,
  ) => {
    const code = await this.orderService.getCouponCode(couponCode, tenantId);

    if (!code) {
      return 0;
    }

    const currentDate = new Date();
    const couponDate = new Date(code.validUpto);

    if (currentDate <= couponDate) {
      return code.discount;
    }

    return 0;
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    // todo:validate request data

    const {
      cart,
      couponCode,
      tenantId,
      paymentMode,
      customerId,
      comment,
      address,
    } = req.body;

    const totalPrice = await this.calculateTotal(cart);

    let discountPercentage = 0;

    if (couponCode) {
      discountPercentage = await this.getDiscounPercentage(
        couponCode,
        tenantId,
      );
    }

    const discountAmount = Math.round((totalPrice * discountPercentage) / 100);

    const priceAfterDiscount = totalPrice - discountAmount;

    // todo:may store in db for each tenant
    const TAXES_PERCENT = 18;

    const taxes = Math.round((priceAfterDiscount * TAXES_PERCENT) / 100);

    // todo: may store in db for each tenant
    const DELIVARY_CHARGES = 50;

    const finalTotal = priceAfterDiscount + taxes + DELIVARY_CHARGES;

    const idempotencyKey = req.headers["idempotency-key"];

    const idempotency = await idempotencyMode.findOne({ key: idempotencyKey });
    let newOrder = idempotency ? [idempotency.response] : [];
    if (!idempotency) {
      const session = await mongoose.startSession();
      await session.startTransaction();

      try {
        // create an order
        newOrder = await this.orderService.createOrder(
          {
            cart,
            address,
            comment,
            customerId,
            tenantId,
            paymentMode,
            total: finalTotal,
            discount: discountAmount,
            deliveryCharges: DELIVARY_CHARGES,
            orderStatus: OrderStatus.RECEIVED,
            paymentStatus: PaymentStatus.PENDING,
            taxes,
          },
          session,
        );
        await this.orderService.createIdempotency(
          idempotencyKey as string,
          newOrder[0],
          session,
        );

        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        await session.endSession();
        return next(createHttpError(500, err));
      } finally {
        await session.endSession();
      }
    }
    this.logger.info(`Order created for cutomer ${customerId}`, {
      orderId: newOrder[0]._id,
    });

    // payment Processing...
    // todo: error handling.... use try and catch

    if (paymentMode === PaymentMode.CARD) {
      const session = await this.paymentGateway.createSession({
        amount: finalTotal,
        orderId: newOrder[0]._id.toString(),
        tenantId: tenantId,
        currency: "inr",
        idempotencyKey: idempotencyKey as string,
      });

      this.logger.info(`payment session is created for ${session.id}`, {
        orderId: newOrder[0]._id,
      });

      await this.broker.sendMessage(
        config.get("topic.orderTopic"),
        JSON.stringify(newOrder),
      );

      // todo: Update order document -> paymentId -> sessionId
      return res.json({
        paymentUrl: session.paymentUrl,
      });
    }

    await this.broker.sendMessage(
      config.get("topic.orderTopic"),
      JSON.stringify(newOrder),
    );

    return res.json({ paymentUrl: null });
  };

  getMine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.auth.sub;

    if (!userId) {
      return next(createHttpError(400, "No userId found"));
    }

    try {
      const customer = await this.customerService.getCustomerInfo(userId);
      if (!customer) {
        return next(createHttpError(400, "No customer found"));
      }

      const orders = await this.orderService.getCustomerOrder(customer._id);
      this.logger.info("orders are fetched for ", { customerId: customer._id });
      return res.json(orders);
    } catch (err) {
      next(createHttpError(500, err));
    }
  };

  getSingle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const orderId = req.params.orderId;

    const { sub: userId, role, tenant: tenantId } = req.auth;

    const fields = req.query.fields
      ? req.query.fields.toString().split(",")
      : [];

    // Construct the projection object
    const projection = fields.reduce(
      (acc, field) => {
        acc[field] = 1;
        return acc;
      },
      { customerId: 1 },
    );

    const order = await this.orderService.getOrderInfo(orderId, projection);

    if (!order) {
      next(createHttpError(400, "order does not exist"));
    }

    // What roles can access this endpoint: Admin,manager(for their own restaurant),customer(own order)
    if (role === "admin") {
      return res.json(order);
    }

    const myRestaurantOrder = order.tenantId === tenantId;
    if (role === "manager" && myRestaurantOrder) {
      return res.json(order);
    }

    if (role === "customer") {
      const customer = await this.customerService.getCustomerInfo(userId);
      if (!customer) {
        return next(createHttpError(400, "customer does not exist"));
      }

      if (order.customerId._id.toString() === customer._id.toString()) {
        return res.json(order);
      }
    }

    return next(createHttpError(402, "operation not permitted"));
  };

  getAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { role, tenant: userTenantId } = req.auth;

    const tenantId = req.query.tenantId;

    if (role === ROLES.CUSTOMER) {
      return next(createHttpError(403, "operation not permitted!"));
    }

    if (role === ROLES.ADMIN) {
      const filter = {};
      if (tenantId) {
        filter["tenantId"] = tenantId;
      }

      // todo: VERY IMPORTANT add pagination.
      const orders = await this.orderService.getTenantOrder(filter);

      return res.json(orders);
    }

    if (role === ROLES.MANAGER) {
      const orders = await this.orderService.getTenantOrder({
        tenantId: userTenantId,
      });

      return res.json(orders);
    }

    return next(createHttpError(403, "Not allowed"));
  };

  changeStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    const { role, tenant: tenantId } = req.auth;
    const orderId = req.params.orderId;

    if (role === ROLES.MANAGER || role === ROLES.ADMIN) {
      const order = await this.orderService.findOrderById(orderId);

      if (!order) {
        return next(createHttpError(400, "Order not found"));
      }

      const isMyRestaurantOrder = order.tenantId === tenantId;

      if (role === ROLES.MANAGER && !isMyRestaurantOrder) {
        return next(createHttpError(403, "Not allowed."));
      }

      const OrderStatusValue = Object.values(OrderStatus);
      if (!OrderStatusValue.includes(req.body.status)) {
        return next(createHttpError(400, "Please send valid order status."));
      }

      const updatedOrder = await this.orderService.updateOrderById(
        orderId,
        req.body.status,
      );

      // todo: send to kafka

      return res.json({
        _id: updatedOrder._id,
        status: updatedOrder.orderStatus,
      });
    }

    return next(createHttpError(403, "Not allowed to update order!"));
  };
}
