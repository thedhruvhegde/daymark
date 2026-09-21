import Link from "next/link";
import { ArrowUpRight, Bell, Download, Sparkles } from "lucide-react";
import { Calendar } from "@/components/calendar";
import { Wordmark } from "@/components/brand";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const [{ data: profile }, { data: rawEntries }] = await Promise.all([
    supabase.from("profiles").select("display_name, time_zone").eq("id", user.id).single(),
    supabase.from("journal_entries").select("id, entry_date, body, updated_at, journal_images(id, storage_path, position)").eq("user_id", user.id).order("entry_date"),
  ]);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: profile?.time_zone ?? "UTC" }).format(new Date());
  const entries = (rawEntries ?? []).map((entry) => ({ id: entry.id, entryDate: entry.entry_date, body: entry.body, updatedAt: entry.updated_at, images: (entry.journal_images ?? []).map((image) => ({ id: image.id, path: image.storage_path, position: image.position })), status: entry.body.trim() && entry.journal_images.length >= 3 ? "complete" as const : "draft" as const }));
  const name = profile?.display_name || user.email?.split("@")[0] || "there";
  return (
    <main className="min-h-screen px-4 py-4 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12 flex items-center justify-between"><Wordmark/><div className="flex items-center gap-2"><Link href="/export" className="icon-button focus-ring" aria-label="Export journal"><Download size={17}/></Link><button className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-[#222420] text-sm font-semibold text-white" aria-label="Account">D</button></div></header>
        <section className="mb-10 grid gap-7 lg:grid-cols-[1fr_310px]">
          <div className="rounded-[2rem] bg-[#222420] px-7 py-9 text-white sm:px-10 sm:py-11">
            <p className="mb-7 flex items-center gap-2 text-sm text-white/55"><Sparkles size={15} className="text-[#d9f16d]"/> A quiet place for the days that matter.</p>
            <h1 className="max-w-xl text-4xl font-semibold leading-[.98] tracking-[-.075em] sm:text-6xl">Good evening,<br/><span className="text-[#d9f16d]">{name}.</span></h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">September 20 is still yours. Take a moment to leave a mark.</p>
            <Link href={`/journal/${today}`} className="focus-ring mt-8 inline-flex items-center gap-3 rounded-full bg-[#d9f16d] px-5 py-3 text-sm font-semibold text-[#222420] transition hover:bg-[#e6fa90]">Write today <ArrowUpRight size={16}/></Link>
          </div>
          <aside className="paper-shadow flex flex-col justify-between rounded-[2rem] border border-[#e8e9e2] bg-white p-7">
            <div><div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-[#ffdf85]"><Bell size={19}/></div><p className="label">Gentle rhythm</p><h2 className="mt-2 text-xl font-semibold tracking-[-.05em]">A reminder at 8:30 PM.</h2><p className="mt-3 text-sm leading-relaxed text-[#787b72]">We&apos;ll send it to your phone once it&apos;s connected.</p></div>
            <button className="focus-ring mt-8 self-start text-sm font-semibold underline decoration-[#d9f16d] decoration-4 underline-offset-4">Set your rhythm</button>
          </aside>
        </section>
        <Calendar entries={entries}/>
        <footer className="py-8 text-center text-xs text-[#787b72]">Made for showing up, one day at a time.</footer>
      </div>
    </main>
  );
}
