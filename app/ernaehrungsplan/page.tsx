import { NutritionPlanner } from '@/components/nutrition/NutritionPlanner';

// Speichert pro eingeloggtem User — nicht statisch vorrendern.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <NutritionPlanner />;
}
