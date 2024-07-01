import couponModel from "./couponModel";

export class CouponService {
  constructor() {}

  async createCoupon({ title, code, validUpto, discount, tenantId }) {
    return couponModel.create({
      title,
      code,
      discount,
      validUpto,
      tenantId,
    });
  }

  async findCoupon({ code, tenantId }) {
    return await couponModel.findOne({ code, tenantId });
  }

  async findById(couponId: string) {
    return await couponModel.findOne({ _id: couponId });
  }

  async deleteCouponById(couponId: string) {
    return await couponModel.findByIdAndDelete({ _id: couponId });
  }
}
