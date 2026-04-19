import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const friendshipSchema = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export type FriendshipDoc = InferSchemaType<typeof friendshipSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Friendship: Model<FriendshipDoc> =
  (mongoose.models.Friendship as Model<FriendshipDoc>) ||
  mongoose.model<FriendshipDoc>("Friendship", friendshipSchema);
