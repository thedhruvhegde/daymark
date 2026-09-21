import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const { firstName, lastName, timeZone } = await request.json();
  if (typeof firstName !== "string" || typeof lastName !== "string" || typeof timeZone !== "string" || firstName.length > 60 || lastName.length > 60 || timeZone.length > 80) return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const displayName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const { error } = await supabase.from("profiles").update({ first_name: firstName.trim(), last_name: lastName.trim(), display_name: displayName, time_zone: timeZone }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Unable to save settings." }, { status: 400 });
  return NextResponse.json({ ok: true });
}
