export function FruitInfoNote() {
  return (
    <details className="rounded-lg border p-3 text-sm">
      <summary className="cursor-pointer text-foreground/80">Obst: Zucker & Kalorien</summary>
      <div className="mt-2 space-y-1 text-muted-foreground">
        <p>Am meisten: Trockenfrüchte (Datteln, Rosinen), Weintrauben, Mango, Banane, Kirschen.</p>
        <p>Am wenigsten: Beeren, Wassermelone, Grapefruit.</p>
        <p>Beeren sind die sichere Wahl — zuckerreiches Obst bewusst dosieren.</p>
      </div>
    </details>
  );
}
