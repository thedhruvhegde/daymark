"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AccountButton({ initial }: { initial: string }) {
  const router = useRouter();
  async function signOut() {
    await createClient().auth.signOut();
    router.push("/auth");
  }
  return <button onClick={signOut} title="Sign out" className="focus-ring group grid h-10 w-10 place-items-center rounded-full bg-[#222420] text-sm font-semibold text-white" aria-label="Sign out"><span className="group-hover:hidden">{initial}</span><LogOut className="hidden group-hover:block" size={16}/></button>;
}
