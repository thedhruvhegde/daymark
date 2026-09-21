"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const { error: signInError } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (signInError) setError(signInError.message); else setSent(true);
  }
  return <main className="grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="paper-shadow w-full max-w-md rounded-[2rem] border border-[#e8e9e2] bg-white p-8 sm:p-11"><Wordmark/><p className="label mt-10">A private practice</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Welcome to your days.</h1>{sent ? <p className="mt-6 rounded-2xl bg-[#edf5cf] p-4 text-sm leading-6">Your sign-in link is on its way. Check your inbox, then return here.</p> : <><p className="mt-4 leading-7 text-[#787b72]">Use your email to begin. No passwords to remember.</p><label className="mt-8 block text-sm font-semibold">Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] px-4 py-3 outline-none"/></label>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<button className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222420] py-3.5 text-sm font-semibold text-white"><Send size={16}/> Send magic link</button></>}<p className="mt-7 flex items-center gap-2 text-xs text-[#a5a89e]"><Mail size={14}/> Your journal is private, always.</p></form></main>;
}
