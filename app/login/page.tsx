"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/ernaehrungsplan";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Fit<span className="text-blue-600">Git</span> – Anmelden
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Melde dich mit deinem FitGit-Konto an, um deinen Ernährungsplan zu
          erstellen und zu tracken.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">E-Mail</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Passwort</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-neutral-900 py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Wird geprüft…" : "Einloggen"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-500">
        Noch kein Konto?{" "}
        <a href="https://fitgit.app" className="text-blue-600 underline">
          Auf fitgit.app registrieren
        </a>
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-neutral-400">Lädt…</div>}>
      <LoginForm />
    </Suspense>
  );
}
