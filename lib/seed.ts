import { connectDB } from "./db";
import Task from "@/models/Task";

const defaults = [
  ["Send 10 Facebook friend requests — ID 1", "Facebook", 10, "requests", 5, "daily"],
  ["Send 10 Facebook friend requests — ID 2", "Facebook", 10, "requests", 5, "daily"],
  ["Post in 5 Facebook groups — ID 1", "Facebook groups", 5, "posts", 10, "daily"],
  ["Post in 5 Facebook groups — ID 2", "Facebook groups", 5, "posts", 10, "daily"],
  ["Help community in Facebook groups", "Community", 5, "meaningful comments", 10, "daily"],
  ["Send LinkedIn connections — ID 1", "LinkedIn", 10, "connections", 10, "every-2-days"],
  ["Engage on LinkedIn posts", "LinkedIn", 10, "comments / likes", 5, "daily"],
  ["Gmail outreach for web development clients", "Email outreach", 10, "emails", 10, "daily"],
  ["Follow up with prospects when due", "Follow-ups", 5, "follow-ups", 10, "daily"],
  ["Focused learning", "Learning", 1, "hour", 15, "daily"]
] as const;

export async function seedTasks() {
  await connectDB();
  const count = await Task.countDocuments();
  if (count > 0) return;
  await Task.insertMany(defaults.map(([title, category, target, unit, points, frequency], i) => ({
    title, category, target, unit, points, frequency, sortOrder: i
  })));
}