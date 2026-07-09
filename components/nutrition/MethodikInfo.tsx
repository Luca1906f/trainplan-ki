import { NUTRITION_SOURCES } from '@/lib/nutrition/sources';

export function MethodikInfo() {
  return (
    <section className="space-y-3 text-sm">
      <p className="text-neutral-600">
        Deine Zielwerte kommen aus etablierten Formeln (Mifflin-St Jeor) und peer-reviewten
        Empfehlungen zu Protein (1,6–2,2 g/kg) und Abnehm-Tempo (0,5–1 %/Woche). Der Körpertyp ist
        ein Startpunkt, den du anpassen kannst.
      </p>
      <ul className="space-y-2">
        {NUTRITION_SOURCES.map((s) => (
          <li key={s.url} className="rounded-lg border p-3">
            <div className="text-neutral-700">{s.claim}</div>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 underline"
            >
              {s.title} — {s.ref}
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-neutral-400">
        Allgemeine Orientierung, keine medizinische oder diätetische Beratung. Bei Erkrankungen,
        Schwangerschaft, Essstörungen oder ernsten Allergien vorher abklären; Zutaten bei Allergien
        selbst prüfen.
      </p>
    </section>
  );
}
