import Link from "next/link";
import { ArrowLeft, Smartphone } from "lucide-react";
import { JournalEditor } from "@/components/journal-editor";
import { Mark } from "@/components/brand";
import { canEditEntry } from "@/lib/date-window";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DailySignals } from "@/components/daily-signals";

export default async function JournalPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!validDate) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const [{ data: profile }, { data: entry }, { data: markers }, { data: reflection }, { data: tasks }] = await Promise.all([
    supabase.from("profiles").select("time_zone").eq("id", user.id).single(),
    supabase.from("journal_entries").select("id, body, journal_images(id, storage_path, position), entry_markers(marker_id)").eq("user_id", user.id).eq("entry_date", date).maybeSingle(),
    supabase.from("markers").select("id, name, color").eq("user_id", user.id).order("created_at"),
    supabase.from("daily_reflections").select("mood, energy, prompt_answer").eq("user_id", user.id).eq("entry_date", date).maybeSingle(),
    supabase.from("daily_tasks").select("id, title, completed_at").eq("user_id", user.id).eq("entry_date", date).order("created_at"),
  ]);
  const paths = entry?.journal_images.map((image) => image.storage_path) ?? [];
  const { data: signed } = paths.length ? await supabase.storage.from("journal-images").createSignedUrls(paths, 3600) : { data: [] };
  const imageUrls = (signed ?? []).map((image) => image.signedUrl).filter((url): url is string => typeof url === "string");
  const editable = canEditEntry(date, profile?.time_zone ?? "UTC");
  return <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-8"><header className="mx-auto mb-10 flex max-w-6xl items-center justify-between"><Link href="/" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={17}/> All days</Link><Mark className="h-7 w-7 text-[#d9f16d]"/>{editable ? <Link href={`/pair/${date}`} className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#e8e9e2] bg-white px-4 py-2.5 text-sm font-semibold"><Smartphone size={16}/> Add from phone</Link> : <span className="text-sm text-[#787b72]">Held in your archive</span>}</header><div className="mx-auto max-w-3xl"><JournalEditor date={date} initialBody={entry?.body} initialImages={imageUrls} markers={markers ?? []} selectedMarkerIds={entry?.entry_markers.map((assignment) => assignment.marker_id) ?? []} editable={editable}/><section className="paper-shadow mt-6 rounded-[2rem] border border-[#e8e9e2] bg-white p-6 sm:p-10"><DailySignals date={date} editable={editable} mood={reflection?.mood} energy={reflection?.energy} promptAnswer={reflection?.prompt_answer} initialTasks={tasks ?? []}/></section></div></main>;
}
