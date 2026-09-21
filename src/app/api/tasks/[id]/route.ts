import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { completed } = await request.json();
  if (typeof completed !== "boolean") return NextResponse.json({ error: "Invalid task." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { error } = await supabase.from("daily_tasks").update({ completed_at: completed ? new Date().toISOString() : null }).eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: "Task could not be updated." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
