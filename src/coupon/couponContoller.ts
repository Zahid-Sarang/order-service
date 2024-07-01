import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import createHttpError from "http-errors";
import { CouponService } from "./couponService";
import { Logger } from "winston";
import { ROLES } from "../types";

export class CouponController {
  constructor(
    private couponService: CouponService,
    private logger: Logger,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    const { title, code, validUpto, discount, tenantId } = req.body;

    // todo: add request validation

    const { role, tenant } = req.auth;
    if (tenantId === tenant || role === ROLES.ADMIN) {
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

  // TODO: complete crud assignment

  // verify coupon

  verify = async (req: Request, res: Response, next: NextFunction) => {
    const { code, tenantId } = req.body;
    // todo:request validations

    const coupon = await this.couponService.findCoupon({
      code: code,
      tenantId: tenantId,
    });

    if (!coupon) {
      const error = createHttpError(400, "Coupon does not exist");
      return next(error);
    }

    //validate expiry
    const currentDate = new Date();
    const couponDate = new Date(coupon.validUpto);

    if (currentDate <= couponDate) {
      return res.json({ valid: true, discount: coupon.discount });
    }
    this.logger.info(`Coupon is verify for`, { id: coupon._id });

    res.json({ valid: false, discount: 0 });
  };

  destory = async (req: Request, res: Response, next: NextFunction) => {
    const { couponId } = req.params;
    const { role, tenant } = req.auth;

    if (!couponId) {
      return next(createHttpError(400, "Invalid Url Params!"));
    }
    const coupon = await this.couponService.findById(couponId);

    if (tenant === String(coupon.tenantId) || role === ROLES.ADMIN) {
      await this.couponService.deleteCouponById(couponId);
      this.logger.info(`Coupon is deleted`, { id: coupon._id });
      return res.json("coupon deleted");
    }

    return next(createHttpError(403, "you are not allowed to delete coupon"));
  };
}
