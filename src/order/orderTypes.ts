import mongoose from "mongoose";
import { CartItem } from "../types";

export enum PaymentMode {
  CARD = "card",
  CASH = "cash",
}

export enum OrderStatus {
  RECEIVED = "received",
  CONFIRMED = "confirmed",
  PREPARING = "preparing",
  READY_FOR_DELIVERY = "ready_for_discovery",
  OUT_FOR_DELIVERY = "out_of_discovery",
  DELIVERED = "delivered",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
}

export interface Order {
  cart: CartItem[];
  customerId: mongoose.Types.ObjectId;
  total: number;
  discount: number;
  taxes: number;
  deliveryCharges: number;
  address: string;
  tenantId: string;
  comment?: string;
  paymentMode: PaymentMode;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string;
}