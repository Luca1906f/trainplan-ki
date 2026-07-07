"use client";

import { useState, FormEvent } from "react";

interface DayInput {
  name: string;
  exerciseCount: number;
}

export default function GeneratorPage() {
  const [planName, setPlanName] = useState("");
  const [clientName, setClientName] = useState("");
  const [days, setDays] = useState<DayInput[]>([{ name: "", exerciseCount: 6 }]);
  const [status, setStatus] = useState<"idle" | "generating" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function updateDay(index: number, patch: Partial<DayInput>) {
    setDays((prev) =>
      prev.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    );
  }

  function addDay() {
    setDays((prev) => [...prev, { name: "", exerciseCount: 6 }]);
  }

  function removeDay(index: number) {
    setDays((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("generating");
    setErrorMessage("");

    try {
      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName, clientName, days }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || "Generierung fehlgeschlagen.");
        setStatus("error");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] || "FitGit-Trainingsplan.docx";

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus("idle");
    } catch {
      setErrorMessage("Verbindung fehlgeschlagen.");
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="w-full max-w-2xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
            FitGit intern
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Word-Vorlagen-Generator
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Split festlegen, Übungsanzahl pro Tag angeben — die Vorlage mit
            leeren Tabellen (Übung/Sätze/Wiederholungen/Gewicht) wird als
            .docx generiert.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Plan-/Split-Name (optional)
              </label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="z.B. 3er Split – Klassisch"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kundenname (optional)
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Trainingstage
            </span>
            {days.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="text"
                  required
                  value={day.name}
                  onChange={(e) => updateDay(index, { name: e.target.value })}
                  placeholder={`Tag ${index + 1}, z.B. Brust`}
                  className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <input
                  type="number"
                  min={1}
                  max={20}
                  required
                  value={day.exerciseCount}
                  onChange={(e) =>
                    updateDay(index, { exerciseCount: Number(e.target.value) })
                  }
                  className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
                <span className="text-xs text-zinc-500">Übungen</span>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDay(index)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Entfernen
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDay}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              + Tag hinzufügen
            </button>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={status === "generating"}
            className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {status === "generating" ? "Generiere…" : "Word-Vorlage generieren"}
          </button>
        </form>
      </div>
    </div>
  );
}
