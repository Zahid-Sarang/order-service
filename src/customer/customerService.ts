import customerModel from "./customerModel";

export class CustomerService {
  async getCustomerInfo(userId: string) {
    return await customerModel.findOne({ userId });
  }

  async addCustomer({ userId, firstName, lastName, email, addresses }) {
    return await customerModel.create({
      userId: userId,
      firstName,
      lastName,
      email,
      addresses,
    });
  }

  async updateAddress(userId: string, customerId: string, address: string) {
    return await customerModel.findOneAndUpdate(
      {
        _id: customerId,
        userId: userId,
      },
      {
        $push: {
          addresses: {
            text: address,
            isDefault: false, // TODO: implement in the future
          },
        },
      },
      { new: true },
    );
  }
}
