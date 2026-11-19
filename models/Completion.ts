import mongoose, { Schema, models, model } from "mongoose";

const CompletionSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true, index: true },
  dateKey: { type: String, required: true, index: true },
  count: { type: Number, default: 1, min: 0 },
  done: { type: Boolean, default: false },
  pointsAwarded: { type: Number, default: 0 }
}, { timestamps: true });
CompletionSchema.index({ taskId: 1, dateKey: 1 }, { unique: true });

export default models.Completion || model("Completion", CompletionSchema);