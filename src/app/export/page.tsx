import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Wordmark } from "@/components/brand";

export default function ExportPage() {
  return <main className="grid min-h-screen place-items-center px-5 py-10"><section className="paper-shadow w-full max-w-lg rounded-[2rem] border border-[#e8e9e2] bg-white p-8 sm:p-11"><Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Back home</Link><div className="mt-11"><Wordmark/><p className="label mt-9">Your archive</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Keep every day close.</h1><p className="mt-5 max-w-sm leading-7 text-[#787b72]">A beautifully typeset PDF of your saved words and photos, made just for you.</p><a href="/api/export" className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-[#222420] px-5 py-3 text-sm font-semibold text-white"><Download size={16}/> Download my journal</a></div></section></main>;
}
