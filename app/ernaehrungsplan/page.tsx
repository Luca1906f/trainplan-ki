import { NutritionPlanner } from '@/components/nutrition/NutritionPlanner';

// Admin-Bereich (hinter Passwort via proxy.ts) — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <NutritionPlanner />;
}
