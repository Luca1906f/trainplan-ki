"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

export default function GeneratorLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Login fehlgeschlagen.");
        setLoading(false);
        return;
      }

      router.push("/generator");
      router.refresh();
    } catch {
      setError("Verbindung fehlgeschlagen.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(212_60%_50%)]">
              FitGit intern
            </p>
            <h1 className="mt-1 text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Generator – Login
            </h1>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Passwort"
            required
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-[hsl(212_60%_50%)] focus:ring-2 focus:ring-[hsl(212_60%_50%)]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[hsl(212_60%_50%)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[hsl(212_60%_42%)] disabled:opacity-60"
          >
            {loading ? "Prüfe…" : "Einloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
