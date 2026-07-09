export type ConsistencyEvent =
  | { type: 'nutrition_tracked'; date: string }
  | { type: 'nutrition_day_complete'; date: string };

// Platzhalter — Body an dein Mission-System hängen (Mission/Type/Rarity/Chain/Storyline).
// Rest des Codes bleibt unverändert.
export async function emitConsistencyEvent(e: ConsistencyEvent): Promise<void> {
  console.debug('consistency event', e);
}
