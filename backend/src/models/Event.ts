import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const eventSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    location: {
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["user", "organizer", "gcal_import"],
      default: "user",
    },
    visibility: {
      type: String,
      enum: ["busy", "friends", "public"],
      default: "friends",
    },
    tags: { type: [String], default: [] },
    maxAttendees: { type: Number, default: null },
  },
  { timestamps: true }
);

export type EventDoc = InferSchemaType<typeof eventSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Event: Model<EventDoc> =
  (mongoose.models.Event as Model<EventDoc>) || mongoose.model<EventDoc>("Event", eventSchema);
