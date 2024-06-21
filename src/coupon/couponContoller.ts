import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import createHttpError from "http-errors";
import { CouponService } from "./couponService";
import { Logger } from "winston";

export class CouponController {
  constructor(
    private couponService: CouponService,
    private logger: Logger,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const { title, code, validUpto, discount, tenantId } = req.body;

    // todo: add request validation

    const { role, tenant } = req.auth;
    if (tenantId === tenant || role === "admin") {
      const coupon = await this.couponService.createCoupon({
        title,
        code,
        validUpto,
        discount,
        tenantId,
      });

      this.logger.info(`New Coupon created`, { id: coupon._id });
      res.json(coupon);
    }
    return next(createHttpError(403, "you are not allowed to create coupon"));
  };
}
