import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const { mood, energy, promptAnswer } = await request.json();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || ![1, 2, 3, 4, 5, null].includes(mood) || ![1, 2, 3, 4, 5, null].includes(energy) || typeof promptAnswer !== "string" || promptAnswer.length > 5000) return NextResponse.json({ error: "Invalid reflection." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { error } = await supabase.from("daily_reflections").upsert({ user_id: user.id, entry_date: date, mood, energy, prompt_answer: promptAnswer }, { onConflict: "user_id,entry_date" });
  if (error) return NextResponse.json({ error: "This day is no longer editable." }, { status: 403 });
  return NextResponse.json({ ok: true });
}
