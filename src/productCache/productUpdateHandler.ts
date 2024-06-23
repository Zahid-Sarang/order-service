import createHttpError from "http-errors";
import { ProductMessage } from "../types";
import productCacheModel from "./productCacheModel";

export const handleProductUpdate = async (value: string) => {
  try {
    const product: ProductMessage = JSON.parse(value);
    return productCacheModel.updateOne(
      {
        productId: product._id,
      },
      {
        $set: {
          priceConfiguration: product.priceConfiguration,
        },
      },
      { upsert: true },
    );
  } catch (err) {
    const error = createHttpError(500, err);
    throw error;
  }
};
