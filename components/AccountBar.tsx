"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export function AccountBar() {
  const router = useRouter();

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between border-b px-4 py-2 text-sm">
      <div className="flex gap-4">
        <Link href="/ernaehrungsplan" className="text-neutral-600 hover:text-neutral-900">
          Plan erstellen
        </Link>
        <Link href="/heute" className="text-neutral-600 hover:text-neutral-900">
          Heute
        </Link>
      </div>
      <button onClick={logout} className="text-neutral-500 hover:text-neutral-900">
        Abmelden
      </button>
    </div>
  );
}
