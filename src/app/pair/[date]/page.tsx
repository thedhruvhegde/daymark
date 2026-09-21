"use client";

import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export default function PairPage({ params }: { params: Promise<{ date: string }> }) {
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState("");
  const [date, setDate] = useState<string>();
  useEffect(() => {
    params.then(async ({ date: day }) => {
      setDate(day);
      const response = await fetch("/api/pair", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ date: day }) });
      if (response.ok) setToken((await response.json()).token);
    });
  }, [params]);
  const url = typeof window === "undefined" ? "" : `${window.location.origin}/capture/${token}?date=${date ?? ""}`;
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="paper-shadow w-full max-w-md rounded-[2rem] border border-[#e8e9e2] bg-white p-7 text-center sm:p-10"><Link href={date ? `/journal/${date}` : "/"} className="focus-ring mb-9 inline-flex items-center gap-2 self-start text-sm font-semibold"><ArrowLeft size={16}/> Back to your day</Link><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#d9f16d]"><Smartphone size={24}/></div><p className="label mt-6">Phone companion</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.065em]">Bring in today&apos;s photos.</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#787b72]">Point your phone camera at this code. It opens a private camera companion for this day.</p><div className="mx-auto my-8 grid w-fit place-items-center rounded-3xl border border-[#e8e9e2] p-5">{url && <QRCodeSVG value={url} size={196} bgColor="#ffffff" fgColor="#222420" includeMargin={false}/>}</div><button onClick={() => setConnected(true)} className="focus-ring inline-flex items-center gap-2 rounded-full bg-[#222420] px-5 py-3 text-sm font-semibold text-white">{connected ? <><CheckCircle2 size={16}/> Connected</> : "I’ve opened it on my phone"}</button><p className="mt-5 text-xs text-[#a5a89e]">This code expires in 10 minutes.</p></section></main>;
}
