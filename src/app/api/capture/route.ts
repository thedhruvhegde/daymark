import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

async function sessionFor(token: string) {
  const admin = createAdminClient();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data } = await admin.from("pairing_sessions").select("id, entry_id, user_id, expires_at, consumed_at").eq("token_hash", tokenHash).is("consumed_at", null).maybeSingle();
  if (!data || new Date(data.expires_at) < new Date()) return null;
  return { admin, session: data };
}

export async function GET(request: NextRequest) {
  const session = await sessionFor(request.nextUrl.searchParams.get("token") ?? "");
  if (!session) return NextResponse.json({ error: "This companion link has expired." }, { status: 410 });
  return NextResponse.json({ entryId: session.session.entry_id });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = form.get("token");
  const file = form.get("image");
  if (typeof token !== "string" || !(file instanceof File) || !file.type.startsWith("image/") || file.size > 12_000_000) return NextResponse.json({ error: "Use an image smaller than 12 MB." }, { status: 400 });
  const result = await sessionFor(token);
  if (!result) return NextResponse.json({ error: "This companion link has expired." }, { status: 410 });
  const path = `${result.session.user_id}/${result.session.entry_id}/${randomUUID()}.jpg`;
  const { error: uploadError } = await result.admin.storage.from("journal-images").upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Upload failed." }, { status: 400 });
  const { data: last } = await result.admin.from("journal_images").select("position").eq("entry_id", result.session.entry_id).order("position", { ascending: false }).limit(1).maybeSingle();
  const { data: image, error } = await result.admin.from("journal_images").insert({ entry_id: result.session.entry_id, user_id: result.session.user_id, storage_path: path, position: (last?.position ?? -1) + 1 }).select().single();
  if (error) return NextResponse.json({ error: "Photo record failed." }, { status: 400 });
  return NextResponse.json({ image });
}
