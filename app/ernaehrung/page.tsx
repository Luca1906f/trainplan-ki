"use client";

import { useState, FormEvent } from "react";

function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="https://fitgit.app" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(212_60%_50%)] text-sm font-bold text-white">
            FG
          </span>
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Fit<span className="text-[hsl(212_60%_50%)]">Git</span>
          </span>
        </a>
        <a
          href="https://fitgit.app"
          className="text-sm text-zinc-500 transition-colors hover:text-[hsl(212_60%_50%)] dark:text-zinc-400"
        >
          ← Zurück zur Website
        </a>
      </div>
    </header>
  );
}

export default function ErnaehrungAnfrage() {
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
      goal: form.get("goal"),
      sex: form.get("sex"),
      age: form.get("age"),
      heightCm: form.get("heightCm"),
      weightKg: form.get("weightKg"),
      dietStyle: form.get("dietStyle"),
      preferences: form.get("preferences"),
      allergies: form.get("allergies"),
      healthConsent: form.get("healthConsent") === "on",
    };

    try {
      const res = await fetch("/api/nutrition-request", {
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
      setErrorMessage(
        "Verbindung fehlgeschlagen. Bitte später erneut versuchen.",
      );
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
              Anfrage ist raus!
            </h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-400">
              Luca erstellt deinen Ernährungsplan von Hand und speichert ihn auf
              dein Konto. Sobald er fertig ist, taucht er in der TryMe-App unter
              deiner E-Mail auf.
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
            FitGit Coaching · Ernährung
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Dein Ernährungsplan —{" "}
            <span className="text-[hsl(212_60%_50%)]">von Luca</span>, nicht vom
            Automaten
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Sag mir dein Ziel und ein paar Eckdaten. Ich baue dir daraus einen
            Plan, der zu deinem Alltag passt — und spiele ihn direkt an dein
            TryMe-Konto aus.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            {[
              "Von Hand erstellt",
              "Landet in deiner TryMe-App",
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
              <label className={labelClass}>E-Mail (= dein TryMe-Konto)</label>
              <input name="email" type="email" required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ziel</label>
              <select name="goal" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="cut">Abnehmen / Definition</option>
                <option value="maintain">Gewicht halten</option>
                <option value="bulk">Aufbauen / Zunehmen</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Ernährungsform</label>
              <select
                name="dietStyle"
                required
                defaultValue=""
                className={inputClass}
              >
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="omnivore">Omnivor (alles)</option>
                <option value="vegetarian">Vegetarisch</option>
                <option value="vegan">Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Geschlecht</label>
              <select name="sex" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="male">männlich</option>
                <option value="female">weiblich</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Alter</label>
              <input
                name="age"
                type="number"
                min={12}
                max={100}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Größe (cm)</label>
              <input
                name="heightCm"
                type="number"
                min={120}
                max={230}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Gewicht (kg)</label>
              <input
                name="weightKg"
                type="number"
                min={35}
                max={250}
                step="0.1"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Allergien / Unverträglichkeiten</label>
              <input
                name="allergies"
                type="text"
                placeholder="z.B. Laktose, Nüsse"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Vorlieben / Abneigungen (optional)</label>
            <textarea
              name="preferences"
              rows={3}
              placeholder="z.B. mag kein Fisch, brauche schnelle Rezepte, koche abends warm"
              className={inputClass}
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <input
              type="checkbox"
              name="healthConsent"
              required
              className="mt-1 h-4 w-4 shrink-0 accent-[hsl(212_60%_50%)]"
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              Ich willige ausdrücklich ein, dass meine Gesundheitsdaten (Größe,
              Gewicht, Geschlecht, Alter, Ziel, Ernährungsform, Allergien) zur
              Erstellung meines Ernährungsplans verarbeitet und dafür an den
              KI-Dienst Claude (Anthropic) übermittelt werden — ohne Name und
              E-Mail-Adresse (Art. 9 Abs. 2 lit. a DSGVO). Freiwillig, jederzeit
              widerrufbar.{" "}
              <a
                href="https://fitgit.app/datenschutz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(212_60%_50%)] underline"
              >
                Datenschutzerklärung
              </a>
            </span>
          </label>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-[hsl(212_60%_50%)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[hsl(212_60%_42%)] disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Ernährungsplan anfragen"}
          </button>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
            Keine ärztliche Beratung. Kein Fertig-Plan aus dem Automaten — Luca
            erstellt ihn selbst und spielt ihn an dein TryMe-Konto aus.
          </p>
        </form>
      </section>
    </div>
  );
}
