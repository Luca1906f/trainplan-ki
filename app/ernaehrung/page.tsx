"use client";

import { useState, FormEvent } from "react";

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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Anfrage ist raus!
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Luca erstellt deinen Ernährungsplan von Hand und speichert ihn auf
            dein Konto. Sobald er fertig ist, taucht er in der TryMe-App unter
            deiner E-Mail auf.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-xl">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            FitGit Coaching
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Dein individueller Ernährungsplan
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Sag uns dein Ziel und ein paar Eckdaten — Luca baut dir daraus einen
            passenden Plan. Der landet direkt auf deinem Konto und wird in der
            TryMe-App unter deiner E-Mail ausgespielt.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                E-Mail (= dein TryMe-Konto)
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ziel
              </label>
              <select
                name="goal"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="cut">Abnehmen / Definition</option>
                <option value="maintain">Gewicht halten</option>
                <option value="bulk">Aufbauen / Zunehmen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Ernährungsform
              </label>
              <select
                name="dietStyle"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Geschlecht
              </label>
              <select
                name="sex"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="male">männlich</option>
                <option value="female">weiblich</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Alter
              </label>
              <input
                name="age"
                type="number"
                min={12}
                max={100}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Größe (cm)
              </label>
              <input
                name="heightCm"
                type="number"
                min={120}
                max={230}
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Gewicht (kg)
              </label>
              <input
                name="weightKg"
                type="number"
                min={35}
                max={250}
                step="0.1"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Allergien / Unverträglichkeiten
              </label>
              <input
                name="allergies"
                type="text"
                placeholder="z.B. Laktose, Nüsse"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Vorlieben / Abneigungen (optional)
            </label>
            <textarea
              name="preferences"
              rows={3}
              placeholder="z.B. mag kein Fisch, brauche schnelle Rezepte, koche abends warm"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
            <input
              type="checkbox"
              name="healthConsent"
              required
              className="mt-1 h-4 w-4 shrink-0 accent-red-600"
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
                className="text-red-600 underline"
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
            className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Ernährungsplan anfragen"}
          </button>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-500">
            Keine ärztliche Beratung. Kein Fertig-Plan aus dem Automaten — Luca
            erstellt ihn selbst und spielt ihn an dein TryMe-Konto aus.
          </p>
        </form>
      </div>
    </div>
  );
}
