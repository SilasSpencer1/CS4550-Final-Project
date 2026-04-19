import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const commentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    target: {
      kind: { type: String, enum: ["event", "tmEvent"], required: true },
      id: { type: String, required: true, index: true },
    },
    body: { type: String, required: true },
  },
  { timestamps: true }
);

commentSchema.index({ "target.kind": 1, "target.id": 1 });

export type CommentDoc = InferSchemaType<typeof commentSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const Comment: Model<CommentDoc> =
  (mongoose.models.Comment as Model<CommentDoc>) ||
  mongoose.model<CommentDoc>("Comment", commentSchema);
