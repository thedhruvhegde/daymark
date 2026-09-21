"use client";

import { Check, Plus } from "lucide-react";
import { useState } from "react";
import type { Marker } from "@/lib/types";

const palette = ["#ef8f8b", "#f4b860", "#e7d769", "#b8d978", "#73cdb4", "#7eb9e7", "#a997e5", "#dc92bd"];

type Props = {
  markers: Marker[];
  selectedIds?: string[];
  date?: string;
  editable?: boolean;
  compact?: boolean;
};

export function MarkerPicker({ markers: initialMarkers, selectedIds = [], date, editable = true, compact = false }: Props) {
  const [markers, setMarkers] = useState(initialMarkers);
  const [selected, setSelected] = useState(new Set(selectedIds));
  const [name, setName] = useState("");
  const [color, setColor] = useState(palette[0]);
  const [showCreate, setShowCreate] = useState(false);

  async function createMarker() {
    const response = await fetch("/api/markers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, color }) });
    if (!response.ok) return;
    const { marker } = await response.json();
    setMarkers((current) => [...current, marker]);
    setName("");
    setShowCreate(false);
  }

  async function toggle(marker: Marker) {
    if (!date || !editable) return;
    const assigned = !selected.has(marker.id);
    const response = await fetch(`/api/entries/${date}/markers`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ markerId: marker.id, assigned }) });
    if (!response.ok) return;
    setSelected((current) => {
      const next = new Set(current);
      if (assigned) next.add(marker.id); else next.delete(marker.id);
      return next;
    });
  }

  return <section className={compact ? "" : "paper-shadow rounded-[2rem] border border-[#e8e9e2] bg-white p-6 sm:p-8"}>
    <div className="flex items-center justify-between gap-4"><div><p className="label">Set a marker</p><p className="mt-1 text-sm text-[#787b72]">{date ? "Make this day easier to recognize." : "Create a color for the things you return to."}</p></div>{editable && <button onClick={() => setShowCreate((value) => !value)} className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#222420] px-4 py-2 text-sm font-semibold text-white"><Plus size={15}/> Add</button>}</div>
    {showCreate && <div className="mt-5 rounded-2xl bg-[#f7f7f3] p-4"><input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} placeholder="e.g. Gym" className="focus-ring w-full rounded-xl border border-[#e8e9e2] bg-white px-3 py-2.5 text-sm outline-none"/><div className="mt-4 flex flex-wrap items-center gap-2">{palette.map((item) => <button key={item} onClick={() => setColor(item)} className={`focus-ring grid h-8 w-8 place-items-center rounded-full ${color === item ? "ring-2 ring-[#222420] ring-offset-2" : ""}`} style={{ background: item }} aria-label={`Choose ${item}`}>{color === item && <Check size={14}/>}</button>)}<label className={`focus-ring grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-dashed border-[#787b72] ${!palette.includes(color) ? "ring-2 ring-[#222420] ring-offset-2" : ""}`} aria-label="Choose a custom color"><Plus size={15}/><input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="sr-only"/></label></div><button onClick={createMarker} disabled={!name.trim()} className="focus-ring mt-4 rounded-full bg-[#222420] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Save marker</button></div>}
    <div className="mt-5 flex flex-wrap gap-2">{markers.length ? markers.map((marker) => <button key={marker.id} disabled={!date || !editable} onClick={() => toggle(marker)} className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${selected.has(marker.id) ? "border-[#222420] bg-[#f7f7f3]" : "border-[#e8e9e2] bg-white"} disabled:cursor-default`}><span className="h-2.5 w-2.5 rounded-full" style={{ background: marker.color }}/>{marker.name}{selected.has(marker.id) && <Check size={14}/>}</button>) : <p className="text-sm text-[#787b72]">Create your first marker for gym, reading, friends, or anything else.</p>}</div>
  </section>;
}
