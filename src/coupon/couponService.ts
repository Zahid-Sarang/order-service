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
}