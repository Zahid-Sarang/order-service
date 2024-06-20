import { Response } from "express";
import { Request } from "express-jwt";
import customerModel from "./customerModel";

export class CustomerContoller {
  getCustomer = async (req: Request, res: Response) => {
    // todo: add these fields to jwt in auth service
    const { sub: userId, firstName, lastName, email } = req.auth;

    //todo:implement  service layer
    const customer = await customerModel.findOne({ userId });

    if (!customer) {
      const newCustomer = await customerModel.create({
        userId: userId,
        firstName,
        lastName,
        email,
        address: [],
        
      });
      // todo:add logging
      return res.json(newCustomer);
    }

    res.json(customer);
  };
}
