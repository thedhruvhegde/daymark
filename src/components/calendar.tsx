"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import type { JournalEntry } from "@/lib/types";

type Props = { entries: JournalEntry[]; month?: Date };

export function Calendar({ entries, month = new Date() }: Props) {
  const start = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (start.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const dateKey = (day: number) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const byDate = new Map(entries.map((entry) => [entry.entryDate, entry]));
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth();

  return (
    <section className="paper-shadow rounded-[2rem] border border-[#e8e9e2] bg-white p-5 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div><p className="label mb-1">Your days</p><h2 className="text-xl font-semibold tracking-[-.05em]">{month.toLocaleString("en", { month: "long", year: "numeric" })}</h2></div>
        <div className="flex gap-2"><button className="icon-button focus-ring" aria-label="Previous month"><ChevronLeft size={18}/></button><button className="icon-button focus-ring" aria-label="Next month"><ChevronRight size={18}/></button></div>
      </div>
      <div className="mb-3 grid grid-cols-7 text-center">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => <span key={day} className="label">{day}</span>)}</div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {Array.from({ length: startOffset }).map((_, index) => <div key={`empty-${index}`} />)}
        {Array.from({ length: days }, (_, index) => {
          const day = index + 1;
          const key = dateKey(day);
          const entry = byDate.get(key);
          const current = isCurrentMonth && day === today.getDate();
          const past = new Date(`${key}T23:59:59`) < today;
          return <Link key={key} href={`/journal/${key}`} aria-label={`Open ${key}`} className={`focus-ring aspect-square rounded-2xl border p-2 transition sm:p-3 ${current ? "border-[#222420] bg-[#d9f16d]" : entry ? "border-[#e8e9e2] bg-[#f7f7f3] hover:border-[#222420]" : "border-transparent hover:border-[#e8e9e2]"} ${past && !entry ? "text-[#b6b8af]" : ""}`}>
            <div className="flex h-full flex-col justify-between"><span className="text-sm font-medium">{day}</span>{entry ? <span className={`h-1.5 w-1.5 rounded-full ${entry.status === "complete" ? "bg-[#222420]" : "bg-[#ffdf85]"}`} /> : current ? <Plus size={15}/>: null}</div>
          </Link>;
        })}
      </div>
      <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#787b72]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#222420]"/>Complete</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#ffdf85]"/>Draft</span><span>Entries close 24 hours after each day ends.</span></div>
    </section>
  );
}
