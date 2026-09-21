"use client";

import { useRef, useState } from "react";
import { Camera, Check, ImagePlus, LockKeyhole, MoreHorizontal, Trash2 } from "lucide-react";
import Image from "next/image";
import { isComplete } from "@/lib/date-window";
import { MarkerPicker } from "@/components/marker-picker";
import type { Marker } from "@/lib/types";
import { compressImage } from "@/lib/compress-image";

type Props = { date: string; initialBody?: string; initialImages?: string[]; markers?: Marker[]; selectedMarkerIds?: string[]; editable: boolean };

export function JournalEditor({ date, initialBody = "", initialImages = [], markers = [], selectedMarkerIds = [], editable }: Props) {
  const [body, setBody] = useState(initialBody);
  const [images, setImages] = useState<{ url: string; name: string }[]>(initialImages.map((url, index) => ({ url, name: `Photo ${index + 1}` })));
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const save = async () => {
    setSaving(true);
    const response = await fetch(`/api/entries/${date}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ body }) });
    setSaving(false);
    if (response.ok) { setSaved(true); window.setTimeout(() => setSaved(false), 2000); }
  };
  const addFiles = async (files: FileList | null) => {
    if (!files || !editable) return;
    setSaving(true);
    for (const originalFile of Array.from(files)) {
      const file = await compressImage(originalFile);
      const data = new FormData();
      data.set("image", file);
      const response = await fetch(`/api/entries/${date}/images`, { method: "POST", body: data });
      if (response.ok) {
        const result = await response.json();
        setImages((current) => [...current, { url: result.url, name: file.name }]);
      }
    }
    setSaving(false);
  };

  if (!editable) return <section className="paper-shadow mx-auto max-w-3xl rounded-[2rem] border border-[#e8e9e2] bg-white p-7 sm:p-12"><div className="flex items-center gap-3 text-[#787b72]"><LockKeyhole size={17}/><span className="label">This day is now held</span></div><h1 className="mt-5 text-4xl font-semibold tracking-[-.07em]">{formattedDate}</h1><p className="mt-8 whitespace-pre-wrap text-[1.05rem] leading-8">{body || "Nothing was written for this day."}</p></section>;

  return (
    <section className="paper-shadow mx-auto max-w-3xl rounded-[2rem] border border-[#e8e9e2] bg-white p-6 sm:p-12">
      <div className="flex items-start justify-between gap-4"><div><p className="label mb-2">Today&apos;s mark</p><h1 className="text-3xl font-semibold tracking-[-.065em] sm:text-4xl">{formattedDate}</h1></div><button className="icon-button focus-ring" aria-label="Entry options"><MoreHorizontal size={18}/></button></div>
      <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What will you want to remember about today?" className="focus-ring mt-10 min-h-[240px] w-full resize-none border-0 bg-transparent text-lg leading-8 outline-none placeholder:text-[#b6b8af]" aria-label="Journal entry"/>
      <div className="mt-8 border-t border-[#e8e9e2] pt-7"><MarkerPicker markers={markers} selectedIds={selectedMarkerIds} date={date} editable={editable} compact/></div>
      <div className="mt-8 border-t border-[#e8e9e2] pt-7">
        <div className="mb-4 flex items-center justify-between"><div><p className="text-sm font-semibold">Three moments, or more.</p><p className="mt-1 text-sm text-[#787b72]">{images.length}/3 photos added</p></div><button onClick={() => input.current?.click()} className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#f1f2ed] px-4 py-2 text-sm font-semibold"><ImagePlus size={16}/> Add photos</button><input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(event) => addFiles(event.target.files)}/></div>
        <div className="grid grid-cols-3 gap-3">{images.map((image, index) => <div key={image.url} className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f1f2ed]"><Image src={image.url} alt={`Journal photo ${index + 1}`} fill unoptimized className="object-cover"/><button onClick={() => setImages((all) => all.filter((item) => item.url !== image.url))} className="absolute right-2 top-2 hidden h-8 w-8 place-items-center rounded-full bg-white/90 text-[#222420] group-hover:grid" aria-label={`Remove ${image.name}`}><Trash2 size={15}/></button></div>)}
          {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, index) => <button onClick={() => input.current?.click()} key={index} className="focus-ring grid aspect-square place-items-center rounded-2xl border border-dashed border-[#dfe1d9] text-[#a5a89e] transition hover:border-[#222420] hover:text-[#222420]" aria-label="Add a photo"><Camera size={20}/></button>)}</div>
      </div>
      <div className="mt-10 flex items-center justify-between border-t border-[#e8e9e2] pt-6"><p className="text-sm text-[#787b72]">{isComplete(body, images.length) ? "A complete day." : "Add your words and 3 photos to complete today."}</p><button onClick={save} disabled={saving} className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#222420] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saved ? <><Check size={16}/> Saved</> : saving ? "Saving…" : "Save day"}</button></div>
    </section>
  );
}
