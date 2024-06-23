import mongoose from "mongoose";

const idempotencySchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
    },
    response: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true },
);
// todo: change expiration time to 48hr
idempotencySchema.index({ createdAt: 1 }, { expireAfterSeconds: 20 });
idempotencySchema.index({ key: 1 }, { unique: true });

export default mongoose.model("Idempotency", idempotencySchema);
