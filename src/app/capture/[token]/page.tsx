"use client";

import { Camera, Check, Images, LoaderCircle } from "lucide-react";
import { use, useRef, useState } from "react";
import { Mark } from "@/components/brand";
import { compressImage } from "@/lib/compress-image";

export default function CapturePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const cameraInput = useRef<HTMLInputElement>(null);
  const libraryInput = useRef<HTMLInputElement>(null);
  const [count, setCount] = useState(0);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("Add at least three moments from today.");
  async function upload(files: FileList | null) {
    if (!files) return;
    setWorking(true);
    for (const originalFile of Array.from(files)) {
      const file = await compressImage(originalFile);
      const data = new FormData(); data.set("token", token); data.set("image", file);
      const response = await fetch("/api/capture", { method: "POST", body: data });
      if (!response.ok) { setMessage((await response.json()).error ?? "Upload failed."); break; }
      setCount((value) => value + 1);
    }
    setWorking(false); setMessage("Your desktop will update automatically.");
  }
  return <main className="min-h-screen bg-[#f7f7f3] px-5 py-7"><header className="flex justify-center"><Mark className="h-8 w-8 text-[#d9f16d]"/></header><section className="mx-auto mt-12 max-w-sm text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.5rem] bg-[#222420] text-[#d9f16d]"><Camera size={27}/></div><p className="label mt-7">Phone companion</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.065em]">Today, in three frames.</h1><p className="mt-3 text-sm leading-6 text-[#787b72]">{message}</p><input ref={cameraInput} onChange={(event) => upload(event.target.files)} className="hidden" type="file" accept="image/*" capture="environment"/><input ref={libraryInput} onChange={(event) => upload(event.target.files)} className="hidden" type="file" accept="image/*" multiple/><div className="mt-8 grid gap-3"><button onClick={() => cameraInput.current?.click()} disabled={working} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#222420] px-5 py-4 text-sm font-semibold text-white disabled:opacity-60">{working ? <LoaderCircle className="animate-spin" size={18}/> : <Camera size={18}/>} {working ? "Adding photo…" : "Take a photo"}</button><button onClick={() => libraryInput.current?.click()} disabled={working} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#dfe1d9] bg-white px-5 py-4 text-sm font-semibold text-[#222420] disabled:opacity-60"><Images size={18}/> Choose from library</button></div><div className="mt-7 flex justify-center gap-2">{[0,1,2].map((item) => <span key={item} className={`grid h-8 w-8 place-items-center rounded-full text-xs font-semibold ${item < count ? "bg-[#d9f16d] text-[#222420]" : "bg-white text-[#a5a89e]"}`}>{item < count ? <Check size={15}/> : item + 1}</span>)}</div></section></main>;
}
