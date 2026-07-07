"use client";

import { useState, FormEvent } from "react";

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
      <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 dark:bg-black">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Danke für deine Anfrage!
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Wir haben alles erhalten und melden uns zeitnah bei dir.
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
            Dein individueller Trainingsplan
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Sag uns dein Ziel — den Rest übernehmen wir. Wenn du schon einen
            Wunschsplit im Kopf hast, kannst du ihn uns gleich mitgeben.
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
                E-Mail
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
                name="ziel"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
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
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Erfahrungslevel
              </label>
              <select
                name="level"
                required
                defaultValue=""
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
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
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Trainingstage pro Woche
            </label>
            <select
              name="trainingstage"
              required
              defaultValue=""
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
            <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Splitwunsch
            </span>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="splitWahlOption"
                  checked={splitWahl === "coach"}
                  onChange={() => setSplitWahl("coach")}
                />
                Ich überlasse es FitGit
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="splitWahlOption"
                  checked={splitWahl === "eigen"}
                  onChange={() => setSplitWahl("eigen")}
                />
                Ich habe einen Wunschsplit
              </label>
            </div>
            {splitWahl === "eigen" && (
              <textarea
                name="splitWunsch"
                rows={3}
                placeholder="z.B. 3er Split: Beine, Rücken, Brust"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Sonstiges (Verletzungen, Equipment, Notizen)
            </label>
            <textarea
              name="notizen"
              rows={2}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {status === "sending" ? "Wird gesendet…" : "Anfrage senden"}
          </button>
        </form>
      </div>
    </div>
  );
}
