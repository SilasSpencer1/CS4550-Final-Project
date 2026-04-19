import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "organizer"], default: "user" },
    displayName: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    interests: { type: [String], default: [] },
    location: {
      city: { type: String, default: "" },
      state: { type: String, default: "" },
    },
    defaultPrivacy: {
      type: String,
      enum: ["busy", "friends", "public"],
      default: "friends",
    },
    google: {
      refreshToken: { type: String, default: null },
      lastSyncAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User: Model<UserDoc> =
  (mongoose.models.User as Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema);
