import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { date } = await request.json();
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: entry, error: entryError } = await supabase.from("journal_entries").upsert({ user_id: user.id, entry_date: date }, { onConflict: "user_id,entry_date" }).select("id").single();
  if (entryError || !entry) return NextResponse.json({ error: "Unable to create a paired session" }, { status: 400 });
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("pairing_sessions").insert({ entry_id: entry.id, user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  if (error) return NextResponse.json({ error: "Unable to create a paired session" }, { status: 400 });
  return NextResponse.json({ token, expiresAt });
}
