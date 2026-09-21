import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const { data: profile } = await supabase.from("profiles").select("first_name, last_name, time_zone").eq("id", user.id).single();
  return <main className="min-h-screen px-5 py-10"><SettingsForm email={user.email ?? ""} firstName={profile?.first_name ?? ""} lastName={profile?.last_name ?? ""} timeZone={profile?.time_zone ?? "UTC"}/></main>;
}
