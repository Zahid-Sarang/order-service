import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { CustomerService } from "./customerService";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class CustomerContoller {
  constructor(
    private customerService: CustomerService,
    private logger: Logger,
  ) {}
  getCustomer = async (req: Request, res: Response) => {
    const { sub: userId, firstName, lastName, email } = req.auth;

    const customer = await this.customerService.getCustomerInfo(userId);

    if (!customer) {
      const newCustomer = await this.customerService.addCustomer({
        userId,
        firstName,
        lastName,
        email,
        addresses: [],
      });

      this.logger.info(`New Customer Created`, { id: newCustomer._id });
      return res.json(newCustomer);
    }

    this.logger.info(`Customer is fetched`, { id: customer._id });
    res.json(customer);
  };

  addAddress = async (req: Request, res: Response, next: NextFunction) => {
    const { sub: userId } = req.auth;

    if (!req.params.id) {
      next(createHttpError(400, "Invalid url param!"));
      return;
    }

    const isCustomerExsist = await this.customerService.getCustomerInfo(userId);

    if (!isCustomerExsist) {
      next(createHttpError(400, "customer not found!"));
      return;
    }

    const customer = await this.customerService.updateAddress(
      userId,
      req.params.id,
      req.body.address,
    );

    this.logger.info(`Update Customer Address`, { id: customer._id });
    res.json(customer);
  };
}
