export interface PaymentOptions {
  currency?: "inr";
  amount: number;
  orderId: string;
  tenantId: string;
  idempotencyKey: string;
}

export type GateWayPaymentStatus = "no_payment_required" | "paid" | "unpaid";

export interface PaymentSession {
  id: string;
  paymentUrl: string;
  paymentStatus: GateWayPaymentStatus;
}

export interface CustomeMetaData {
  orderId: string;
}

export interface VerifiedSession {
  id: string;
  metadata: CustomeMetaData;
  paymentStatus: GateWayPaymentStatus;
}

export interface PaymentGateway {
  createSession: (options: PaymentOptions) => Promise<PaymentSession>;
  getSession: (id: string) => Promise<VerifiedSession>;
}
