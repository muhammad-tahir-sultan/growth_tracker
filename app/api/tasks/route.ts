import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { seedTasks } from "@/lib/seed";
import Task from "@/models/Task";

export async function GET() {
  await seedTasks();
  const tasks = await Task.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean();
  return NextResponse.json(tasks);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
  const task = await Task.create({
    title: body.title, category: body.category || "General",
    description: body.description || "", target: Math.max(1, Number(body.target) || 1),
    unit: body.unit || "completion", points: Math.max(0, Number(body.points) || 0),
    frequency: body.frequency || "daily"
  });
  return NextResponse.json(task, { status: 201 });
}