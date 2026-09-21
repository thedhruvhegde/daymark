"use client";

import { FormEvent, useState } from "react";
import { KeyRound, Mail, Send } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    const client = createClient();
    const result = mode === "sign-in" ? await client.auth.signInWithPassword({ email, password }) : await client.auth.signUp({ email, password, options: { data: { time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone } } });
    if (result.error) setError(result.error.message); else if (mode === "sign-in") router.push("/"); else setSent(true);
  }
  async function magicLink() {
    setError("");
    const { error: signInError } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    if (signInError) setError(signInError.message); else setSent(true);
  }
  return <main className="grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="paper-shadow w-full max-w-md rounded-[2rem] border border-[#e8e9e2] bg-white p-8 sm:p-11"><Wordmark/><p className="label mt-10">A private practice</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">{mode === "sign-in" ? "Welcome back." : "Start your practice."}</h1>{sent ? <p className="mt-6 rounded-2xl bg-[#edf5cf] p-4 text-sm leading-6">Check your inbox to confirm your account, then return here to sign in.</p> : <><p className="mt-4 leading-7 text-[#787b72]">Use a password once, then Daymark will remember this device.</p><label className="mt-8 block text-sm font-semibold">Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] px-4 py-3 outline-none"/></label><label className="mt-4 block text-sm font-semibold">Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required placeholder="At least 6 characters" className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] px-4 py-3 outline-none"/></label>{error && <p className="mt-3 text-sm text-red-700">{error}</p>}<button className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222420] py-3.5 text-sm font-semibold text-white"><KeyRound size={16}/>{mode === "sign-in" ? "Sign in" : "Create account"}</button><button type="button" onClick={() => setMode((current) => current === "sign-in" ? "sign-up" : "sign-in")} className="focus-ring mt-4 w-full text-sm font-semibold underline decoration-[#d9f16d] decoration-4 underline-offset-4">{mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</button><button type="button" onClick={magicLink} className="focus-ring mt-5 inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[#787b72]"><Send size={15}/> Send a magic link instead</button></>}<p className="mt-7 flex items-center gap-2 text-xs text-[#a5a89e]"><Mail size={14}/> Your journal is private, always.</p></form></main>;
}
