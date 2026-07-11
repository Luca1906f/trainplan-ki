"use client";

import { useState, FormEvent } from "react";
import SiteHeader from "@/components/SiteHeader";

type SplitWahl = "eigen" | "coach";

export default function Home() {
  const [splitWahl, setSplitWahl] = useState<SplitWahl>("coach");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      ziel: form.get("ziel"),
      level: form.get("level"),
      trainingstage: form.get("trainingstage"),
      splitWahl,
      splitWunsch: form.get("splitWunsch"),
      notizen: form.get("notizen"),
    };

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Etwas ist schiefgelaufen.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMessage("Verbindung fehlgeschlagen. Bitte später erneut versuchen.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-1 flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-20 dark:bg-black">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(212_60%_50%)]/10">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="hsl(212 60% 50%)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Danke für deine Anfrage!
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Wir haben alles erhalten und melden uns zeitnah bei dir mit deinem
              persönlichen Trainingsplan.
            </p>
            <a
              href="https://fitgit.app"
              className="mt-8 inline-block rounded-full bg-[hsl(212_60%_50%)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[hsl(212_60%_42%)]"
            >
              Zurück zur Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-[hsl(212_60%_50%)] focus:ring-2 focus:ring-[hsl(212_60%_50%)]/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
  const labelClass =
    "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% -10%, hsl(212 60% 50% / 0.18), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-2xl px-6 pt-16 pb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(212_60%_50%)]/30 bg-[hsl(212_60%_50%)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[hsl(212_60%_50%)]">
            FitGit Coaching · Training
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Dein <span className="text-[hsl(212_60%_50%)]">Trainingsplan</span>,
            zugeschnitten auf dich
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Sag mir dein Ziel und dein Level — den Rest übernehme ich. Wenn du
            schon einen Wunschsplit im Kopf hast, kannst du ihn gleich mitgeben.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {[
              "Auf dein Level abgestimmt",
              "Von Hand erstellt",
              "Anfrage kostenlos & unverbindlich",
            ].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="hsl(212 60% 50%)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 shrink-0"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto w-full max-w-2xl px-6 pb-20">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input name="name" type="text" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>E-Mail</label>
              <input name="email" type="email" required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ziel</label>
              <select name="ziel" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="muskelaufbau">Muskelaufbau</option>
                <option value="fettabbau">Fettabbau / Definition</option>
                <option value="kraftaufbau">Kraftaufbau</option>
                <option value="fitness">Allgemeine Fitness</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Erfahrungslevel</label>
              <select name="level" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="anfaenger">Anfänger</option>
                <option value="fortgeschritten">Fortgeschritten</option>
                <option value="profi">Profi</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Trainingstage pro Woche</label>
            <select
              name="trainingstage"
              required
              defaultValue=""
              className={inputClass}
            >
              <option value="" disabled>
                Bitte wählen
              </option>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className={labelClass}>Splitwunsch</span>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="splitWahlOption"
                  checked={splitWahl === "coach"}
                  onChange={() => setSplitWahl("coach")}
                  className="accent-[hsl(212_60%_50%)]"
                />
                Ich überlasse es FitGit
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="splitWahlOption"
                  checked={splitWahl === "eigen"}
                  onChange={() => setSplitWahl("eigen")}
                  className="accent-[hsl(212_60%_50%)]"
                />
                Ich habe einen Wunschsplit
              </label>
            </div>
            {splitWahl === "eigen" && (
              <textarea
                name="splitWunsch"
                rows={3}
                placeholder="z.B. 3er Split: Beine, Rücken, Brust"
                className={inputClass}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>
              Sonstiges (Verletzungen, Equipment, Notizen)
            </label>
            <textarea name="notizen" rows={2} className={inputClass} />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-[hsl(212_60%_50%)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[hsl(212_60%_42%)] disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Trainingsplan anfragen"}
          </button>
        </form>
      </section>
    </div>
  );
}
