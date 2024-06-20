import mongoose from "mongoose";
import { Address, Customer } from "./customerTypes";

const addressSchema = new mongoose.Schema<Address>(
  {
    text: {
      type: "string",
      required: true,
    },
    isDefault: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { _id: false },
);

const customerSchema = new mongoose.Schema<Customer>(
  {
    userId: {
      type: "string",
      required: true,
    },
    firstName: {
      type: "string",
      required: true,
    },
    lastName: {
      type: "string",
      required: true,
    },
    email: {
      type: "string",
      required: true,
    },
    address: {
      type: [addressSchema],
      required: false,
    },
    
  },
  { timestamps: true },
);

export default mongoose.model("Customer", customerSchema);
