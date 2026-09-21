import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const { title } = await request.json();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof title !== "string" || !title.trim() || title.trim().length > 160) return NextResponse.json({ error: "Invalid task." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await supabase.from("daily_tasks").insert({ user_id: user.id, entry_date: date, title: title.trim() }).select("id, title, completed_at").single();
  if (error) return NextResponse.json({ error: "This day is no longer editable." }, { status: 403 });
  return NextResponse.json({ task: data });
}
