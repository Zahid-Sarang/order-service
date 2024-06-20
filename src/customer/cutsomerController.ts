import { Response } from "express";
import { Request } from "express-jwt";
import { CustomerService } from "./customerService";
import { Logger } from "winston";

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
        address: [],
      });

      this.logger.info(`New Customer Created`, { id: newCustomer._id });
      return res.json(newCustomer);
    }

    this.logger.info(`Customer is fetched`, { id: customer._id });
    res.json(customer);
  };
}
