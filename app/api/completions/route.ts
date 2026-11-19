import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Completion from "@/models/Completion";
import Task from "@/models/Task";

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const filter: Record<string, unknown> = {};
  if (from && to) filter.dateKey = { $gte: from, $lte: to };
  const items = await Completion.find(filter).lean();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  await connectDB();
  const { taskId, dateKey, count, done } = await req.json();
  const task = await Task.findById(taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const safeCount = Math.max(0, Number(count) || 0);
  const isDone = Boolean(done) || safeCount >= task.target;
  const completion = await Completion.findOneAndUpdate(
    { taskId, dateKey },
    { count: safeCount, done: isDone, pointsAwarded: isDone ? task.points : 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json(completion);
}