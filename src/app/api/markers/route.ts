import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await supabase.from("markers").select("id, name, color").eq("user_id", user.id).order("created_at");
  if (error) return NextResponse.json({ error: "Unable to load markers." }, { status: 400 });
  return NextResponse.json({ markers: data });
}

export async function POST(request: NextRequest) {
  const { name, color } = await request.json();
  const cleanName = typeof name === "string" ? name.trim() : "";
  if (!cleanName || cleanName.length > 40 || typeof color !== "string" || !isHexColor(color)) return NextResponse.json({ error: "Enter a valid name and color." }, { status: 400 });
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const { data, error } = await supabase.from("markers").insert({ user_id: user.id, name: cleanName, color }).select("id, name, color").single();
  if (error) return NextResponse.json({ error: "A marker with that name already exists." }, { status: 400 });
  return NextResponse.json({ marker: data });
}
