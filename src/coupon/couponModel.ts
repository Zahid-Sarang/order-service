import mongoose, { AggregatePaginateModel } from "mongoose";
import { Coupon } from "./couponTypes";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const couponSchema = new mongoose.Schema<Coupon>(
  {
    title: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    validUpto: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });

couponSchema.plugin(aggregatePaginate);

export default mongoose.model<Coupon, AggregatePaginateModel<Coupon>>(
  "Coupon",
  couponSchema,
);
