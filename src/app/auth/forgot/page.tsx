"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const { error } = await createClient().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/reset` });
    if (!error) setSent(true);
  }
  return <main className="grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="paper-shadow w-full max-w-md rounded-[2rem] border border-[#e8e9e2] bg-white p-8 sm:p-11"><Link href="/auth" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Sign in</Link><p className="label mt-10">Password reset</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Start fresh.</h1>{sent ? <p className="mt-6 rounded-2xl bg-[#edf5cf] p-4 text-sm">Check your inbox for a secure password-reset link.</p> : <><p className="mt-4 text-sm leading-6 text-[#787b72]">Enter your email and we&apos;ll send a reset link.</p><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" className="focus-ring mt-7 w-full rounded-xl border border-[#e8e9e2] px-4 py-3 outline-none"/><button className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222420] py-3.5 text-sm font-semibold text-white"><Send size={16}/> Send reset link</button></>}</form></main>;
}
