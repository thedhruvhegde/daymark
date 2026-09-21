import { redirect } from "next/navigation";
import { PhoneCompanion } from "@/components/phone-companion";
import { canEditEntry, todayInTimeZone } from "@/lib/date-window";
import { createClient } from "@/lib/supabase/server";

export default async function PhonePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const { data: profile } = await supabase.from("profiles").select("time_zone").eq("id", user.id).single();
  const timeZone = profile?.time_zone ?? "UTC";
  const date = todayInTimeZone(timeZone);
  const [{ data: markers }, { data: entry }] = await Promise.all([
    supabase.from("markers").select("id, name, color").eq("user_id", user.id).order("created_at"),
    supabase.from("journal_entries").select("id, journal_images(storage_path), entry_markers(marker_id)").eq("user_id", user.id).eq("entry_date", date).maybeSingle(),
  ]);
  const paths = entry?.journal_images.map((image) => image.storage_path) ?? [];
  const { data: signed } = paths.length ? await supabase.storage.from("journal-images").createSignedUrls(paths, 3600) : { data: [] };
  return <PhoneCompanion date={date} markers={markers ?? []} selectedMarkerIds={entry?.entry_markers.map((item) => item.marker_id) ?? []} initialImages={(signed ?? []).map((item) => item.signedUrl).filter((url): url is string => typeof url === "string")} editable={canEditEntry(date, timeZone)}/>;
}
