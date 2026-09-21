"use client";

import { FormEvent, useState } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const { error } = await createClient().auth.updateUser({ password });
    setMessage(error ? error.message : "Password updated. You can now return to Daymark.");
  }
  return <main className="grid min-h-screen place-items-center px-5"><form onSubmit={submit} className="paper-shadow w-full max-w-md rounded-[2rem] border border-[#e8e9e2] bg-white p-8 sm:p-11"><p className="label">Password reset</p><h1 className="mt-2 text-4xl font-semibold tracking-[-.07em]">Choose a new password.</h1><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={6} required placeholder="At least 6 characters" className="focus-ring mt-7 w-full rounded-xl border border-[#e8e9e2] px-4 py-3 outline-none"/><button className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222420] py-3.5 text-sm font-semibold text-white"><KeyRound size={16}/> Save password</button>{message && <p className="mt-5 text-sm text-[#5d6640]">{message}</p>}</form></main>;
}
