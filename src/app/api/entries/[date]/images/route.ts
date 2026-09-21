import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const form = await request.formData();
  const file = form.get("image");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !(file instanceof File) || !file.type.startsWith("image/") || file.size > 12_000_000) return NextResponse.json({ error: "Use an image smaller than 12 MB." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data: entry, error: entryError } = await supabase.from("journal_entries").upsert({ user_id: user.id, entry_date: date }, { onConflict: "user_id,entry_date" }).select("id").single();
  if (entryError || !entry) return NextResponse.json({ error: "This journal day is no longer editable." }, { status: 403 });
  const path = `${user.id}/${entry.id}/${randomUUID()}.jpg`;
  const { error: uploadError } = await supabase.storage.from("journal-images").upload(path, file, { contentType: file.type });
  if (uploadError) return NextResponse.json({ error: "Photo upload failed." }, { status: 400 });
  const { data: latest } = await supabase.from("journal_images").select("position").eq("entry_id", entry.id).order("position", { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from("journal_images").insert({ entry_id: entry.id, user_id: user.id, storage_path: path, position: (latest?.position ?? -1) + 1 });
  if (error) return NextResponse.json({ error: "Photo could not be saved." }, { status: 400 });
  const { data: signed } = await supabase.storage.from("journal-images").createSignedUrl(path, 3600);
  return NextResponse.json({ url: signed?.signedUrl });
}
