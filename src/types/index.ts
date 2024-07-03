import { Request } from "express";
import mongoose from "mongoose";

export type AuthCookie = {
  accessToken: string;
};

export interface AuthRequest extends Request {
  auth: {
    sub: string;
    role: string;
    id?: string;
    tenant: string;
  };
}

export interface PriceConfiguration {
  priceType: "base" | "aditional";
  availableOptions: {
    [key: string]: number;
  };
}

export interface ProductPricingCache {
  productId: string;
  priceConfiguration: PriceConfiguration;
}

export enum ProductEvents {
  PRODUCT_CREATE = "PRODUCT_CREATE",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PRODUCT_DELETE = "PRODUCT_DELETE",
}

export enum ToppingEvents {
  TOPPING_CREATE = "TOPPING_CREATE",
  TOPPING_UPDATE = "TOPPING_UPDATE",
  TOPPING_DELETE = "TOPPING_DELETE",
}

export interface ProductMessage {
  event_type: ProductEvents;
  data: {
    _id: string;
    priceConfiguration: PriceConfiguration;
  };
}

export interface ToppingMessage {
  event_type: ToppingEvents;
  data: {
    _id: string;
    price: number;
    tenantId: string;
  };
}

export interface ToppingPriceCache {
  _id: mongoose.Types.ObjectId;
  toppingId: string;
  price: number;
  tenantId: string;
}

export interface ProductPriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: {
      [key: string]: number;
    };
  };
}

export type Product = {
  _id: string;
  name: string;
  image: string;
  description: string;
  priceConfiguration: ProductPriceConfiguration;
};

export type Topping = {
  _id: string;
  name: string;
  price: number;
  image: string;
};

export interface CartItem
  extends Pick<Product, "_id" | "name" | "image" | "priceConfiguration"> {
  chosenConfiguration: {
    priceConfiguration: {
      [key: string]: string;
    };
    selectedToppings: Topping[];
  };
  qty: number;
  hash?: string;
}

export enum ROLES {
  ADMIN = "admin",
  CUSTOMER = "customer",
  MANAGER = "manager",
}

export interface Filter {
  tenantId?: string;
}

export interface PaginateQuery {
  page: number;
  limit: number;
}
