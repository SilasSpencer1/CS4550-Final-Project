import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const rsvpSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    status: {
      type: String,
      enum: ["going", "maybe", "invited", "requested"],
      default: "going",
    },
  },
  { timestamps: true }
);

rsvpSchema.index({ user: 1, event: 1 }, { unique: true });

export type RsvpDoc = InferSchemaType<typeof rsvpSchema> & { _id: mongoose.Types.ObjectId };
export const Rsvp: Model<RsvpDoc> =
  (mongoose.models.Rsvp as Model<RsvpDoc>) || mongoose.model<RsvpDoc>("Rsvp", rsvpSchema);
