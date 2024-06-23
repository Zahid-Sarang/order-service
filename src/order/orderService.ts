import couponModel from "../coupon/couponModel";
import productCacheModel from "../productCache/productCacheModel";
import toppingCacheModel from "../toppingCache/toppingCacheModel";

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
}
