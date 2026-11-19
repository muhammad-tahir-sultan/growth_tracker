import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Completion from "@/models/Completion";
import Task from "@/models/Task";

function key(d: Date) { return d.toISOString().slice(0, 10); }
export async function GET() {
  await connectDB();
  const tasks = await Task.find({ active: true }).lean();
  const rows = await Completion.find({}).lean();
  const today = key(new Date());
  const todayRows = rows.filter((r: any) => r.dateKey === today && r.done);
  const totalPoints = rows.reduce((sum: number, r: any) => sum + (r.pointsAwarded || 0), 0);
  const completedDays = new Set(rows.filter((r: any) => r.done).map((r: any) => r.dateKey));
  let streak = 0;
  const cursor = new Date();
  if (!completedDays.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (completedDays.has(key(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const dateKey = key(d);
    return { dateKey, completed: rows.filter((r: any) => r.dateKey === dateKey && r.done).length };
  });
  return NextResponse.json({
    taskCount: tasks.length, todayCompleted: todayRows.length,
    todayPoints: todayRows.reduce((s: number, r: any) => s + (r.pointsAwarded || 0), 0),
    totalPoints, streak, last7
  });
}