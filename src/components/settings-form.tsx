"use client";

import Link from "next/link";
import { ArrowLeft, Check, LogOut } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = { email: string; firstName: string; lastName: string; timeZone: string };

export function SettingsForm({ email, firstName: initialFirstName, lastName: initialLastName, timeZone: initialTimeZone }: Props) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  async function saveProfile() {
    const response = await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ firstName, lastName, timeZone }) });
    setStatus(response.ok ? "Profile saved." : "Profile could not be saved.");
  }
  async function savePassword() {
    if (password.length < 6) { setStatus("Use at least six characters."); return; }
    const { error } = await createClient().auth.updateUser({ password });
    setStatus(error ? error.message : "Password saved. You can now sign in with it.");
    if (!error) setPassword("");
  }
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/auth");
  }
  return <section className="paper-shadow mx-auto max-w-xl rounded-[2rem] border border-[#e8e9e2] bg-white p-7 sm:p-10"><Link href="/dashboard" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft size={16}/> Back to Daymark</Link><p className="label mt-10">Settings</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Make it yours.</h1><p className="mt-3 text-sm text-[#787b72]">{email}</p><div className="mt-9 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">First name<input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] px-3 py-2.5 outline-none"/></label><label className="text-sm font-semibold">Last name<input value={lastName} onChange={(event) => setLastName(event.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] px-3 py-2.5 outline-none"/></label></div><label className="mt-4 block text-sm font-semibold">Time zone<select value={timeZone} onChange={(event) => setTimeZone(event.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-[#e8e9e2] bg-white px-3 py-2.5 outline-none">{Intl.supportedValuesOf("timeZone").map((zone) => <option key={zone}>{zone}</option>)}</select></label><button onClick={saveProfile} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-[#222420] px-5 py-3 text-sm font-semibold text-white"><Check size={16}/> Save profile</button><div className="mt-10 border-t border-[#e8e9e2] pt-7"><p className="text-sm font-semibold">Set or change password</p><p className="mt-1 text-sm leading-6 text-[#787b72]">Magic-link accounts can set a password here for future sign-ins.</p><div className="mt-3 flex gap-2"><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} placeholder="New password" className="focus-ring min-w-0 flex-1 rounded-xl border border-[#e8e9e2] px-3 py-2.5 outline-none"/><button onClick={savePassword} className="focus-ring rounded-xl bg-[#f1f2ed] px-4 text-sm font-semibold">Save</button></div></div><button onClick={signOut} className="focus-ring mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#787b72]"><LogOut size={16}/> Sign out</button>{status && <p className="mt-5 text-sm font-medium text-[#5d6640]">{status}</p>}</section>;
}
