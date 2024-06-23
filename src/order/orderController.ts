import { Request, Response } from "express";
import {
  CartItem,
  ProductPricingCache,
  Topping,
  ToppingPriceCache,
} from "../types";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";
import couponModel from "../coupon/couponModel";

export class OrderController {
  constructor() {}

  private calculateTotal = async (cart: CartItem[]) => {
    const productIds = cart.map((item) => item._id);

    // todo: proper error handling
    const productPricings = await productCacheModel.find({
      productId: {
        $in: productIds,
      },
    });

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

    const toppingPricings = await toppingCacheModel.find({
      toppingId: {
        $in: cartToppingIds,
      },
    });

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
    const code = await couponModel.findOne({
      code: couponCode,
      tenantId: tenantId,
    });

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

  create = async (req: Request, res: Response) => {
    // todo:validate request data
    console.log(req.body);

    const totalPrice = await this.calculateTotal(req.body.cart);

    let discountPercentage = 0;
    const couponCode = req.body.couponCode;
    const tenantId = req.body.tenantId;

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
    res.json({
      totalPrice: totalPrice,
      taxes: taxes,
      deliveryCharge: DELIVARY_CHARGES,
      discountAmount: discountAmount,
      finalTotal: finalTotal,
    });
  };
}
