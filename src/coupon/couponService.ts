import { paginationLabels } from "../config/pagination";
import couponModel from "./couponModel";
import { Filter, PaginateQuery } from "../types/index";

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

  async getTenantsCoupons(
    q: string,
    filter: Filter,
    paginatedQuery: PaginateQuery,
  ) {
    const searchQueryRegex = new RegExp(q, "i");

    const matchQuery = {
      ...filter,
      title: searchQueryRegex,
    };

    const aggregate = couponModel.aggregate([
      {
        $match: matchQuery,
      },
      { $sort: { createdAt: -1 } },
    ]);
    return couponModel.aggregatePaginate(aggregate, {
      ...paginatedQuery,
      customLabels: paginationLabels,
    });
  }
}
