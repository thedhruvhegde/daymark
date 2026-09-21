"use client";

import Image from "next/image";
import { Camera, Check, Images, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { MarkerPicker } from "@/components/marker-picker";
import type { Marker } from "@/lib/types";
import { compressImage } from "@/lib/compress-image";

type Props = { date: string; markers: Marker[]; selectedMarkerIds: string[]; initialImages: string[]; editable: boolean };

export function PhoneCompanion({ date, markers, selectedMarkerIds, initialImages, editable }: Props) {
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initialImages);
  const [working, setWorking] = useState(false);
  async function upload(files: FileList | null) {
    if (!files || !editable) return;
    setWorking(true);
    for (const originalFile of Array.from(files)) {
      const file = await compressImage(originalFile);
      const data = new FormData();
      data.set("image", file);
      const response = await fetch(`/api/entries/${date}/images`, { method: "POST", body: data });
      if (response.ok) {
        const { url } = await response.json();
        setImages((current) => [...current, url]);
      }
    }
    setWorking(false);
  }
  return <main className="min-h-screen bg-[#f7f7f3] px-5 py-7"><section className="mx-auto max-w-md"><p className="label">Daymark / phone companion</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Today, in a few frames.</h1><p className="mt-3 text-sm leading-6 text-[#787b72]">Writing is kept on your desktop. Add photos and mark the moments here.</p><div className="mt-8"><MarkerPicker markers={markers} selectedIds={selectedMarkerIds} date={date} editable={editable}/></div><input ref={cameraInput} onChange={(event) => upload(event.target.files)} className="hidden" type="file" accept="image/*" capture="environment"/><input ref={libraryInput} onChange={(event) => upload(event.target.files)} className="hidden" type="file" accept="image/*" multiple/><div className="mt-6 grid gap-3"><button onClick={() => cameraInput.current?.click()} disabled={!editable || working} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl bg-[#222420] px-5 py-4 text-sm font-semibold text-white disabled:opacity-60">{working ? <LoaderCircle className="animate-spin" size={18}/> : <Camera size={18}/>} {working ? "Adding photo…" : "Take a photo"}</button><button onClick={() => libraryInput.current?.click()} disabled={!editable || working} className="focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dfe1d9] bg-white px-5 py-4 text-sm font-semibold text-[#222420] disabled:opacity-60"><Images size={18}/> Choose from library</button></div><div className="mt-8 grid grid-cols-3 gap-3">{images.map((url, index) => <div key={url} className="relative aspect-square overflow-hidden rounded-2xl bg-white"><Image src={url} alt={`Day photo ${index + 1}`} fill unoptimized className="object-cover"/></div>)}</div><div className="mt-7 flex gap-2">{[0, 1, 2].map((item) => <span key={item} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${item < images.length ? "bg-[#d9f16d] text-[#222420]" : "bg-white text-[#a5a89e]"}`}>{item < images.length ? <Check size={15}/> : item + 1}</span>)}</div></section></main>;
}
