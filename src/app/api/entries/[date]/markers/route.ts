import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function PUT(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const { markerId, assigned } = await request.json();
  if (!validDate(date) || typeof markerId !== "string" || typeof assigned !== "boolean") return NextResponse.json({ error: "Invalid marker request." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: entry, error: entryError } = await supabase.from("journal_entries").upsert({ user_id: user.id, entry_date: date }, { onConflict: "user_id,entry_date" }).select("id").single();
  if (entryError || !entry) return NextResponse.json({ error: "This day is no longer editable." }, { status: 403 });
  if (assigned) {
    const { error } = await supabase.from("entry_markers").upsert({ entry_id: entry.id, marker_id: markerId, user_id: user.id }, { onConflict: "entry_id,marker_id" });
    if (error) return NextResponse.json({ error: "Marker could not be applied." }, { status: 400 });
  } else {
    const { error } = await supabase.from("entry_markers").delete().eq("entry_id", entry.id).eq("marker_id", markerId);
    if (error) return NextResponse.json({ error: "Marker could not be removed." }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
