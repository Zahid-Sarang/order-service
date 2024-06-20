import customerModel from "./customerModel";

export class CustomerService {
  async getCustomerInfo(userId: string) {
    return await customerModel.findOne({ userId });
  }

  async addCustomer({ userId, firstName, lastName, email, address }) {
    return await customerModel.create({
      userId: userId,
      firstName,
      lastName,
      email,
      address,
    });
  }
}
