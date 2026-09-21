import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const weekStart = (date: Date) => { const copy = new Date(date); copy.setDate(copy.getDate() - ((copy.getDay() + 6) % 7)); return copy; };
const key = (date: Date) => date.toISOString().slice(0, 10);

export default async function ReviewPage({ searchParams }: { searchParams: Promise<{ week?: string }> }) {
  const { week } = await searchParams;
  const start = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? new Date(`${week}T12:00:00`) : weekStart(new Date());
  const end = new Date(start); end.setDate(end.getDate() + 6);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  const [entriesResult, tasksResult, reflectionsResult] = await Promise.all([
    supabase.from("journal_entries").select("entry_date, body, journal_images(id), entry_markers(markers(name, color))").eq("user_id", user.id).gte("entry_date", key(start)).lte("entry_date", key(end)),
    supabase.from("daily_tasks").select("id, completed_at").eq("user_id", user.id).gte("entry_date", key(start)).lte("entry_date", key(end)),
    supabase.from("daily_reflections").select("mood, energy").eq("user_id", user.id).gte("entry_date", key(start)).lte("entry_date", key(end)),
  ]);
  const entries = entriesResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const reflections = reflectionsResult.data ?? [];
  const photoCount = entries.reduce((sum, entry) => sum + entry.journal_images.length, 0);
  const wordCount = entries.reduce((sum, entry) => sum + entry.body.trim().split(/\s+/).filter(Boolean).length, 0);
  const markerCounts = new Map<string, { count: number; color: string }>();
  entries.forEach((entry) => entry.entry_markers.forEach((item) => item.markers.forEach((marker) => markerCounts.set(marker.name, { count: (markerCounts.get(marker.name)?.count ?? 0) + 1, color: marker.color }))));
  const bestMarker = [...markerCounts.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  const averageMood = reflections.length ? (reflections.reduce((sum, item) => sum + (item.mood ?? 0), 0) / reflections.length).toFixed(1) : "—";
  const previous = new Date(start); previous.setDate(previous.getDate() - 7);
  const next = new Date(start); next.setDate(next.getDate() + 7);
  return <main className="min-h-screen px-5 py-8 sm:px-8"><section className="mx-auto max-w-5xl"><div className="flex items-center justify-between"><Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Back to days</Link><div className="flex gap-2 text-sm font-semibold"><Link href={`/review?week=${key(previous)}`} className="focus-ring rounded-full border border-[#e8e9e2] bg-white px-4 py-2">Earlier</Link><Link href={`/review?week=${key(next)}`} className="focus-ring rounded-full border border-[#e8e9e2] bg-white px-4 py-2">Later</Link></div></div><p className="label mt-12">Weekly review</p><h1 className="mt-2 text-5xl font-semibold tracking-[-.075em]">{start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h1><p className="mt-4 text-[#787b72]">A calm look at what you made space for.</p><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Journal days", value: `${entries.length}/7` }, { label: "Words kept", value: wordCount.toLocaleString() }, { label: "Photos saved", value: photoCount.toString() }, { label: "Tasks complete", value: `${tasks.filter((task) => task.completed_at).length}/${tasks.length}` }].map((stat) => <article key={stat.label} className="paper-shadow rounded-3xl border border-[#e8e9e2] bg-white p-6"><p className="label">{stat.label}</p><p className="mt-3 text-4xl font-semibold tracking-[-.06em]">{stat.value}</p></article>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><article className="paper-shadow rounded-3xl border border-[#e8e9e2] bg-white p-7"><p className="label">Consistency</p><p className="mt-3 text-2xl font-semibold tracking-[-.05em]">{bestMarker ? <><span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ background: bestMarker[1].color }}/>{bestMarker[0]} showed up {bestMarker[1].count} times.</> : "Your markers will tell a story here."}</p></article><article className="paper-shadow rounded-3xl border border-[#e8e9e2] bg-white p-7"><p className="label">Average mood</p><p className="mt-3 text-5xl font-semibold tracking-[-.06em]">{averageMood}<span className="text-xl text-[#787b72]"> / 5</span></p><p className="mt-3 text-sm text-[#787b72]">Captured across {reflections.length} daily check-ins.</p></article></div></section></main>;
}
