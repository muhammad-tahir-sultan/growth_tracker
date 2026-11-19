import mongoose, { Schema, models, model } from "mongoose";

const TaskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, default: "Daily outreach" },
  description: { type: String, default: "" },
  target: { type: Number, default: 1, min: 1 },
  unit: { type: String, default: "completion" },
  points: { type: Number, default: 10, min: 0 },
  frequency: { type: String, enum: ["daily", "every-2-days", "weekly"], default: "daily" },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

export default models.Task || model("Task", TaskSchema);