import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function GET(_: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!validDate(date)) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await supabase.from("journal_entries").select("id, entry_date, body, updated_at, journal_images(id, storage_path, position)").eq("user_id", user.id).eq("entry_date", date).maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load entry." }, { status: 400 });
  return NextResponse.json({ entry: data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const { body } = await request.json();
  if (!validDate(date) || typeof body !== "string" || body.length > 250_000) return NextResponse.json({ error: "Invalid journal entry." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await supabase.from("journal_entries").upsert({ user_id: user.id, entry_date: date, body }, { onConflict: "user_id,entry_date" }).select("id, entry_date, body, updated_at").single();
  if (error) return NextResponse.json({ error: "This journal day is no longer editable." }, { status: 403 });
  return NextResponse.json({ entry: data });
}
