import createHttpError from "http-errors";
import { ToppingMessage } from "../types";
import toppingCacheModel from "./toppingCacheModel";

export const handleToppingUpdate = async (value: string) => {
  try {
    const topping: ToppingMessage = JSON.parse(value);

    return await toppingCacheModel.updateOne(
      {
        toppingId: topping._id,
      },
      {
        $set: {
          price: topping.price,
          tenantId: topping.tenantId,
        },
      },
      { upsert: true },
    );
  } catch (err) {
    const error = createHttpError(500, err);
    throw error;
  }
};
